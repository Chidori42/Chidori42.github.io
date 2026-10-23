import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, Shield, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackAnalyticsEvent } from '@/lib/analytics';

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

type FallbackTopic = 'about' | 'skills' | 'projects' | 'education' | 'experience' | 'contact' | 'location';

type FallbackEntry = {
  topic: FallbackTopic;
  match: RegExp;
  answer: string;
};

const MAX_INPUT_CHARS = Number(import.meta.env.VITE_CHAT_MAX_INPUT_CHARS ?? 500);
const CLIENT_COOLDOWN_MS = Number(import.meta.env.VITE_CHAT_COOLDOWN_MS ?? 6000);
const STREAM_CHARS_PER_TICK = Number(import.meta.env.VITE_CHAT_STREAM_CHARS_PER_TICK ?? 2);
const STREAM_TICK_MS = Number(import.meta.env.VITE_CHAT_STREAM_TICK_MS ?? 26);
const STREAM_MAX_RENDER_MS = Number(import.meta.env.VITE_CHAT_STREAM_MAX_RENDER_MS ?? 8500);

const SUGGESTED_QUESTIONS = {
  en: [
    'What are your strongest skills?',
    'Tell me about your best project.',
    'What is your education background?',
    'How can I contact you?',
  ],
  fr: [
    'Quelles sont tes compétences principales ?',
    'Parle-moi de ton meilleur projet.',
    'Quel est ton parcours de formation ?',
    'Comment te contacter ?',
  ],
  ar: [
    'ما أقوى مهاراتك؟',
    'حدثني عن أفضل مشروع لديك.',
    'ما هو مسارك الدراسي؟',
    'كيف يمكنني التواصل معك؟',
  ],
};

const THINKING_LABELS = {
  en: 'AI is thinking',
  fr: 'L’IA réfléchit',
  ar: 'الذكاء الاصطناعي يفكر',
};

const SKIP_STREAM_LABELS = {
  en: 'Show now',
  fr: 'Afficher maintenant',
  ar: 'اعرض الآن',
};

const THINKING_PHASES = {
  en: ['Analyzing context', 'Reasoning on your request', 'Generating response'],
  fr: ['Analyse du contexte', 'Réflexion en cours', 'Génération de la réponse'],
  ar: ['تحليل السياق', 'معالجة الطلب', 'توليد الإجابة'],
};

const ASSISTANT_UI = {
  en: { ask: 'Ask me', title: 'Portfolio Assistant', clear: 'Clear chat', close: 'Close AI assistant', suggested: 'Suggested questions', generating: 'Generating response', placeholder: 'Ask about skills, projects, education...', send: 'Send', cooldown: 'Cooldown', last: 'Last message' },
  fr: { ask: 'Posez-moi une question', title: 'Assistant du portfolio', clear: 'Effacer la conversation', close: 'Fermer l’assistant IA', suggested: 'Questions suggérées', generating: 'Réponse en cours', placeholder: 'Posez une question sur les compétences, les projets ou la formation...', send: 'Envoyer', cooldown: 'Pause', last: 'Dernier message' },
  ar: { ask: 'اسألني', title: 'مساعد الملف الشخصي', clear: 'مسح المحادثة', close: 'إغلاق المساعد الذكي', suggested: 'أسئلة مقترحة', generating: 'جارٍ إعداد الإجابة', placeholder: 'اسأل عن المهارات أو المشاريع أو التعليم...', send: 'إرسال', cooldown: 'انتظر', last: 'آخر رسالة' },
};

