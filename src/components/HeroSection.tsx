import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { CornerBracket, AnimatedSquare } from './GeometricShapes';
import { motion } from 'framer-motion';
import { heroItem, pageFade, staggerContainer, staggerItem } from '@/lib/motion';

export const HeroSection = () => {
  const { t, direction } = useLanguage();

  return (
    <motion.section
      id="home"
      className="min-h-screen pt-24 pb-16 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={pageFade}
    >
      {/* Decorative Elements */}
      <motion.div className="absolute top-32 left-8 opacity-50" animate={{ y: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={4} cols={4} />
      </motion.div>
      <motion.div className="absolute bottom-32 right-8 opacity-50" animate={{ y: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={6} cols={6} />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}>
        <CornerBracket className="top-40 left-4" />
      </motion.div>
      <motion.div className="absolute bottom-40 left-20 opacity-40" animate={{ rotate: [0, 5, 0, -5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
        <AnimatedSquare className="relative" />
      </motion.div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Text Content */}
          <motion.div
            className={`space-y-6 ${direction === 'rtl' ? 'lg:order-2' : ''}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="text-muted-foreground font-mono text-lg" variants={heroItem}>
              {t.hero.greeting}
            </motion.p>
            <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-mono leading-tight" variants={heroItem}>
              <span className="text-primary glow-text">{t.hero.name}</span>
            </motion.h1>
            <motion.h2 className="text-xl md:text-2xl font-mono text-foreground" variants={heroItem}>
              <span className="text-primary">{t.hero.role1}</span>
              <span className="text-muted-foreground"> {t.hero.and} </span>
              <span className="text-foreground">{t.hero.role2}</span>
            </motion.h2>
            
            <motion.p className="text-muted-foreground font-mono text-lg max-w-lg" variants={heroItem}>
              {t.hero.description}
            </motion.p>

            <motion.div className="flex flex-wrap gap-4" variants={staggerContainer}>
              <motion.a 
                href="#projects" 
                className="px-6 py-3 bg-primary text-primary-foreground font-mono hover-glow transition-all duration-300"
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.hero.viewWork}
              </motion.a>
              <motion.a 
                href="#contacts" 
                className="px-6 py-3 border border-primary text-primary font-mono hover-glow hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.hero.contactMe}
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Hero Image Area */}
          <motion.div
            className={`relative ${direction === 'rtl' ? 'lg:order-1' : ''}`}
            initial={{ opacity: 0, x: direction === 'rtl' ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          >
            <motion.div className="relative w-full aspect-square max-w-md mx-auto" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              {/* Background geometric shapes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div className="w-64 h-64 border border-primary/30 rotate-12" animate={{ rotate: [12, 18, 12] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.div className="absolute w-48 h-48 border border-primary/20 -rotate-6" animate={{ rotate: [-6, -10, -6] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
              </div>
              
              {/* Profile placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div className="w-56 h-72 bg-gradient-to-b from-primary/20 to-transparent border border-border rounded-sm overflow-hidden" whileHover={{ scale: 1.02, rotate: -1 }} transition={{ duration: 0.3 }}>
                  <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                    <img src='/assets/ael-fagr.png' className='w-full h-full object-cover object-center'/>
                  </div>
                </motion.div>
              </div>

              {/* Decorative dots */}
              <motion.div className="absolute top-4 right-0" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity }}>
                <DotGrid rows={4} cols={4} />
              </motion.div>
              <motion.div className="absolute bottom-8 left-0" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 5, repeat: Infinity }}>
                <DotGrid rows={3} cols={3} />
              </motion.div>

              {/* Currently working badge */}
              <motion.div className="absolute bottom-4 left-4 right-4 bg-card border border-border p-3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
                  <span className="text-muted-foreground text-xs font-mono">
                    {t.hero.currentlyWorking}
                  </span>
                </div>
                <p className="text-foreground font-mono font-semibold mt-1">
                  {t.hero.portfolio}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Quote Section */}
        <motion.div className="mt-16 py-8 border-t border-b border-border max-w-2xl mx-auto text-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
          <div className="text-4xl text-primary mb-2">"</div>
          <p className="text-lg font-mono text-foreground italic">
            {t.quote.text}
          </p>
          <div className="text-4xl text-primary mt-2">"</div>
          <p className="text-muted-foreground font-mono mt-4">- {t.quote.author}</p>
        </motion.div>
      </div>
    </motion.section>
  );
};
