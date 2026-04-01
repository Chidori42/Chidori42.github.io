import { Github, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <motion.div className="flex flex-col md:flex-row items-center justify-between gap-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
          {/* Left: Logo and Info */}
          <motion.div className="flex items-center gap-4" variants={staggerItem}>
            <motion.a href="#home" className="flex items-center gap-2 text-foreground font-mono font-bold" whileHover={{ y: -2 }}>
              <span className="text-primary">{'<'}</span>
              Abdellatif
              <span className="text-primary">{'/>'}</span>
            </motion.a>
            <span className="text-muted-foreground font-mono text-sm">
              elfagrouch9@gmail.com
            </span>
          </motion.div>

          {/* Center: Role */}
          <motion.p className="text-muted-foreground font-mono text-sm" variants={staggerItem}>
            {t.footer.role}
          </motion.p>

          {/* Right: Social Links */}
          <motion.div className="flex items-center gap-4" variants={staggerItem}>
            <span className="text-foreground font-mono text-sm">{t.footer.media}</span>
            <div className="flex items-center gap-3">
              <motion.a href="https://github.com/Chidori42" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ y: -3 }}>
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a href="https://linkedin.com/in/abdellatifelfagrouch/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ y: -3 }}>
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a href="mailto:elfagrouch9@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ y: -3 }}>
                <Mail className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div className="mt-6 pt-6 border-t border-border text-center" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
          <p className="text-muted-foreground font-mono text-sm">
            {t.footer.copyright}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