const FALLBACK_KNOWLEDGE: Record<'en' | 'fr' | 'ar', FallbackEntry[]> = {
  en: [
    {
      topic: 'about',
      match: /\b(about abdellatif|who is abdellatif|who are you|abdellatif|profile|introduce abdellatif|his background|your background)\b/i,
      answer:
        'Abdellatif El Fagrouch is a full-stack web developer in training at 1337 Coding School in Morocco. He focuses on modern web experiences and previously studied law in Agadir.',
    },
    {
      topic: 'location',
      match: /^(?=.*\b(country|city|location|where|based|live|from)\b)(?=.*\b(abdellatif|you|your|he|his|portfolio)\b)/i,
      answer:
        'Abdellatif is based in Morocco. The portfolio context provides country-level location, but does not specify a city.',
    },
    {
      topic: 'skills',
      match: /skill|tech|stack|language|framework/i,
      answer:
        'His toolkit includes C, C++, JavaScript, TypeScript, React, React Native, Next.js, Express.js, Node.js, Fastify.js, NestJS, PostgreSQL, SQLite, MongoDB, MariaDB, Prisma, Docker, Git, and Linux.',
    },
    {
      topic: 'projects',
      match: /\b(project|projects|portfolio|hirefy|dakkanpro|applypilot|simpleshell|irc server|rayflow engine|path finding visualizer|ux ui design|eticketpro)\b/i,
      answer:
        'Featured projects include Hirefy (recruitment platform), DakkanPro (offline-ready point-of-sale app), ApplyPilot (local-first job-search platform), SimpleShell, IRC Server, RayFlow Engine, Path Finding Visualizer, and UX/UI Design.',
    },
    {
      topic: 'education',
      match: /\b(education|school|study|studies|degree|1337|deug|faculty of law)\b/i,
      answer:
        'Abdellatif is training at 1337 Coding School (November 2023–December 2026). He previously studied at the Faculty of Law in Agadir and earned a DEUG (January 2020–June 2022).',
    },
    {
      topic: 'experience',
      match: /\b(experience|internship|work history|somayar|eticketpro)\b/i,
      answer:
        'Abdellatif is completing a full-stack developer internship at Somayar (2025–present), building ETICKETPRO, an e-ticketing platform for a BRT transit network. His work includes NestJS, Next.js, PostgreSQL, Prisma, Docker, Socket.IO, and real-time vehicle tracking.',
    },
    {
      topic: 'contact',
      match: /\b(contact|email|reach|collaborat)\b/i,
      answer:
        'You can reach Abdellatif at elfagrouch9@gmail.com. He is open to new opportunities and collaborations.',
    },
  ],
  fr: [
    {
      topic: 'about',
      match: /\b([àa] propos d abdellatif|qui est abdellatif|abdellatif|profil|pr[ée]sentation|bio|son parcours|votre parcours)\b/i,
      answer:
        'Abdellatif El Fagrouch est un développeur web formé à 1337 Coding School, basé au Maroc et spécialisé dans les expériences web full-stack modernes.',
    },
    {
      topic: 'location',
      match: /^(?=.*\b(pays|ville|localisation|où|ou|bas[ée]|habite|r[ée]side)\b)(?=.*\b(abdellatif|vous|votre|tu|ton|son|portfolio)\b)/i,
      answer:
        'Abdellatif est basé au Maroc. Le portfolio indique le pays, mais ne précise pas la ville.',
    },
    {
      topic: 'skills',
      match: /comp[ée]tence|tech|stack|langage|framework/i,
      answer:
        'Compétences principales : C, C++, JavaScript, TypeScript, React, React Native, Next.js, Express.js, Node.js, Fastify.js, NestJS, PostgreSQL, SQLite, MongoDB, MariaDB, Prisma, Docker, Git et Linux.',
    },
    {
      topic: 'projects',
      match: /\b(projet|projets|portfolio|hirefy|dakkanpro|applypilot|simpleshell|irc server|rayflow engine|path finding visualizer|eticketpro)\b/i,
      answer:
        'Projets présentés : Hirefy (plateforme de recrutement), DakkanPro (caisse et gestion de magasin hors ligne), ApplyPilot (recherche d’emploi en local), SimpleShell, IRC Server, RayFlow Engine, Path Finding Visualizer et UX/UI Design.',
    },
    {
      topic: 'education',
      match: /\b[ée]tude|formation|school|dipl[oô]me|1337|deug|facult[eé] de droit\b/i,
      answer:
        'Abdellatif est à 1337 Coding School (2023-2026) et possède aussi un DEUG en droit (Faculté de Droit d\'Agadir).',
    },
    {
      topic: 'experience',
      match: /\b(expérience|stage|parcours professionnel|somayar|eticketpro)\b/i,
      answer:
        'Abdellatif effectue un stage de développeur full-stack chez Somayar (depuis 2025) pour créer ETICKETPRO, une plateforme de billetterie pour un réseau de bus à haut niveau de service. Il travaille notamment avec NestJS, Next.js, PostgreSQL, Prisma, Docker et Socket.IO.',
    },
    {
      topic: 'contact',
      match: /\b(contact|email|joindre|collabor)\b/i,
      answer:
        'Vous pouvez contacter Abdellatif via elfagrouch9@gmail.com. Il est ouvert aux nouvelles opportunités.',
    },
  ],
  ar: [
    {
      topic: 'about',
      match: /(من هو عبداللطيف|عن عبداللطيف|عبداللطيف|نبذة|تعريف|ملف شخصي|مسيرته|مسيرتك)/i,
      answer:
        'عبداللطيف الفاگروش مطور ويب من مدرسة 1337 في المغرب، ويركز على بناء تجارب ويب حديثة متكاملة.',
    },
    {
      topic: 'location',
      match: /^(?=.*(بلد|دولة|مدينة|اين|أين|الموقع|موقع|يسكن|يقيم))(?=.*(عبداللطيف|موقعك|موقعه|مدينتك|مدينته|سيرته))/i,
      answer:
        'عبداللطيف مقيم في المغرب. بيانات البورتفوليو تذكر البلد فقط ولا تحدد المدينة.',
    },
    {
      topic: 'skills',
      match: /مهار|تقني|stack|framework|لغة/i,
      answer:
        'المهارات الأساسية: C و C++ و JavaScript و TypeScript و React و Express.js و Node.js و Fastify.js و Docker و Git و Linux و Prisma و SQLite و MongoDB و MariaDB.',
    },
    {
      topic: 'projects',
      match: /مشروع|مشاريع|portfolio|hirefy|dakkanpro|applypilot|simpleshell|irc server|rayflow engine|path finding visualizer|eticketpro/i,
      answer:
        'من المشاريع: Hirefy وDakkanPro لإدارة المتاجر والمبيعات، وApplyPilot للبحث عن عمل، وSimpleShell وIRC Server وRayFlow Engine وPath Finding Visualizer.',
    },
    {
      topic: 'education',
      match: /تعليم|دراسة|دراس|شهادة|مدرسة|مسار دراسي|1337|deug|كلية القانون/i,
      answer:
        'عبداللطيف يدرس في 1337 Coding School (2023-2026) ولديه كذلك DEUG في القانون من أكادير.',
    },
    {
      topic: 'experience',
      match: /خبرة|تدريب|مسار مهني|somayar|eticketpro/i,
      answer:
        'يتابع عبداللطيف تدريباً في تطوير البرمجيات لدى Somayar منذ عام 2025، حيث يعمل على ETICKETPRO، وهي منصة تذاكر إلكترونية لشبكة حافلات النقل السريع. يشمل عمله NestJS وNext.js وPostgreSQL وPrisma وDocker وSocket.IO وتتبع المركبات مباشرةً.',
    },
    {
      topic: 'contact',
      match: /تواصل|ايميل|بريد|توظيف|تعاون/i,
      answer:
        'يمكنك التواصل مع عبداللطيف عبر elfagrouch9@gmail.com وهو منفتح على فرص جديدة وتعاونات.',
    },
  ],
};

