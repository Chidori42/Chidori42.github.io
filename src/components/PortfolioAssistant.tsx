import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bot, MessageSquare, Send, Shield, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ChatRole = 'user' | 'assistant';

type UiMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ApiResponse = {
  reply?: string;
  error?: string;
  details?: string;
  cached?: boolean;
};

type ReplyMode = 'live' | 'fallback';

type AdminResponse = {
  stats?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    rateLimitedRequests: number;
    dailyCapHits: number;
    cacheHits: number;
    cacheMisses: number;
  };
  limits?: {
    rateLimitPerHour: number;
    dailyCap: number;
    dailyCount: number;
    dailyRemaining: number;
    cacheSize: number;
  };
  error?: string;
};

const MAX_INPUT_CHARS = Number(import.meta.env.VITE_CHAT_MAX_INPUT_CHARS ?? 500);
const CLIENT_COOLDOWN_MS = Number(import.meta.env.VITE_CHAT_COOLDOWN_MS ?? 6000);

const SUGGESTED_QUESTIONS = {
  en: [
    'What are your strongest skills?',
    'Tell me about your best project.',
    'What is your education background?',
    'How can I contact you?',
  ],
  fr: [
    'Quelles sont tes competences principales ?',
    'Parle-moi de ton meilleur projet.',
    'Quel est ton parcours de formation ?',
    'Comment te contacter ?',
  ],
  ar: [
    'ما هي اقوى مهاراتك؟',
    'حدثني عن افضل مشروع لديك.',
    'ما هو مسارك الدراسي؟',
    'كيف يمكنني التواصل معك؟',
  ],
};

const FALLBACK_KNOWLEDGE = {
  en: [
    {
      match: /skill|tech|stack|language|framework/i,
      answer:
        'Core skills include C, C++, JavaScript, TypeScript, React, Express.js, Node.js, Fastify.js, Docker, Git, Linux, Prisma, SQLite, MongoDB, and MariaDB.',
    },
    {
      match: /project|work|portfolio|build/i,
      answer:
        'Featured work includes hirefy (ATS platform), SimpleShell, IRC Server, RayFlow Engine, and a Path Finding Visualizer.',
    },
    {
      match: /education|school|study|background/i,
      answer:
        'Abdellatif studies at 1337 Coding School (2023-2026) and also holds a DEUG from the Faculty of Law in Agadir.',
    },
    {
      match: /contact|email|hire|collaborat/i,
      answer:
        'You can reach Abdellatif at elfagrouch9@gmail.com. He is open to new opportunities and collaborations.',
    },
  ],
  fr: [
    {
      match: /comp[ée]tence|tech|stack|langage|framework/i,
      answer:
        'Compétences principales : C, C++, JavaScript, TypeScript, React, Express.js, Node.js, Fastify.js, Docker, Git, Linux, Prisma, SQLite, MongoDB et MariaDB.',
    },
    {
      match: /projet|travail|portfolio|r[ée]alisation/i,
      answer:
        'Projets principaux : hirefy (plateforme ATS), SimpleShell, IRC Server, RayFlow Engine et Path Finding Visualizer.',
    },
    {
      match: /[ée]tude|formation|school|background/i,
      answer:
        'Abdellatif est à 1337 Coding School (2023-2026) et possède aussi un DEUG en droit (Faculté de Droit d\'Agadir).',
    },
    {
      match: /contact|email|embauche|collabor/i,
      answer:
        'Vous pouvez contacter Abdellatif via elfagrouch9@gmail.com. Il est ouvert aux nouvelles opportunités.',
    },
  ],
  ar: [
    {
      match: /مهار|تقني|stack|framework|لغة/i,
      answer:
        'المهارات الأساسية: C و C++ و JavaScript و TypeScript و React و Express.js و Node.js و Fastify.js و Docker و Git و Linux و Prisma و SQLite و MongoDB و MariaDB.',
    },
    {
      match: /مشروع|اعمال|عمل|portfolio/i,
      answer:
        'من أبرز المشاريع: hirefy و SimpleShell و IRC Server و RayFlow Engine و Path Finding Visualizer.',
    },
    {
      match: /تعليم|دراسة|دراس|خلفية|مدرسة|مسار|دراسي/i,
      answer:
        'عبداللطيف يدرس في 1337 Coding School (2023-2026) ولديه كذلك DEUG في القانون من أكادير.',
    },
    {
      match: /تواصل|ايميل|بريد|توظيف|تعاون/i,
      answer:
        'يمكنك التواصل مع عبداللطيف عبر elfagrouch9@gmail.com وهو منفتح على فرص جديدة وتعاونات.',
    },
  ],
};

