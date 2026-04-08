import portfolioContext from '../data/portfolio-context.json';
import cvData from '../data/cv.json';

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

function toSseData(text: string): string {
  return `data: ${text.replace(/\r?\n/g, '\ndata: ')}\n\n`;
}

function startSse(res: StreamingResponse): void {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
}

type RateBucket = {
  count: number;
  resetAt: number;
};

type CacheEntry = {
  value: string;
  expiresAt: number;
};

type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  keywords: string[];
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
const RELEVANT_CHUNK_LIMIT = 6;
const ADMIN_KEY = process.env.CHAT_ADMIN_KEY ?? '';
const MAX_DYNAMIC_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_DYNAMIC_OUTPUT_TOKENS ?? 700);

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

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(' ')
    .filter((token) => token.length > 2);
}

function makeChunk(id: string, title: string, text: string): KnowledgeChunk {
  return {
    id,
    title,
    text,
    keywords: tokenize(`${title} ${text}`),
  };
}

function buildKnowledgeChunks(): KnowledgeChunk[] {
  const projectChunks = portfolioContext.projects.map((project) =>
    makeChunk(
      `portfolio-project-${project.name}`,
      `Project: ${project.name}`,
      `${project.summary}. Stack: ${project.stack.join(', ')}.`,
    ),
  );

  const portfolioChunks = [
    makeChunk('portfolio-profile', 'Profile', `${portfolioContext.profile.name}. ${portfolioContext.profile.role}. Location: ${portfolioContext.profile.location}.`),
    makeChunk('portfolio-about', 'About', portfolioContext.about.join(' ')),
    makeChunk('portfolio-skills', 'Skills', `Languages: ${portfolioContext.skills.languages.join(', ')}. Frameworks: ${portfolioContext.skills.frameworks.join(', ')}. Tools: ${portfolioContext.skills.tools.join(', ')}. Databases: ${portfolioContext.skills.databases.join(', ')}.`),
    makeChunk('portfolio-contact', 'Contact', `Email: ${portfolioContext.contact.email}. Availability: ${portfolioContext.contact.available}.`),
  ];

  const cvChunks = [
    makeChunk('cv-summary', 'CV Summary', cvData.summary),
    makeChunk('cv-headline', 'CV Headline', cvData.headline),
    makeChunk('cv-location', 'CV Location', cvData.location),
    makeChunk(
      'cv-education',
      'CV Education',
      cvData.education.map((entry) => `${entry.school} (${entry.period}): ${entry.details}`).join(' '),
    ),
    makeChunk(
      'cv-skills',
      'CV Skills',
      `Languages: ${cvData.skills.languages.join(', ')}. Frameworks: ${cvData.skills.frameworks.join(', ')}. Tools: ${cvData.skills.tools.join(', ')}. Databases: ${cvData.skills.databases.join(', ')}.`,
    ),
    makeChunk('cv-experience', 'CV Experience Notes', cvData.experienceNotes.join(' ')),
    makeChunk('cv-projects', 'CV Projects', cvData.projects.join(' ')),
    makeChunk('cv-contact', 'CV Contact', `Email: ${cvData.contact.email}. Status: ${cvData.contact.status}.`),
    makeChunk('cv-facts', 'CV Facts', cvData.facts.join(' ')),
  ];

  return [...portfolioChunks, ...projectChunks, ...cvChunks];
}