function extractFallbackTopicOrder(question: string, language: 'en' | 'fr' | 'ar'): FallbackTopic[] {
  const entries = FALLBACK_KNOWLEDGE[language];
  const topicOrder: FallbackTopic[] = [];
  const seen = new Set<FallbackTopic>();

  const segments = question
    .split(/\r?\n|[?؟!]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    for (const entry of entries) {
      if (!entry.match.test(segment) || seen.has(entry.topic)) {
        continue;
      }

      seen.add(entry.topic);
      topicOrder.push(entry.topic);
    }
  }

  if (topicOrder.length > 0) {
    return topicOrder;
  }

  for (const entry of entries) {
    if (!entry.match.test(question) || seen.has(entry.topic)) {
      continue;
    }

    seen.add(entry.topic);
    topicOrder.push(entry.topic);
  }

  return topicOrder;
}

function getAdvancedFallbackAnswer(question: string, language: 'en' | 'fr' | 'ar'): string | null {
  const normalized = question.toLowerCase();

  if (language !== 'en') {
    return null;
  }

  if (!/(abdellatif|your|his|portfolio|project|skill|education|experience|internship|career|contact|cv|resume|hire)/i.test(normalized)) {
    return null;
  }

  const asksTechnicalProfile =
    /(technical profile|concise profile|about abdellatif|strongest stack|currently studying|where .*stud(y|ies)|cs fundamentals)/i.test(normalized);

  if (asksTechnicalProfile) {
    return [
      '1. Abdellatif El Fagrouch is a full-stack web developer from 1337 Coding School in Morocco.',
      '2. Strongest stack: C, C++, JavaScript, TypeScript, React, Express.js, Node.js, Fastify.js, SQL/NoSQL databases (SQLite, MariaDB, MongoDB), plus Docker and Linux tooling.',
      '3. CS fundamentals demonstrated: systems programming (SimpleShell), networking protocols (IRC Server), algorithmic problem solving (Path Finding Visualizer), and graphics/rendering concepts (RayFlow Engine).',
      '4. Current studies: 1337 Coding School (2023-2026), with previous DEUG studies from the Faculty of Law in Agadir.',
    ].join('\n\n');
  }

  const asksTopProjectComparison =
    /(compare|top\s*3|best\s*3).*(project|portfolio)|domain.*technolog|engineering challenge/i.test(normalized);

  if (asksTopProjectComparison) {
    return [
      '1. hirefy',
      '- Domain: HR Tech / Applicant Tracking System',
      '- Core technologies: React, Express, MySQL, TypeScript, JavaScript',
      '- Main engineering challenge: connecting recruiter and candidate workflows with reliable CRUD flows and practical full-stack coordination.',
      '2. IRC Server',
      '- Domain: Real-time networking / communication systems',
      '- Core technologies: C++ and networking concepts',
      '- Main engineering challenge: implementing RFC 2812-compatible server behavior for multiple concurrent clients and real-time message flow.',
      '3. RayFlow Engine',
      '- Domain: Graphics / game engine programming',
      '- Core technologies: C and rendering fundamentals',
      '- Main engineering challenge: building retro-style raycasting logic and performant first-person rendering behavior.',
    ].join('\n');
  }

  const asksHiringAssessment =
    /(hire|hiring|backend-focused|backend role|why he fits|fit for|limitations|available data|contact details)/i.test(normalized);

  if (asksHiringAssessment) {
    return [
      '1. Why he fits a backend-focused role:',
      '- Experience with Node.js, Express.js, Fastify.js and multiple databases (SQLite, MariaDB, MongoDB).',
      '- Solid low-level base from C/C++ projects that show systems and performance-oriented thinking.',
      '- Practical experience shipping full-stack projects where backend design and integration are central.',
      '2. Limitations in available data:',
      '- Public portfolio context summarizes projects and stack, but does not include production-scale metrics, team size details, or deep architecture docs.',
      '- A deeper interview or code walkthrough would be needed for final seniority assessment.',
      '3. Contact:',
      '- Email: elfagrouch9@gmail.com',
      '- Status: Open to new opportunities and collaborations.',
    ].join('\n');
  }

  const asksCsEvidence =
    /(computer science perspective|algorithmic thinking|systems knowledge|networking experience|evidence)/i.test(normalized);

  if (asksCsEvidence) {
    return [
      '1. Algorithmic thinking evidence:',
      '- Path Finding Visualizer demonstrates algorithm-oriented reasoning (floodfill, BFS) and interactive simulation.',
      '- RayFlow Engine reflects geometric and rendering logic used in raycasting pipelines.',
      '2. Systems knowledge evidence:',
      '- SimpleShell demonstrates process and command execution fundamentals in a Unix-like environment.',
      '- C/C++ project portfolio indicates comfort with low-level memory-conscious programming models.',
      '3. Networking evidence:',
      '- IRC Server explicitly targets RFC 2812 behavior with multi-client real-time communication patterns.',
      '- This indicates understanding of protocol-driven communication and concurrent connection handling basics.',
    ].join('\n');
  }

  return null;
}

