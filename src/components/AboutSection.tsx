import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { Code, Lightbulb, Users, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { sectionTitle, staggerContainer, staggerItem } from '@/lib/motion';
import { useIsMobile } from '@/hooks/use-mobile';

export const AboutSection = () => {
  const { t, direction } = useLanguage();
  const isMobile = useIsMobile();

  const expertiseItems = [
    { icon: Code, ...t.about.expertise.technical },
    { icon: Lightbulb, ...t.about.expertise.problem },
    { icon: Users, ...t.about.expertise.user },
    { icon: Rocket, ...t.about.expertise.innovation },
  ];

  return (
    <section id="about-me" className="py-20 relative overflow-x-hidden">
      <motion.div className="absolute top-20 right-8 opacity-30" animate={{ y: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={5} cols={5} />
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.h2 className="text-3xl font-mono mb-4" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={sectionTitle}>
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.about.title.replace('#', '')}</span>
        </motion.h2>
        <motion.p className="text-muted-foreground font-mono mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>{t.about.subtitle}</motion.p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Area */}
          <motion.div className={`relative ${direction === 'rtl' ? 'lg:order-2' : ''}`} initial={{ opacity: 0, x: isMobile ? 0 : direction === 'rtl' ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.7 }}>
            <motion.div className="relative max-w-sm mx-auto" animate={isMobile ? undefined : { y: [0, -6, 0] }} transition={isMobile ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
              {/* Decorative elements */}
              <motion.div className="absolute -top-4 -right-4" animate={isMobile ? undefined : { opacity: [0.35, 0.8, 0.35] }} transition={isMobile ? undefined : { duration: 6, repeat: Infinity }}>
                <DotGrid rows={5} cols={5} />
              </motion.div>
              <motion.div className="absolute -bottom-4 -left-4" animate={isMobile ? undefined : { opacity: [0.35, 0.8, 0.35] }} transition={isMobile ? undefined : { duration: 7, repeat: Infinity }}>
                <DotGrid rows={4} cols={4} />
              </motion.div>

              {/* Image placeholder */}
              <motion.div className="relative z-10 aspect-square bg-gradient-to-br from-primary/20 to-secondary border border-border" whileHover={isMobile ? undefined : { scale: 1.02, rotate: -1 }} transition={{ duration: 0.3 }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src='/assets/ael-fagr.png' className='w-full h-full object-cover object-center'/>
                </div>
              </motion.div>

              {/* Corner brackets */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-primary" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-primary" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-primary" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-primary" />

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <motion.a
                  target="_blank"
                  href="/cv.pdf"
                  className="px-4 py-2 border border-primary text-primary font-mono text-sm hover:bg-primary hover:text-primary-foreground transition-all"
                  whileHover={isMobile ? undefined : { y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.about.readMore}
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div className={`space-y-6 ${direction === 'rtl' ? 'lg:order-1' : ''}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={staggerContainer}>
            <motion.p className="text-foreground font-mono text-lg" variants={staggerItem}>
              {t.about.greeting}
            </motion.p>
            <motion.p className="text-muted-foreground font-mono" variants={staggerItem}>
              {t.about.paragraph1}
            </motion.p>
            <motion.p className="text-muted-foreground font-mono" variants={staggerItem}>
              {t.about.paragraph2}
            </motion.p>
            <motion.p className="text-muted-foreground font-mono" variants={staggerItem}>
              {t.about.paragraph3}
            </motion.p>
          </motion.div>
        </div>

        {/* Expertise Cards */}
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
          {expertiseItems.map((item, index) => (
            <motion.div key={index} className="border border-border bg-card p-6 hover:border-primary transition-colors group" variants={staggerItem} whileHover={isMobile ? undefined : { y: -5 }}>
              <motion.div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors" whileHover={isMobile ? undefined : { scale: 1.06 }}>
                <item.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-foreground font-mono font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground font-mono text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