function selectRelevantChunks(message: string, history: ChatMessage[], lang: Lang): KnowledgeChunk[] {
  const query = normalizeText([
    message,
    ...history.map((entry) => entry.content),
    lang,
  ].join(' '));
  const queryTokens = tokenize(query);
  const chunks = buildKnowledgeChunks();

  const scored = chunks
    .map((chunk) => {
      let score = 0;

      for (const token of queryTokens) {
        if (chunk.keywords.includes(token)) {
          score += 2;
        }
      }

      if (/where|location|live|based|located|sits|عيش|ساكن|أين|o\u00f9|habite/i.test(query)) {
        if (chunk.id === 'portfolio-profile' || chunk.id === 'cv-location' || chunk.id === 'cv-facts') {
          score += 5;
        }
      }

      if (/contact|email|reach|hire|collaborat|tواصل|contacto|mail/i.test(query)) {
        if (chunk.id === 'portfolio-contact' || chunk.id === 'cv-contact') {
          score += 5;
        }
      }

      if (/project|work|portfolio|build|projet|مشروع/i.test(query)) {
        if (chunk.id.startsWith('portfolio-project-') || chunk.id === 'cv-projects') {
          score += 4;
        }
      }

      if (/skill|tech|stack|language|framework|comp[ée]tence|مهار/i.test(query)) {
        if (chunk.id === 'portfolio-skills' || chunk.id === 'cv-skills') {
          score += 4;
        }
      }

      if (/education|study|school|background|formation|تعليم|دراسة/i.test(query)) {
        if (chunk.id === 'portfolio-about' || chunk.id === 'cv-education' || chunk.id === 'cv-summary') {
          score += 4;
        }
      }

      if (/who are you|name|qui es-tu|اسمك/i.test(query)) {
        if (chunk.id === 'portfolio-profile' || chunk.id === 'cv-summary' || chunk.id === 'cv-headline') {
          score += 5;
        }
      }

      return { chunk, score };
    })
    .sort((left, right) => right.score - left.score)
    .filter((entry) => entry.score > 0)
    .slice(0, RELEVANT_CHUNK_LIMIT)
    .map((entry) => entry.chunk);

  if (scored.length > 0) {
    return scored;
  }

  return chunks.filter((chunk) => ['portfolio-profile', 'portfolio-about', 'portfolio-skills', 'portfolio-contact', 'cv-summary'].includes(chunk.id)).slice(0, RELEVANT_CHUNK_LIMIT);
}

function buildSystemPrompt(lang: Lang, message: string, history: ChatMessage[]): string {
  const relevantChunks = selectRelevantChunks(message, history, lang);
  const evidenceBlock = relevantChunks
    .map((chunk) => `- ${chunk.title}: ${chunk.text}`)
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
${portfolioContext.projects
  .map((project) => `- ${project.name}: ${project.summary} (${project.stack.join(', ')})`)
  .join('\n')}

Contact:
- Email: ${portfolioContext.contact.email}
- ${portfolioContext.contact.available}

Relevant evidence from portfolio and CV:
${evidenceBlock}

Rules:
${portfolioContext.rules.map((rule) => `- ${rule}`).join('\n')}
- If relevant evidence exists, synthesize the answer from it instead of guessing.
- If the evidence is incomplete, say what is missing.
- If the user asks multiple questions in one prompt, answer all of them in the same reply.
- For multiple questions, structure the response as a numbered list (one item per question) and keep each item concise.
- ${getLanguageInstruction(lang)}
`.trim();
}

function estimateOutputTokens(message: string): number {
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const questionMarkCount = (message.match(/[?؟]/g) ?? []).length;
  const listLikeCount = lines.filter((line) => /^(-|\*|\d+[.)])\s+/.test(line)).length;

  const inferredQuestions = Math.max(questionMarkCount, listLikeCount, lines.length > 1 ? lines.length : 1);
  const dynamic = MAX_OUTPUT_TOKENS + Math.max(0, inferredQuestions - 1) * 90;

  return Math.min(MAX_DYNAMIC_OUTPUT_TOKENS, Math.max(MAX_OUTPUT_TOKENS, dynamic));
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
      max_tokens: estimateOutputTokens(message),
      stream: Boolean(onToken),
      messages: [
        { role: 'system', content: buildSystemPrompt(lang, message, history).slice(0, SYSTEM_PROMPT_MAX_CHARS) },
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
      startSse(res);
      res.write(toSseData(cached));
      res.write('event: done\ndata: [DONE]\n\n');
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
      startSse(res);

      const reply = await callLlm(message, history, lang, (token) => {
        res.write(toSseData(token));
      });

      setCachedAnswer(message, reply, lang);
      usageStats.successfulRequests += 1;
      res.write('event: done\ndata: [DONE]\n\n');
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

      startSse(res);
      res.write('event: error\n');
      res.write(toSseData(streamErrorMessage));
      res.write('event: done\ndata: [DONE]\n\n');
      res.end();
      return;
    }

    res.status(500).json({
      error: 'AI assistant is currently unavailable. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? messageText : undefined,
    });
  }
}
