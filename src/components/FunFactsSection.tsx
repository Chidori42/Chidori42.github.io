import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { motion } from 'framer-motion';
import { sectionTitle, staggerContainer, staggerItem } from '@/lib/motion';

export const FunFactsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 relative">
      <motion.div className="absolute bottom-10 left-8 opacity-30" animate={{ y: [0, 6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={4} cols={4} />
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.h2 className="text-3xl font-mono mb-12" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={sectionTitle}>
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.funFacts.title.replace('#', '')}</span>
        </motion.h2>

        <motion.div className="flex flex-wrap gap-4" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
          {t.funFacts.facts.map((fact, index) => (
            <motion.div key={index} className="fun-fact-tag font-mono hover:border-primary hover:text-primary transition-colors cursor-default" variants={staggerItem} whileHover={{ y: -4, scale: 1.02 }}>
              {fact}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