function normalizeAssistantQuery(question: string): string {
  return question
    .normalize('NFKD')
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getConversationalFallbackReply(question: string, language: 'en' | 'fr' | 'ar'): string | null {
  const normalized = normalizeAssistantQuery(question);
  const greetingOnly = {
    en: /^(h+i+|hello|hey+|hi there|hello there|hey there|good morning|good afternoon|good evening|howdy)$/,
    fr: /^(salut|bonjour|bonsoir|coucou)$/,
    ar: /^(مرحبا|اهلا|اهلا وسهلا|سلام|السلام عليكم(?: ورحمة الله)?|صباح الخير|مساء الخير)$/,
  }[language];
  const howAreYou = {
    en: /^(?:(?:hi|hello|hey) )?(?:how are you|how is it going|what s up)$/,
    fr: /^(?:(?:salut|bonjour|bonsoir) )?(?:comment ca va|comment allez vous|ca va)$/,
    ar: /^(?:(?:مرحبا|اهلا) )?(?:كيف حالك|كيف الحال)$/,
  }[language];
  const thanksOnly = {
    en: /^(thanks|thank you|thx)$/,
    fr: /^(merci|merci beaucoup)$/,
    ar: /^(شكرا|شكرا جزيلا)$/,
  }[language];

  if (greetingOnly.test(normalized)) {
    return {
      en: 'Hi! I’m Abdellatif’s portfolio assistant. What would you like to know about his projects, skills, experience, or studies?',
      fr: 'Bonjour ! Je suis l’assistant du portfolio d’Abdellatif. Que souhaitez-vous savoir sur ses projets, ses compétences, son expérience ou sa formation ?',
      ar: 'مرحباً! أنا مساعد الملف الشخصي لعبداللطيف. ما الذي تود معرفته عن مشاريعه أو مهاراته أو خبرته أو دراسته؟',
    }[language];
  }
  if (howAreYou.test(normalized)) {
    return {
      en: 'I’m doing well, thanks for asking! I’m here to help with questions about Abdellatif’s portfolio. What would you like to explore?',
      fr: 'Je vais bien, merci ! Je peux vous renseigner sur le portfolio d’Abdellatif. Qu’aimeriez-vous découvrir ?',
      ar: 'أنا بخير، شكراً لسؤالك! يمكنني مساعدتك بمعلومات عن ملف عبداللطيف وأعماله. ما الذي تود معرفته؟',
    }[language];
  }
  if (thanksOnly.test(normalized)) {
    return {
      en: 'You’re welcome! Feel free to ask me about Abdellatif’s projects, skills, experience, or education.',
      fr: 'Avec plaisir ! Vous pouvez aussi me poser des questions sur les projets, les compétences, l’expérience ou la formation d’Abdellatif.',
      ar: 'على الرحب والسعة! يمكنك سؤالي أيضاً عن مشاريع عبداللطيف أو مهاراته أو خبرته أو دراسته.',
    }[language];
  }
  return null;
}

function isGeneralKnowledgeFallback(question: string, language: 'en' | 'fr' | 'ar'): boolean {
  const normalized = normalizeAssistantQuery(question);
  const generalRequest = {
    en: /^(what is|what are|what s|what does|what do|what language|which language|what technology|which technology|what framework|who uses|who is|who are|where is|where are|where can i|what city|which city|when did|when was|define|explain|teach me|how to|how do i|how do you|how does|how can i|write|create|generate|solve|debug|translate|summarize|what s the difference|tell me about|what about|weather|forecast|news|recipe|joke|calculate|capital of)(?:\s|$)/,
    fr: /^(qu est ce que|c est quoi|quel langage|quelle technologie|quel framework|qui utilise|comment fonctionne|comment utilise|qui est|qui sont|ou est|ou sont|quelle ville|dans quelle ville|quand est|quand a|definis|explique|apprends moi|comment faire|comment puis je|ecris|cree|genere|resous|traduis|resume|parle moi de|et pour|meteo|actualites|recette|blague|calcule|capitale de)(?:\s|$)/,
    ar: /^(ما هو|ما هي|ما لغة|اي لغة|ما التقنية|أي لغة|من يستخدم|كيف يعمل|من هو|من هي|اين|ما عاصمة|اشرح|علمني|كيف افعل|كيف اصنع|اكتب|انشئ|ترجم|لخص|حدثني عن|اخبرني عن|ماذا عن|الطقس|اخبار|وصفة|نكتة|احسب)(?:\s|$)/,
  }[language];
  const personalReference = {
    en: /\b(you|your|yourself|he|his|him|abdellatif|his portfolio|his cv|his resume)\b/,
    fr: /\b(vous|votre|tu|ton|ta|tes|il|son|sa|ses|abdellatif|son portfolio|son cv)\b/,
    ar: /(عبداللطيف|ملفه|سيرته|مشاريعه|مهاراته|خبرته|دراسته|معلوماته|عمله|سيرتك|مشاريعك|مهاراتك|خبرتك|دراستك|معلوماتك|عملك)/,
  }[language];
  const portfolioTopic = {
    en: /\b(project|projects|skill|skills|experience|internship|education|studies|school|contact|email|availability|profile|portfolio|resume|cv|location|stack|technologies)\b/,
    fr: /\b(projet|projets|competence|competences|experience|stage|formation|etudes|ecole|contact|email|profil|portfolio|cv|localisation|technologies)\b/,
    ar: /(مشروع|مشاريع|مهارة|مهارات|خبرة|تدريب|تعليم|دراسة|مدرسة|تواصل|بريد|ملف|سيرة|موقع|تقنيات)/,
  }[language];
  const knownPortfolioEntity = /\b(hirefy|dakkanpro|applypilot|simpleshell|irc server|rayflow engine|path finding visualizer|eticketpro|somayar|1337)\b/i.test(normalized);
  const clearlyUnrelatedIntent = {
    en: /\b(weather|forecast|news|recipe|joke|homework|calculate|debug|translate|translation|write code|generate code|programming tutorial)\b/,
    fr: /\b(meteo|actualites|recette|blague|devoirs|calculer|deboguer|traduire|traduction|code source|tutoriel)\b/,
    ar: /(الطقس|اخبار|وصفة|نكتة|واجب|احسب|ترجم|ترجمة|برمجة|كود)/,
  }[language];
  return clearlyUnrelatedIntent.test(normalized) || (
    generalRequest.test(normalized)
      && !personalReference.test(normalized)
      && !portfolioTopic.test(normalized)
      && !knownPortfolioEntity
  );
}

function hasClearlyUnrelatedFallbackIntent(question: string, language: 'en' | 'fr' | 'ar'): boolean {
  const normalized = normalizeAssistantQuery(question);
  return {
    en: /\b(weather|forecast|news|recipe|joke|homework|calculate|debug|translate|translation|write code|generate code|programming tutorial)\b/,
    fr: /\b(meteo|actualites|recette|blague|devoirs|calculer|deboguer|traduire|traduction|code source|tutoriel)\b/,
    ar: /(الطقس|اخبار|وصفة|نكتة|واجب|احسب|ترجم|ترجمة|برمجة|كود)/,
  }[language].test(normalized);
}

function getScopeBoundaryFallback(language: 'en' | 'fr' | 'ar'): string {
  return {
    en: 'I can only answer questions about Abdellatif and the information in this portfolio. I don’t have access to answer that topic, but I can help with his projects, skills, experience, education, or contact details.',
    fr: 'Je peux uniquement répondre aux questions sur Abdellatif et les informations de ce portfolio. Je n’ai pas accès aux informations nécessaires sur ce sujet, mais je peux vous renseigner sur ses projets, ses compétences, son expérience, sa formation ou ses coordonnées.',
    ar: 'يمكنني الإجابة فقط عن الأسئلة المتعلقة بعبداللطيف والمعلومات الواردة في ملفه. لا تتوفر لدي معلومات للإجابة عن هذا الموضوع، لكن يمكنني المساعدة بشأن مشاريعه ومهاراته وخبرته ودراسته أو معلومات التواصل معه.',
  }[language];
}

function getSpecificProjectFallback(question: string, language: 'en' | 'fr' | 'ar'): string | null {
  const normalized = normalizeAssistantQuery(question);
  const projects: Array<{ match: RegExp; answers: Record<'en' | 'fr' | 'ar', string> }> = [
    {
      match: /\bhirefy\b/,
      answers: {
        en: 'Hirefy is a smart applicant-tracking and recruitment platform built with React, Express, MySQL, TypeScript, and JavaScript.',
        fr: 'Hirefy est une plateforme de recrutement et de suivi des candidatures, développée avec React, Express, MySQL, TypeScript et JavaScript.',
        ar: 'Hirefy منصة للتوظيف وتتبع طلبات الترشح، مبنية باستخدام React وExpress وMySQL وTypeScript وJavaScript.',
      },
    },
    {
      match: /\bdakkanpro\b/,
      answers: {
        en: 'DakkanPro is an offline-ready point-of-sale and shop-management app for small retailers. It covers sales, inventory, customer credit, cash register, reports, and backups, using React Native, Expo, TypeScript, and SQLite.',
        fr: 'DakkanPro est une application de caisse et de gestion de magasin, utilisable hors ligne par les petits commerçants. Elle gère les ventes, le stock, le crédit client, la caisse, les rapports et les sauvegardes avec React Native, Expo, TypeScript et SQLite.',
        ar: 'DakkanPro تطبيق لإدارة المتاجر ونقاط البيع، ويعمل دون اتصال. يشمل المبيعات والمخزون وديون العملاء والصندوق والتقارير والنسخ الاحتياطي، باستخدام React Native وExpo وTypeScript وSQLite.',
      },
    },
    {
      match: /\bapplypilot\b/,
      answers: {
        en: 'ApplyPilot is a local-first job-search platform with an application tracker, CV and cover-letter library, recruiter email discovery, scheduled outreach, and reply tracking. Its stack includes Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.',
        fr: 'ApplyPilot est une plateforme locale de recherche d’emploi avec suivi des candidatures, bibliothèque de CV et lettres de motivation, recherche d’adresses de recruteurs, campagnes planifiées et suivi des réponses. Elle utilise Next.js, TypeScript, Tailwind CSS, PostgreSQL et Prisma.',
        ar: 'ApplyPilot منصة محلية للبحث عن عمل، تتضمن تتبع الطلبات ومكتبة للسيرة الذاتية ورسائل التقديم واكتشاف عناوين مسؤولي التوظيف وجدولة الرسائل وتتبع الردود. تستخدم Next.js وTypeScript وTailwind CSS وPostgreSQL وPrisma.',
      },
    },
    {
      match: /\beticketpro\b/,
      answers: {
        en: 'ETICKETPRO is an e-ticketing platform for a BRT transit network, built during Abdellatif’s full-stack internship at Somayar. His work includes a four-zone fare engine, GTFS data integration, and real-time vehicle tracking with Redis, Socket.IO, and Leaflet.',
        fr: 'ETICKETPRO est une plateforme de billetterie électronique pour un réseau de bus à haut niveau de service, développée pendant le stage full-stack d’Abdellatif chez Somayar. Son travail comprend un moteur tarifaire à quatre zones, l’intégration de données GTFS et le suivi des véhicules en temps réel avec Redis, Socket.IO et Leaflet.',
        ar: 'ETICKETPRO منصة للتذاكر الإلكترونية لشبكة حافلات النقل السريع، يعمل عليها عبداللطيف خلال تدريبه في Somayar. يشمل عمله محرك تسعير بأربع مناطق ودمج بيانات GTFS وتتبع المركبات مباشرة باستخدام Redis وSocket.IO وLeaflet.',
      },
    },
    {
      match: /\bsimpleshell\b/,
      answers: {
        en: 'SimpleShell is Abdellatif’s Unix shell implementation in C, focused on core shell and process-execution concepts.',
        fr: 'SimpleShell est une implémentation de shell Unix en C, axée sur les commandes et l’exécution des processus.',
        ar: 'SimpleShell تطبيق لصدفة Unix بلغة C، يركز على أساسيات الأوامر وتنفيذ العمليات.',
      },
    },
    {
      match: /\birc server\b/,
      answers: {
        en: 'IRC Server is a C++ networking project implementing an IRC server compatible with RFC 2812.',
        fr: 'IRC Server est un projet réseau en C++ qui implémente un serveur IRC compatible avec la norme RFC 2812.',
        ar: 'IRC Server مشروع شبكات بلغة C++ لتنفيذ خادم IRC متوافق مع RFC 2812.',
      },
    },
    {
      match: /\brayflow engine\b/,
      answers: {
        en: 'RayFlow Engine is a retro-inspired 3D raycasting engine built in C.',
        fr: 'RayFlow Engine est un moteur 3D de raycasting au style rétro, développé en C.',
        ar: 'RayFlow Engine محرك ثلاثي الأبعاد بأسلوب قديم يعتمد على raycasting، ومبني بلغة C.',
      },
    },
    {
      match: /\bpath finding visualizer\b/,
      answers: {
        en: 'Path Finding Visualizer is an interactive visualizer for path-finding algorithms, built in C++.',
        fr: 'Path Finding Visualizer est un outil interactif de visualisation d’algorithmes de recherche de chemin, développé en C++.',
        ar: 'Path Finding Visualizer أداة تفاعلية لعرض خوارزميات إيجاد المسارات، مبنية بلغة C++.',
      },
    },
  ];

  const project = projects.find((entry) => entry.match.test(normalized));
  return project?.answers[language] ?? null;
}

function isContextualFallbackFollowup(question: string, language: 'en' | 'fr' | 'ar'): boolean {
  const normalized = normalizeAssistantQuery(question);
  return {
    en: /^(tell me more|more details|elaborate|expand on that|what about that|what about it|and what about|can you expand)/,
    fr: /^(parle m en plus|plus de details|peux tu developper|et pour ca|et a ce sujet|qu en est il)/,
    ar: /^(اخبرني المزيد|مزيد من التفاصيل|وضح اكثر|ماذا عن ذلك|وماذا عن|توسع اكثر)/,
  }[language].test(normalized);
}

function getFallbackAnswer(
  question: string,
  language: 'en' | 'fr' | 'ar',
  history: Array<Pick<UiMessage, 'role' | 'content'>> = [],
): string {
  const normalized = question.trim();
  const conversationalReply = getConversationalFallbackReply(normalized, language);
  if (conversationalReply) {
    return conversationalReply;
  }
  const isFollowup = isContextualFallbackFollowup(normalized, language);
  const followupContext = isFollowup
    ? [...history].reverse().find((entry) => entry.role === 'user'
      && !isContextualFallbackFollowup(entry.content, language)
      && !isGeneralKnowledgeFallback(entry.content, language)
      && extractFallbackTopicOrder(entry.content, language).length > 0)
    : undefined;
  const hasCurrentPortfolioTopic = extractFallbackTopicOrder(normalized, language).length > 0;
  const shouldDeclineGeneralRequest = isGeneralKnowledgeFallback(normalized, language)
    && !(followupContext && !hasClearlyUnrelatedFallbackIntent(normalized, language));
  if (shouldDeclineGeneralRequest) {
    return getScopeBoundaryFallback(language);
  }

  if (isFollowup && !followupContext && !hasCurrentPortfolioTopic) {
    return getScopeBoundaryFallback(language);
  }
  const contextualQuestion = followupContext ? `${followupContext.content} ${normalized}` : normalized;

  const projectAnswer = getSpecificProjectFallback(contextualQuestion, language);
  if (projectAnswer) {
    return projectAnswer;
  }

  const advancedAnswer = getAdvancedFallbackAnswer(contextualQuestion, language);
  if (advancedAnswer) {
    return advancedAnswer;
  }

  if (language === 'en' && /\b(city|which city|what city)\b/i.test(contextualQuestion) && /(abdellatif|you|your|his|portfolio)/i.test(contextualQuestion)) {
    return 'The portfolio only specifies Morocco as location and does not include a city.';
  }

  if (language === 'fr' && /\b(ville|quelle ville|dans quelle ville)\b/i.test(contextualQuestion) && /(abdellatif|vous|votre|tu|ton|son|portfolio)/i.test(contextualQuestion)) {
    return 'Le portfolio indique le Maroc comme localisation, mais ne précise pas la ville.';
  }

  if (language === 'ar' && /(مدينة|أي مدينة|أية مدينة)/i.test(contextualQuestion) && /(عبداللطيف|موقعك|موقعه|مدينتك|مدينته)/i.test(contextualQuestion)) {
    return 'البورتفوليو يذكر المغرب كموقع فقط، بدون تحديد المدينة.';
  }

  const orderedTopics = extractFallbackTopicOrder(contextualQuestion, language);
  const topicToAnswer = new Map(FALLBACK_KNOWLEDGE[language].map((entry) => [entry.topic, entry.answer]));
  const matchedAnswers = orderedTopics
    .map((topic) => topicToAnswer.get(topic))
    .filter((answer): answer is string => Boolean(answer));

  if (matchedAnswers.length > 0) {
    if (matchedAnswers.length === 1) {
      return matchedAnswers[0];
    }

    return matchedAnswers.map((answer, index) => `${index + 1}. ${answer}`).join('\n\n');
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

  return getScopeBoundaryFallback(language);
}

function formatRelativeTime(iso: string, language: 'en' | 'fr' | 'ar'): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  const relativeTime = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  if (seconds < 60) return relativeTime.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return relativeTime.format(-minutes, 'minute');
  return relativeTime.format(-Math.floor(minutes / 60), 'hour');
}

function getWelcomeMessage(language: 'en' | 'fr' | 'ar'): string {
  if (language === 'fr') {
    return 'Bonjour ! Je suis l’assistant du portfolio d’Abdellatif. Posez-moi vos questions sur ses projets, ses compétences, son expérience ou sa formation.';
  }

  if (language === 'ar') {
    return 'مرحباً! أنا مساعد الملف الشخصي لعبداللطيف. اسألني عن مشاريعه أو مهاراته أو خبرته أو دراسته.';
  }

  return 'Hi! I’m Abdellatif’s portfolio assistant. Ask me about his projects, skills, experience, or education.';
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

async function streamTextToMessage(
  text: string,
  onChunk: (partial: string) => void,
  shouldSkip?: () => boolean,
): Promise<void> {
  const source = text || '';
  if (!source) {
    onChunk('');
    return;
  }

  let charsPerTick = Math.max(1, STREAM_CHARS_PER_TICK);
  const estimatedTicks = Math.ceil(source.length / charsPerTick);
  const estimatedDurationMs = estimatedTicks * STREAM_TICK_MS;

  if (estimatedDurationMs > STREAM_MAX_RENDER_MS) {
    const targetTicks = Math.ceil(STREAM_MAX_RENDER_MS / STREAM_TICK_MS);
    charsPerTick = Math.max(charsPerTick, Math.ceil(source.length / Math.max(1, targetTicks)));
  }

  let cursor = 0;

  while (cursor < source.length) {
    if (shouldSkip?.()) {
      onChunk(source);
      return;
    }

    const nextStep = source.slice(cursor, cursor + charsPerTick);
    cursor += nextStep.length;
    onChunk(source.slice(0, cursor));
    await new Promise((resolve) => window.setTimeout(resolve, STREAM_TICK_MS));
  }
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
      continue;
    }

    if (eventName === 'done' || dataLines.some((line) => line === '[DONE]')) {
      continue;
    }

    content += dataLines.join('\n');
  }

  return { content, hasErrorEvent };
}

