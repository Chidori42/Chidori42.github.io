import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import portfolioContext from './data/portfolio-context.json' with { type: 'json' };

const rootDir = path.dirname(fileURLToPath(import.meta.url));

Object.assign(process.env, loadEnv('development', rootDir, ''));

const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const LIMIT_REQUESTS_PER_WINDOW = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR ?? 10);
const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP ?? 200);
const MAX_INPUT_CHARS = Number(process.env.CHAT_MAX_INPUT_CHARS ?? 500);
const MAX_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_OUTPUT_TOKENS ?? 250);
const REQUEST_TIMEOUT_MS = Number(process.env.CHAT_TIMEOUT_MS ?? 10_000);
const CACHE_TTL_MS = Number(process.env.CHAT_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);
const SYSTEM_PROMPT_MAX_CHARS = 3500;
const ADMIN_KEY = process.env.CHAT_ADMIN_KEY ?? '';

const IP_BUCKETS = new Map();
const QUESTION_CACHE = new Map();
let dayKey = new Date().toISOString().slice(0, 10);
let dayCount = 0;
const usageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  dailyCapHits: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

function normalizeLang(input) {
  if (input === 'fr' || input === 'ar') return input;
  return 'en';
}

function getLanguageInstruction(lang) {
  if (lang === 'fr') return 'Respond in French.';
  if (lang === 'ar') return 'Respond in Arabic.';
  return 'Respond in English.';
}

function buildSystemPrompt(lang) {
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

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw && typeof raw === 'string') return raw.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isAuthorizedAdmin(req) {
  const normalizedServerKey = ADMIN_KEY.trim();
  if (!normalizedServerKey) return false;
  const header = req.headers['x-admin-key'];
  const key = (Array.isArray(header) ? header[0] : header)?.trim();
  return key === normalizedServerKey;
}

function refreshDailyBucket() {
  const currentDay = new Date().toISOString().slice(0, 10);
  if (currentDay !== dayKey) {
    dayKey = currentDay;
    dayCount = 0;
  }
}

function getLimitStatus() {
  refreshDailyBucket();
  return {
    rateLimitPerHour: LIMIT_REQUESTS_PER_WINDOW,
    dailyCap: DAILY_CAP,
    dailyCount: dayCount,
    dailyRemaining: Math.max(0, DAILY_CAP - dayCount),
    cacheSize: QUESTION_CACHE.size,
  };
}

function trimHistory(history = []) {
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 400) }));
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = IP_BUCKETS.get(ip);

  if (!bucket || now > bucket.resetAt) {
    IP_BUCKETS.set(ip, { count: 1, resetAt: now + LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= LIMIT_REQUESTS_PER_WINDOW) return true;

  bucket.count += 1;
  return false;
}

function isDailyCapReached() {
  refreshDailyBucket();
  if (dayCount >= DAILY_CAP) return true;
  dayCount += 1;
  return false;
}

function getCachedAnswer(question, lang) {
  const key = `${lang}::${question.trim().toLowerCase()}`;
  const item = QUESTION_CACHE.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    QUESTION_CACHE.delete(key);
    return null;
  }
  return item.value;
}

function setCachedAnswer(question, value, lang) {
  const key = `${lang}::${question.trim().toLowerCase()}`;
  QUESTION_CACHE.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function callLlm(message, history, lang) {
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

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'I could not generate a response this time.';
  } finally {
    clearTimeout(timeout);
  }
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function handlePortfolioChat(req, res) {
  if (req.method === 'GET') {
    if (!isAuthorizedAdmin(req)) {
      sendJson(res, 401, {
        error: ADMIN_KEY.trim()
          ? 'Invalid admin key. Enter the same value as CHAT_ADMIN_KEY on the server.'
          : 'CHAT_ADMIN_KEY is not configured on the server.',
      });
      return;
    }

    sendJson(res, 200, { stats: usageStats, limits: getLimitStatus(), hasAdminKey: Boolean(ADMIN_KEY) });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  usageStats.totalRequests += 1;

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    usageStats.rateLimitedRequests += 1;
    usageStats.failedRequests += 1;
    sendJson(res, 429, { error: 'Rate limit reached. Try again later.' });
    return;
  }

  if (isDailyCapReached()) {
    usageStats.dailyCapHits += 1;
    usageStats.failedRequests += 1;
    sendJson(res, 503, { error: 'AI assistant is at its daily limit. Please try tomorrow.' });
    return;
  }

  const body = await readJsonBody(req);
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    usageStats.failedRequests += 1;
    sendJson(res, 400, { error: 'Message is required.' });
    return;
  }

  if (message.length > MAX_INPUT_CHARS) {
    usageStats.failedRequests += 1;
    sendJson(res, 400, { error: `Message too long. Max ${MAX_INPUT_CHARS} chars.` });
    return;
  }

  const lang = normalizeLang(body.lang);
  const cached = getCachedAnswer(message, lang);
  if (cached) {
    usageStats.cacheHits += 1;
    usageStats.successfulRequests += 1;
    sendJson(res, 200, { reply: cached, cached: true });
    return;
  }

  usageStats.cacheMisses += 1;

  try {
    const history = trimHistory(body.history);
    const reply = await callLlm(message, history, lang);
    setCachedAnswer(message, reply, lang);
    usageStats.successfulRequests += 1;
    sendJson(res, 200, { reply, cached: false });
  } catch (error) {
    usageStats.failedRequests += 1;
    const messageText = error instanceof Error ? error.message : 'Unknown AI error';

    if (messageText === 'LLM_QUOTA_EXCEEDED') {
      sendJson(res, 429, {
        error: 'OpenAI quota exceeded. Please check your plan and billing, then try again.',
      });
      return;
    }

    if (messageText === 'LLM_INVALID_API_KEY') {
      sendJson(res, 401, {
        error: 'Invalid LLM_API_KEY. Update your .env and restart the dev server.',
      });
      return;
    }

    sendJson(res, 500, { error: 'AI assistant is currently unavailable. Please try again later.', details: process.env.NODE_ENV === 'development' ? messageText : undefined });
  }
}

const vite = await createViteServer({
  configFile: false,
  plugins: [react()],
  server: { middlewareMode: true },
  appType: 'spa',
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
});

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const { pathname } = requestUrl;

  if (pathname === '/api/portfolio-chat') {
    await handlePortfolioChat(req, res);
    return;
  }

  vite.middlewares(req, res, async () => {
    // Fall through to Vite's HTML handling.
  });
});

const port = Number(process.env.PORT ?? 5173);
server.listen(port);