function getFallbackAnswer(question: string, language: 'en' | 'fr' | 'ar'): string {
  const normalized = question.trim();
  const matchedAnswers = FALLBACK_KNOWLEDGE[language]
    .filter((entry) => entry.match.test(normalized))
    .map((entry) => entry.answer);

  if (matchedAnswers.length > 0) {
    return [...new Set(matchedAnswers)].join('\n\n');
  }

  if (language === 'fr' && /(nom|qui es-tu|qui etes-vous)/i.test(normalized)) {
    return 'Je suis l\'assistant portfolio de Abdellatif El Fagrouch.';
  }

  if (language === 'ar' && /(اسمك|من انت|من أنت)/i.test(normalized)) {
    return 'أنا مساعد بورتفوليو لعبداللطيف الفاگروش.';
  }

  if (language === 'en' && /(name|who are you)/i.test(normalized)) {
    return 'I am Abdellatif El Fagrouch\'s portfolio assistant.';
  }

  if (language === 'fr') {
    return 'Je peux aider sur les projets, compétences, études et contact. Posez une question plus précise.';
  }

  if (language === 'ar') {
    return 'يمكنني المساعدة بخصوص المشاريع والمهارات والتعليم ووسائل التواصل. اطرح سؤالا أكثر تحديدا.';
  }

  return 'I can help with projects, skills, education, and contact details. Ask a more specific question.';
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function getWelcomeMessage(language: 'en' | 'fr' | 'ar'): string {
  if (language === 'fr') {
    return 'Salut, je peux répondre aux questions sur les projets, compétences et parcours de Abdellatif.';
  }

  if (language === 'ar') {
    return 'مرحبا، يمكنني الإجابة عن الأسئلة حول مشاريع ومهارات وخلفية عبداللطيف.';
  }

  return 'Hi, I can answer questions about Abdellatif\'s projects, skills, and background.';
}

async function readTextStream(
  response: Response,
  onChunk: (partial: string) => void,
): Promise<string> {
  if (!response.body) {
    throw new Error('STREAM_UNAVAILABLE');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) {
      continue;
    }

    fullText += chunk;
    onChunk(fullText);
  }

  const trailing = decoder.decode();
  if (trailing) {
    fullText += trailing;
    onChunk(fullText);
  }

  return fullText;
}

function parseSsePayload(raw: string): { content: string; hasErrorEvent: boolean } {
  const blocks = raw.split('\n\n');
  let content = '';
  let hasErrorEvent = false;

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      continue;
    }

    const eventLine = lines.find((line) => line.startsWith('event:'));
    const eventName = eventLine ? eventLine.slice(6).trim() : '';
    const dataLines = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim());

    if (dataLines.length === 0) {
      continue;
    }

    if (eventName === 'error') {
      hasErrorEvent = true;
    }

    if (eventName === 'done' || dataLines.some((line) => line === '[DONE]')) {
      continue;
    }

    content += dataLines.join('\n');
  }

  return { content, hasErrorEvent };
}