export const PortfolioAssistant = () => {
  const { language, direction } = useLanguage();
  const ui = ASSISTANT_UI[language];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getWelcomeMessage(language),
    },
  ]);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClientStreaming, setIsClientStreaming] = useState(false);
  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);
  const [replyMode, setReplyMode] = useState<ReplyMode>('live');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const skipStreamRef = useRef(false);

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

  useEffect(() => {
    if (!isLoading) {
      setLoadingPhaseIndex(0);
      return;
    }

    const phaseInterval = window.setInterval(() => {
      setLoadingPhaseIndex((prev) => (prev + 1) % THINKING_PHASES[language].length);
    }, 950);

    return () => window.clearInterval(phaseInterval);
  }, [isLoading, language]);

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollTop = scroller.scrollHeight;
  }, [messages, isLoading, loadingPhaseIndex, isClientStreaming]);

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
        ? 'direct'
        : 'Secours'
      : language === 'ar'
        ? replyMode === 'live'
          ? 'مباشر'
          : 'احتياطي'
        : replyMode === 'live'
          ? 'Live'
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
    setIsClientStreaming(false);
    skipStreamRef.current = false;
    setReplyMode('live');
  }


  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = input.trim();
    if (!canSend || !next) {
      return;
    }

    const userMessage: UiMessage = { id: crypto.randomUUID(), role: 'user', content: next };
    trackAnalyticsEvent('assistant_message_sent', {
      message_length: next.length,
      language,
    });

    const assistantMessageId = crypto.randomUUID();
    const nextMessages = [...messages, userMessage];
    setMessages([
      ...nextMessages,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsLoading(true);
    setIsClientStreaming(false);
    skipStreamRef.current = false;
    setLastSentAt(new Date().toISOString());

    const applyContentWithClientStreaming = async (content: string) => {
      setIsClientStreaming(true);
      await streamTextToMessage(
        content,
        (partial) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessageId ? { ...message, content: partial } : message,
            ),
          );
        },
        () => skipStreamRef.current,
      );
      setIsClientStreaming(false);
    };

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
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
          if (response.status === 429 || response.status === 503) {
            const fallbackContent = getFallbackAnswer(next, language, messages);
            setReplyMode('fallback');
            await applyContentWithClientStreaming(fallbackContent);
            return;
          }

          if (!response.ok && response.status >= 500) {
            const content = getFallbackAnswer(next, language, messages);
            setReplyMode('fallback');
            await applyContentWithClientStreaming(content);
            return;
          }

          const content = data.error || getFallbackAnswer(next, language, messages);
          setReplyMode(data.error ? 'live' : 'fallback');
          await applyContentWithClientStreaming(content);
          return;
        }

        const content = data.reply;
        setReplyMode('live');
        await applyContentWithClientStreaming(content);
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
        const content = getFallbackAnswer(next, language, messages);
        setReplyMode('fallback');
        await applyContentWithClientStreaming(content);
      } else {
        setReplyMode(parsed.hasErrorEvent ? 'fallback' : 'live');
      }
    } catch {
      const content = getFallbackAnswer(next, language, messages);
      setReplyMode('fallback');
      await applyContentWithClientStreaming(content);
    } finally {
      skipStreamRef.current = false;
      setIsClientStreaming(false);
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50" dir={direction}>
      {!open && (
        <button
          type="button"
          onClick={() => {
            trackAnalyticsEvent('assistant_opened', { source: 'floating_button' });
            setOpen(true);
          }}
          className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 font-mono text-sm text-foreground shadow-lg transition-colors hover:border-primary"
          aria-label={ui.ask}
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          {ui.ask}
        </button>
      )}

      {open && (
        <div className="flex max-h-[calc(100vh-2rem)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-md border border-border bg-card shadow-2xl">
          <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 font-mono text-sm text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              {ui.title}
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${replyMode === 'live'
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
                aria-label={ui.clear}
                title={ui.clear}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted"
                aria-label={ui.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollContainerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-background/40 px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'user'
                  ? `${direction === 'rtl' ? 'mr-8' : 'ml-8'} min-w-0 max-w-full`
                  : `${direction === 'rtl' ? 'ml-8' : 'mr-8'} min-w-0 max-w-full`}
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
                  {ui.suggested}
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
                <div className="llm-loader" aria-label={ui.generating} role="status">
                  <div className="llm-loader-orbit" aria-hidden="true">
                    <span className="llm-loader-orbit-ring llm-loader-ring-a" />
                    <span className="llm-loader-orbit-ring llm-loader-ring-b" />
                    <span className="llm-loader-core" />
                  </div>
                  <div className="llm-loader-copy">
                    <span className="llm-loader-title">{THINKING_LABELS[language]}</span>
                    <span className="llm-loader-phase">{THINKING_PHASES[language][loadingPhaseIndex]}</span>
                    <span className="llm-loader-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
                {isClientStreaming && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        skipStreamRef.current = true;
                      }}
                      className="rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {SKIP_STREAM_LABELS[language]}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="shrink-0 space-y-2 border-t border-border p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={MAX_INPUT_CHARS}
              rows={3}
              placeholder={ui.placeholder}
              className="w-full resize-none rounded-sm border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
            />

            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-muted-foreground">
                {input.trim().length}/{MAX_INPUT_CHARS}
                {cooldownRemaining > 0 && ` | ${ui.cooldown} ${Math.ceil(cooldownRemaining / 1000)}s`}
                {lastSentAt && cooldownRemaining === 0 && ` | ${ui.last} ${formatRelativeTime(lastSentAt, language)}`}
              </div>

              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 font-mono text-xs text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {ui.send}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
