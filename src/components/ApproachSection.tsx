import { Compass, Layers3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  en: {
    eyebrow: 'THE WAY I WORK',
    title: 'Good work connects the details.',
    description: 'From the first question to the final interaction, I connect product thinking with full-stack engineering.',
    steps: [
      { title: 'Understand', label: 'START WITH THE WHY', description: 'Find the useful shape of a problem before reaching for tools.' },
      { title: 'Build', label: 'MAKE IT WORK TOGETHER', description: 'Connect interface, APIs, data, and infrastructure into one product.' },
      { title: 'Refine', label: 'CARE ABOUT THE DETAILS', description: 'Polish responsive behavior, accessibility, and clear feedback.' },
    ],
  },
  fr: {
    eyebrow: 'MA FAÇON DE TRAVAILLER',
    title: 'Un bon produit relie chaque détail.',
    description: 'Du premier besoin à l’expérience finale, je relie la réflexion produit au développement full-stack.',
    steps: [
      { title: 'Comprendre', label: 'PARTIR DU BESOIN', description: 'Définir le problème utile avant de choisir les outils.' },
      { title: 'Construire', label: 'RELIER LES ÉLÉMENTS', description: 'Réunir interface, API, données et infrastructure dans un produit.' },
      { title: 'Peaufiner', label: 'SOIGNER LES DÉTAILS', description: 'Améliorer le responsive, l’accessibilité et les retours utilisateur.' },
    ],
  },
  ar: {
    eyebrow: 'طريقتي في العمل',
    title: 'العمل الجيد يربط كل التفاصيل.',
    description: 'من السؤال الأول إلى التفاعل الأخير، أجمع بين التفكير في المنتج وهندسة البرمجيات المتكاملة.',
    steps: [
      { title: 'الفهم', label: 'ابدأ بالسبب', description: 'حدّد المشكلة المفيدة قبل اختيار الأدوات.' },
      { title: 'البناء', label: 'اجعل الأجزاء تعمل معًا', description: 'اربط الواجهة وواجهات API والبيانات والبنية في منتج واحد.' },
      { title: 'التحسين', label: 'اهتم بالتفاصيل', description: 'حسّن التوافق مع الشاشات وإمكانية الوصول ووضوح التفاعل.' },
    ],
  },
} as const;

export const ApproachSection = () => {
  const { language, direction } = useLanguage();
  const content = copy[language];

  return (
    <section id="approach" className="approach-section section-anchor" aria-labelledby="approach-title" dir={direction}>
      <div className="approach-heading">
        <div>
          <p className="approach-eyebrow"><span />{content.eyebrow}</p>
          <h2 id="approach-title">{content.title}</h2>
        </div>
        <p className="approach-description">{content.description}</p>
      </div>

      <div className="approach-route" aria-hidden="true">
        <svg className="approach-curve-desktop" viewBox="0 0 1000 190" preserveAspectRatio="none">
          <defs>
            <linearGradient id="approach-line-gradient" x1="0" x2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity=".2" />
              <stop offset="48%" stopColor="currentColor" stopOpacity=".8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity=".28" />
            </linearGradient>
          </defs>
          <motion.path
            className="approach-curve-path"
          d="M 166 138 C 290 138 300 44 500 44 C 700 44 710 138 834 138"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            className="approach-curve-stems"
            d="M 166 138 L 166 190 M 500 44 L 500 190 M 834 138 L 834 190"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: .65, delay: .7, ease: 'easeOut' }}
          />
          {[{ cx: 166, cy: 138 }, { cx: 500, cy: 44 }, { cx: 834, cy: 138 }].map((point, index) => (
            <motion.g key={point.cx} initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.7 }} transition={{ delay: 0.45 + index * 0.2, type: 'spring', stiffness: 230, damping: 18 }} style={{ transformOrigin: `${point.cx}px ${point.cy}px` }}>
              <circle className="approach-node-halo" cx={point.cx} cy={point.cy} r="11" />
              <circle className="approach-node" cx={point.cx} cy={point.cy} r="4" />
            </motion.g>
          ))}
          <motion.circle
            className="approach-traveler"
            r="4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 1, 0], cx: [166, 500, 834], cy: [138, 44, 138] }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 2.4, delay: 1.05, ease: 'easeInOut' }}
          />
        </svg>
        <svg className="approach-curve-mobile" viewBox="0 0 120 620" preserveAspectRatio="none">
          <motion.path
            className="approach-curve-path"
            d="M 48 12 C 104 70 92 126 48 194 C 12 252 20 302 70 342 C 112 390 96 440 48 492 C 18 530 28 572 68 608"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {[{ cx: 48, cy: 100 }, { cx: 60, cy: 350 }, { cx: 50, cy: 585 }].map((point, index) => (
            <motion.g key={point.cy} initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.45 }} transition={{ delay: 0.5 + index * 0.22, type: 'spring', stiffness: 220, damping: 18 }} style={{ transformOrigin: `${point.cx}px ${point.cy}px` }}>
              <circle className="approach-node-halo" cx={point.cx} cy={point.cy} r="9" />
              <circle className="approach-node" cx={point.cx} cy={point.cy} r="3.5" />
            </motion.g>
          ))}
          <motion.circle className="approach-traveler" r="4" initial={{ opacity: 0 }} whileInView={{ opacity: [0, 1, 1, 0], cy: [12, 194, 342, 608], cx: [48, 48, 70, 68] }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 2.8, delay: .6, ease: 'easeInOut' }} />
        </svg>
      </div>

      <div className="approach-cards">
        {content.steps.map((step, index) => {
          const Icon = [Compass, Layers3, Sparkles][index] ?? Compass;
          return (
            <motion.article
              key={step.title}
              className={`bento-card approach-card approach-card-${index + 1}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: .55, delay: index * .12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="approach-card-top">
                <span className="approach-number">0{index + 1}</span>
                <span className="approach-icon"><Icon aria-hidden="true" /></span>
              </div>
              <p className="approach-card-label">{step.label}</p>
              <h3>{step.title}</h3>
              <p className="approach-card-copy">{step.description}</p>
              <span className="approach-card-stem" aria-hidden="true" />
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};