export const PortfolioAssistant = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminResponse | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getWelcomeMessage(language),
    },
  ]);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyMode, setReplyMode] = useState<ReplyMode>('live');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const [first, ...rest] = prev;
      if (first.role !== 'assistant') {
        return prev;
      }

      const nextContent = getWelcomeMessage(language);
      if (first.content === nextContent) {
        return prev;
      }

      return [{ ...first, content: nextContent }, ...rest];
    });
  }, [language]);

  const cooldownRemaining = useMemo(() => {
    if (!lastSentAt) {
      return 0;
    }

    const elapsed = now - new Date(lastSentAt).getTime();
    return Math.max(0, CLIENT_COOLDOWN_MS - elapsed);
  }, [lastSentAt, now]);

  const canSend = !isLoading && input.trim().length > 0 && input.trim().length <= MAX_INPUT_CHARS && cooldownRemaining === 0;

  const replyModeLabel =
    language === 'fr'
      ? replyMode === 'live'
        ? 'LLM en direct'
        : 'Secours'
      : language === 'ar'
        ? replyMode === 'live'
          ? 'نموذج مباشر'
          : 'احتياطي'
        : replyMode === 'live'
          ? 'Live LLM'
          : 'Fallback';

  const replyModeTitle =
    language === 'fr'
      ? replyMode === 'live'
        ? 'Réponse provenant du pipeline LLM'
        : 'Réponse de secours (LLM indisponible)'
      : language === 'ar'
        ? replyMode === 'live'
          ? 'الرد صادر من مسار النموذج'
          : 'رد احتياطي (النموذج غير متاح)'
        : replyMode === 'live'
          ? 'Answer from LLM pipeline'
          : 'Fallback response (LLM unavailable)';

  function clearChat() {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getWelcomeMessage(language),
      },
    ]);
    setInput('');
    setLastSentAt(null);
    setIsLoading(false);
    setReplyMode('live');
  }

  async function loadAdminStats() {
    setAdminLoading(true);
    setAdminError(null);
    setAdminStats(null);

    const normalizedAdminKey = adminKey.trim();

    if (!normalizedAdminKey) {
      setAdminError('Please enter an admin key.');
      setAdminLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/portfolio-chat', {
        method: 'GET',
        headers: {
          'x-admin-key': normalizedAdminKey,
        },
      });

      const data = (await response.json()) as AdminResponse;
      if (!response.ok || !data.stats || !data.limits) {
        setAdminStats(null);
        if (response.status === 401) {
          setAdminError(data.error || 'Invalid admin key. Set CHAT_ADMIN_KEY on the server and enter the same value here.');
          return;
        }

        setAdminError(data.error || 'Unable to load usage stats.');
        return;
      }

      setAdminStats(data);
    } catch {
      setAdminStats(null);
      setAdminError('Admin stats are not reachable right now. Make sure the local dev server is running with `npm run dev` and that CHAT_ADMIN_KEY is set.');
    } finally {
      setAdminLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = input.trim();
    if (!canSend || !next) {
      return;
    }

    const userMessage: UiMessage = { id: crypto.randomUUID(), role: 'user', content: next };
    const assistantMessageId = crypto.randomUUID();
    const nextMessages = [...messages, userMessage];
    setMessages([
      ...nextMessages,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsLoading(true);
    setLastSentAt(new Date().toISOString());

    try {
      const history = nextMessages.slice(-7).map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/portfolio-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: next, history, lang: language, stream: true }),
      });

      const contentType = response.headers.get('content-type') || '';
      const isJsonResponse = contentType.includes('application/json');
      const isSseResponse = contentType.includes('text/event-stream');

      if (isJsonResponse) {
        const data = (await response.json()) as ApiResponse;
        if (!response.ok || !data.reply) {
          if (!response.ok && response.status >= 500) {
            const content = getFallbackAnswer(next, language);
            setReplyMode('fallback');
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId ? { ...message, content } : message,
              ),
            );
            return;
          }

          const content = data.error || getFallbackAnswer(next, language);
          setReplyMode(data.error ? 'live' : 'fallback');
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessageId ? { ...message, content } : message,
            ),
          );
          return;
        }

        const content = data.cached ? `${data.reply}\n\n(cached answer)` : data.reply;
        setReplyMode('live');
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, content } : message,
          ),
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`STREAM_HTTP_${response.status}`);
      }

      const streamed = await readTextStream(response, (partial) => {
        const nextContent = isSseResponse ? parseSsePayload(partial).content : partial;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, content: nextContent } : message,
          ),
        );
      });

      const parsed = isSseResponse ? parseSsePayload(streamed) : { content: streamed, hasErrorEvent: false };
      const finalStreamText = parsed.content;

      if (!finalStreamText.trim()) {
        const content = getFallbackAnswer(next, language);
        setReplyMode('fallback');
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, content } : message,
          ),
        );
      } else {
        setReplyMode(parsed.hasErrorEvent ? 'fallback' : 'live');
      }
    } catch {
      const content = getFallbackAnswer(next, language);
      setReplyMode('fallback');
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId ? { ...message, content } : message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 font-mono text-sm text-foreground shadow-lg transition-colors hover:border-primary"
          aria-label="Open AI assistant"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          Ask Me
        </button>
      )}

      {open && (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-md border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 font-mono text-sm text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              Portfolio Assistant
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  replyMode === 'live'
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
                title={replyModeTitle}
              >
                {replyModeLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setAdminOpen((prev) => !prev)}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted"
                aria-label="Toggle admin panel"
              >
                <Shield className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {adminOpen && (
            <div className="space-y-2 border-b border-border bg-muted/20 p-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <input
                  value={adminKey}
                  onChange={(event) => {
                    setAdminKey(event.target.value);
                    if (adminError) {
                      setAdminError(null);
                    }
                  }}
                  placeholder="Admin key"
                  className={`h-8 flex-1 rounded-sm border bg-background px-2 outline-none focus:border-primary ${
                    adminError ? 'border-destructive' : 'border-border'
                  }`}
                />
                <button
                  type="button"
                  onClick={loadAdminStats}
                  disabled={adminLoading || !adminKey.trim()}
                  className="h-8 rounded-sm bg-primary px-3 text-primary-foreground disabled:opacity-50"
                >
                  {adminLoading ? 'Loading...' : 'Load'}
                </button>
              </div>

              {adminLoading && <p className="text-muted-foreground">Checking admin stats...</p>}
              {adminError && <p className="text-destructive">{adminError}</p>}

              {adminStats?.stats && adminStats?.limits && (
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <p>Total: {adminStats.stats.totalRequests}</p>
                  <p>Success: {adminStats.stats.successfulRequests}</p>
                  <p>Failed: {adminStats.stats.failedRequests}</p>
                  <p>Rate hits: {adminStats.stats.rateLimitedRequests}</p>
                  <p>Daily cap hits: {adminStats.stats.dailyCapHits}</p>
                  <p>Cache hits: {adminStats.stats.cacheHits}</p>
                  <p>Cache misses: {adminStats.stats.cacheMisses}</p>
                  <p>Cache size: {adminStats.limits.cacheSize}</p>
                  <p>Daily used: {adminStats.limits.dailyCount}</p>
                  <p>Daily left: {adminStats.limits.dailyRemaining}</p>
                  <p>Hourly limit: {adminStats.limits.rateLimitPerHour}</p>
                  <p>Daily cap: {adminStats.limits.dailyCap}</p>
                </div>
              )}
            </div>
          )}

          <div className="max-h-[46vh] space-y-3 overflow-y-auto bg-background/40 px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'user' ? 'ml-8 min-w-0 max-w-full' : 'mr-8 min-w-0 max-w-full'}
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-mono text-foreground'
                      : 'max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-sm border border-border bg-card px-3 py-2 text-sm font-mono text-muted-foreground'
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}

            {messages.length <= 2 && (
              <div className="pt-1">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {language === 'fr' ? 'Questions suggerees' : language === 'ar' ? 'اسئلة مقترحة' : 'Suggested questions'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS[language].map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setInput(question)}
                      className="rounded-sm border border-border bg-card px-2 py-1 text-left font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="mr-8 rounded-sm border border-border bg-card px-3 py-2 text-sm font-mono text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <div className="loader loader-chat" style={{ width: '26px' }} aria-label="Generating response" role="status" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-2 border-t border-border p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={MAX_INPUT_CHARS}
              rows={3}
              placeholder={
                language === 'fr'
                  ? 'Posez une question sur les compétences, projets, études...'
                  : language === 'ar'
                    ? 'اسأل عن المهارات أو المشاريع أو التعليم...'
                    : 'Ask about skills, projects, education...'
              }
              className="w-full resize-none rounded-sm border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
            />

            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-muted-foreground">
                {input.trim().length}/{MAX_INPUT_CHARS}
                {cooldownRemaining > 0 && ` | cooldown ${Math.ceil(cooldownRemaining / 1000)}s`}
                {lastSentAt && cooldownRemaining === 0 && ` | last ${formatRelativeTime(lastSentAt)}`}
              </div>

              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 font-mono text-xs text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {language === 'fr' ? 'Envoyer' : language === 'ar' ? 'إرسال' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
