import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="portfolio-hero section-anchor">
      <div className="portfolio-hero-grid">
        <motion.div
          className="bento-card hero-copy-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-copy-topline">
            <span className="eyebrow-pill"><span className="availability-dot" /> {t.hero.availability}</span>
            <span className="hero-index">{t.hero.index}</span>
          </div>
          <div className="hero-copy-body">
            <p className="hero-greeting">{t.hero.greeting}</p>
            <h2>{t.hero.name}<span className="hero-period">.</span></h2>
            <p className="hero-role">
              <span>{t.hero.role1}</span> {t.hero.and} <span className="hero-role-muted">{t.hero.role2}</span>
            </p>
            <p className="hero-description">{t.hero.description}</p>
            <div className="hero-actions">
              <a className="button-primary" href="#projects">{t.hero.viewWork}<ArrowUpRight aria-hidden="true" /></a>
              <a className="button-secondary" href="#contacts">{t.hero.contactMe}<ArrowDown aria-hidden="true" /></a>
            </div>
          </div>
          <div className="hero-card-footer">
            <span><MapPin aria-hidden="true" /> {t.hero.location}</span>
            <span>{t.hero.network}</span>
          </div>
        </motion.div>

        <motion.div
          className="bento-card hero-portrait-card"
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src="/assets/ael-fagr.png" alt="Portrait of Abdellatif El Fagrouch" />
          <div className="portrait-gradient" />
          <div className="portrait-label">
            <span className="portrait-label-caption">{t.hero.buildingCaption}</span>
            <strong>{t.hero.buildingTitle}</strong>
          </div>
          <div className="portrait-index">AEF<span>®</span></div>
        </motion.div>
      </div>

      <div className="hero-stats-grid">
        <div className="bento-card hero-stat-card">
          <span className="stat-label">{t.hero.selectedWork}</span>
          <strong>{t.skills.projects}</strong>
          <span className="stat-note">{t.hero.projectsNote}</span>
        </div>
        <div className="bento-card hero-stat-card">
          <span className="stat-label">{t.hero.inCraft}</span>
          <strong>{t.skills.years}</strong>
          <span className="stat-note">{t.hero.yearsNote}</span>
        </div>
        <div className="bento-card hero-quote-card">
          <span className="quote-mark">“</span>
          <div>
            <p>{t.quote.text}</p>
            <span>— {t.quote.author}</span>
          </div>
          <ArrowUpRight aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};
