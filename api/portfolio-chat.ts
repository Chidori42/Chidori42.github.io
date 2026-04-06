import portfolioContext from '../data/portfolio-context.json';

type ChatRole = 'user' | 'assistant';
type Lang = 'en' | 'fr' | 'ar';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  message?: string;
  history?: ChatMessage[];
  lang?: Lang;
  stream?: boolean;
};

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  body?: unknown;
  url?: string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  write?: (chunk: string) => void;
  end?: () => void;
};

type StreamingResponse = VercelResponse & {
  write: (chunk: string) => void;
  end: () => void;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

type CacheEntry = {
  value: string;
  expiresAt: number;
};

type UsageStats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  dailyCapHits: number;
  cacheHits: number;
  cacheMisses: number;
};

const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const LIMIT_REQUESTS_PER_WINDOW = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR ?? 10);
const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP ?? 200);
const MAX_INPUT_CHARS = Number(process.env.CHAT_MAX_INPUT_CHARS ?? 500);
const MAX_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_OUTPUT_TOKENS ?? 250);
const REQUEST_TIMEOUT_MS = Number(process.env.CHAT_TIMEOUT_MS ?? 10_000);
const CACHE_TTL_MS = Number(process.env.CHAT_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);
const SYSTEM_PROMPT_MAX_CHARS = 3500;
const ADMIN_KEY = process.env.CHAT_ADMIN_KEY ?? '';

const IP_BUCKETS = new Map<string, RateBucket>();
const QUESTION_CACHE = new Map<string, CacheEntry>();
let dayKey = new Date().toISOString().slice(0, 10);
let dayCount = 0;
const usageStats: UsageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  dailyCapHits: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

function normalizeLang(input: unknown): Lang {
  if (input === 'fr' || input === 'ar') {
    return input;
  }

  return 'en';
}

function getLanguageInstruction(lang: Lang): string {
  if (lang === 'fr') {
    return 'Respond in French.';
  }

  if (lang === 'ar') {
    return 'Respond in Arabic.';
  }

  return 'Respond in English.';
}

function buildSystemPrompt(lang: Lang): string {
  const projectLines = portfolioContext.projects
    .map((project) => `- ${project.name}: ${project.summary} (${project.stack.join(', ')})`)
    .join('\n');

  return `
Name: ${portfolioContext.profile.name}
Location: ${portfolioContext.profile.location}
Role: ${portfolioContext.profile.role}

About:
${portfolioContext.about.map((line) => `- ${line}`).join('\n')}

Key skills:
- Languages: ${portfolioContext.skills.languages.join(', ')}
- Frameworks: ${portfolioContext.skills.frameworks.join(', ')}
- Tools: ${portfolioContext.skills.tools.join(', ')}
- Databases: ${portfolioContext.skills.databases.join(', ')}

Projects:
${projectLines}

Contact:
- Email: ${portfolioContext.contact.email}
- ${portfolioContext.contact.available}

Rules:
${portfolioContext.rules.map((rule) => `- ${rule}`).join('\n')}
- ${getLanguageInstruction(lang)}
`.trim();
}

function getClientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw && typeof raw === 'string') {
    return raw.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function isAuthorizedAdmin(req: VercelRequest): boolean {
  const normalizedServerKey = ADMIN_KEY.trim();
  if (!normalizedServerKey) {
    return false;
  }

  const header = req.headers['x-admin-key'];
  const key = (Array.isArray(header) ? header[0] : header)?.trim();
  return key === normalizedServerKey;
}

function getLimitStatus() {
  const currentDay = new Date().toISOString().slice(0, 10);
  if (currentDay !== dayKey) {
    dayKey = currentDay;
    dayCount = 0;
  }

  return {
    rateLimitPerHour: LIMIT_REQUESTS_PER_WINDOW,
    dailyCap: DAILY_CAP,
    dailyCount: dayCount,
    dailyRemaining: Math.max(0, DAILY_CAP - dayCount),
    cacheSize: QUESTION_CACHE.size,
  };
}

function trimHistory(history: ChatMessage[] = []): ChatMessage[] {
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 400) }));
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = IP_BUCKETS.get(ip);

  if (!bucket || now > bucket.resetAt) {
    IP_BUCKETS.set(ip, { count: 1, resetAt: now + LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= LIMIT_REQUESTS_PER_WINDOW) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function isDailyCapReached(): boolean {
  const currentDay = new Date().toISOString().slice(0, 10);
  if (currentDay !== dayKey) {
    dayKey = currentDay;
    dayCount = 0;
  }

  if (dayCount >= DAILY_CAP) {
    return true;
  }

  dayCount += 1;
  return false;
}

function getCachedAnswer(question: string, lang: Lang): string | null {
  const key = `${lang}::${question.trim().toLowerCase()}`;
  const item = QUESTION_CACHE.get(key);
  if (!item) {
    return null;
  }

  if (Date.now() > item.expiresAt) {
    QUESTION_CACHE.delete(key);
    return null;
  }

  return item.value;
}

function setCachedAnswer(question: string, value: string, lang: Lang): void {
  const key = `${lang}::${question.trim().toLowerCase()}`;
  QUESTION_CACHE.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function supportsStreaming(res: VercelResponse): res is StreamingResponse {
  return typeof res.write === 'function' && typeof res.end === 'function';
}

async function callLlm(
  message: string,
  history: ChatMessage[],
  lang: Lang,
  onToken?: (token: string) => void,
): Promise<string> {
  const apiUrl = process.env.LLM_API_URL ?? 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL ?? 'gpt-4o-mini';
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error('Server is missing LLM_API_KEY');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      model,
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
      stream: Boolean(onToken),
      messages: [
        { role: 'system', content: buildSystemPrompt(lang).slice(0, SYSTEM_PROMPT_MAX_CHARS) },
        ...history,
        { role: 'user', content: message },
      ],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();

      if (response.status === 429 && errText.includes('insufficient_quota')) {
        throw new Error('LLM_QUOTA_EXCEEDED');
      }

      if (response.status === 401) {
        throw new Error('LLM_INVALID_API_KEY');
      }

      throw new Error(`LLM_HTTP_${response.status}: ${errText.slice(0, 500)}`);
    }

    if (onToken) {
      if (!response.body) {
        throw new Error('LLM_EMPTY_STREAM');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReply = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) {
            continue;
          }

          const dataLine = line.slice(5).trim();
          if (!dataLine || dataLine === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(dataLine) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const token = parsed.choices?.[0]?.delta?.content;
            if (!token) {
              continue;
            }

            fullReply += token;
            onToken(token);
          } catch {
            // Ignore malformed provider chunks and keep streaming.
          }
        }
      }

      const trailing = decoder.decode();
      if (trailing) {
        buffer += trailing;
      }

      return fullReply.trim() || 'I could not generate a response this time.';
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content?.trim() || 'I could not generate a response this time.';
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    if (!isAuthorizedAdmin(req)) {
      res.status(401).json({
        error: ADMIN_KEY.trim()
          ? 'Invalid admin key. Enter the same value as CHAT_ADMIN_KEY on the server.'
          : 'CHAT_ADMIN_KEY is not configured on the server.',
      });
      return;
    }

    res.status(200).json({
      stats: usageStats,
      limits: getLimitStatus(),
      hasAdminKey: Boolean(ADMIN_KEY),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  usageStats.totalRequests += 1;

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    usageStats.rateLimitedRequests += 1;
    usageStats.failedRequests += 1;
    res.status(429).json({ error: 'Rate limit reached. Try again later.' });
    return;
  }

  if (isDailyCapReached()) {
    usageStats.dailyCapHits += 1;
    usageStats.failedRequests += 1;
    res.status(503).json({ error: 'AI assistant is at its daily limit. Please try tomorrow.' });
    return;
  }

  const body = (req.body ?? {}) as ChatRequestBody;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const wantsStream = body.stream !== false;

  if (!message) {
    usageStats.failedRequests += 1;
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  if (message.length > MAX_INPUT_CHARS) {
    usageStats.failedRequests += 1;
    res.status(400).json({ error: `Message too long. Max ${MAX_INPUT_CHARS} chars.` });
    return;
  }

  const lang = normalizeLang(body.lang);

  const cached = getCachedAnswer(message, lang);
  if (cached) {
    usageStats.cacheHits += 1;
    usageStats.successfulRequests += 1;

    if (wantsStream && supportsStreaming(res)) {
      res.status(200);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.write(cached);
      res.end();
      return;
    }

    res.status(200).json({ reply: cached, cached: true });
    return;
  }

  usageStats.cacheMisses += 1;

  try {
    const history = trimHistory(body.history);

    if (wantsStream && supportsStreaming(res)) {
      res.status(200);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const reply = await callLlm(message, history, lang, (token) => {
        res.write(token);
      });

      setCachedAnswer(message, reply, lang);
      usageStats.successfulRequests += 1;
      res.end();
      return;
    }

    const reply = await callLlm(message, history, lang);
    setCachedAnswer(message, reply, lang);
    usageStats.successfulRequests += 1;
    res.status(200).json({ reply, cached: false });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown AI error';
    usageStats.failedRequests += 1;

    if (messageText === 'LLM_QUOTA_EXCEEDED') {
      res.status(429).json({
        error: 'OpenAI quota exceeded. Please check your plan and billing, then try again.',
      });
      return;
    }

    if (messageText === 'LLM_INVALID_API_KEY') {
      res.status(401).json({
        error: 'Invalid LLM_API_KEY. Update your .env and restart the dev server.',
      });
      return;
    }

    if (wantsStream && supportsStreaming(res)) {
      const streamErrorMessage =
        messageText === 'LLM_QUOTA_EXCEEDED'
          ? 'OpenAI quota exceeded. Please check your plan and billing, then try again.'
          : messageText === 'LLM_INVALID_API_KEY'
            ? 'Invalid LLM_API_KEY. Update your .env and restart the dev server.'
            : 'AI assistant is currently unavailable. Please try again later.';

      res.status(200);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.write(streamErrorMessage);
      res.end();
      return;
    }

    res.status(500).json({
      error: 'AI assistant is currently unavailable. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? messageText : undefined,
    });
  }
}
