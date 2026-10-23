import { useEffect, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Home,
  Languages,
  Menu,
  Mail,
  Moon,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Language, translations } from '@/lib/i18n';
import { AnimatePresence, motion } from 'framer-motion';

const navigation: { href: string; label: keyof typeof translations.en.nav; icon: typeof Home }[] = [
  { href: '#home', label: 'home', icon: Home },
  { href: '#approach', label: 'approach', icon: Sparkles },
  { href: '#projects', label: 'works', icon: BriefcaseBusiness },
  { href: '#skills', label: 'skills', icon: Code2 },
  { href: '#about-me', label: 'aboutMe', icon: UserRound },
  { href: '#education', label: 'education', icon: GraduationCap },
  { href: '#contacts', label: 'contacts', icon: Mail },
];

export const Header = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const railRef = useRef<HTMLElement>(null);
  const firstNavigationRef = useRef<HTMLAnchorElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage, direction, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const sections = navigation
      .map(({ href }) => document.getElementById(href.slice(1)))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    if (sections.length === 0) return;

    let frame = 0;
    const updateActiveSection = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        let currentSection = sections[0];
        if (atPageEnd) {
          currentSection = sections[sections.length - 1];
        } else {
          const activationLine = window.innerHeight * 0.32;
          for (const section of sections) {
            if (section.getBoundingClientRect().top > activationLine) break;
            currentSection = section;
          }
        }

        setActiveSection(currentSection.id);
      });
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isLangOpen && !isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const focusTarget = isLangOpen ? languageTriggerRef.current : menuTriggerRef.current;
        setIsLangOpen(false);
        setIsMenuOpen(false);
        focusTarget?.focus();
      }
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !railRef.current?.contains(event.target)) {
        setIsLangOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsidePress);
    };
  }, [isLangOpen, isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) firstNavigationRef.current?.focus();
  }, [isMenuOpen]);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' },
  ];

  return (
    <>
      <aside ref={railRef} className="portfolio-rail" aria-label={t.header.portfolioNavigation} dir="ltr">
        <a href="#home" className="portfolio-brand" aria-label={t.header.home}>
          <span className="aef-mark portfolio-brand-mark" aria-hidden="true" />
        </a>

        <nav id="portfolio-navigation" className={`portfolio-dock${isMenuOpen ? ' portfolio-dock-open' : ''}`} aria-label={t.header.mainNavigation}>
          {navigation.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              ref={href === '#home' ? firstNavigationRef : undefined}
              href={href}
              className={`dock-link${activeSection === href.slice(1) ? ' dock-link-active' : ''}`}
              title={t.nav[label]}
              aria-label={t.nav[label]}
              aria-current={activeSection === href.slice(1) ? 'location' : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon aria-hidden="true" />
              <span className="dock-link-label">{t.nav[label]}</span>
              <span className="dock-tooltip" aria-hidden="true">{t.nav[label]}</span>
            </a>
          ))}
        </nav>

        <div className="portfolio-rail-controls">
          <button
            type="button"
            className="rail-control"
            onClick={() => {
              toggleTheme();
              setIsLangOpen(false);
              setIsMenuOpen(false);
            }}
            aria-label={theme === 'dark' ? t.header.lightMode : t.header.darkMode}
            title={theme === 'dark' ? t.header.lightAppearance : t.header.darkAppearance}
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <div className="language-picker">
            <button
              type="button"
              ref={languageTriggerRef}
              className="rail-control language-trigger"
              onClick={() => {
                setIsMenuOpen(false);
                setIsLangOpen((open) => !open);
              }}
              aria-label={t.header.chooseLanguage}
              aria-expanded={isLangOpen}
              aria-controls="portfolio-language-options"
              aria-haspopup="true"
              title={t.header.chooseLanguage}
            >
              <Languages aria-hidden="true" />
              <span className="language-current">{language.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  id="portfolio-language-options"
                  className="language-menu"
                  role="group"
                  aria-label={t.header.selectLanguage}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      aria-pressed={language === lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                        window.requestAnimationFrame(() => languageTriggerRef.current?.focus());
                      }}
                      className={language === lang.code ? 'language-option language-option-active' : 'language-option'}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a className="rail-avatar" href="#about-me" title="Abdellatif El Fagrouch">
            <img src="/assets/ael-fagr.png" alt="Abdellatif El Fagrouch" />
          </a>
          <button
            ref={menuTriggerRef}
            type="button"
            className="mobile-menu-toggle rail-control"
            aria-label={isMenuOpen ? t.header.closeMenu : t.header.openMenu}
            aria-controls="portfolio-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => {
              setIsMenuOpen((open) => !open);
              setIsLangOpen(false);
            }}
          >
            {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </aside>

      <header className="portfolio-topbar" dir={direction}>
        <div className="topbar-intro">
          <p className="topbar-eyebrow">{t.header.eyebrow}</p>
          <h1>{t.header.title}</h1>
          <p className="topbar-subtitle">{t.header.subtitle}</p>
        </div>
        <div className="topbar-actions">
          <a className="portfolio-search" href="#projects" aria-label={t.header.exploreWork}>
            <span>{t.header.exploreWork}</span>
            <kbd>↵</kbd>
            <span className="search-submit" aria-hidden="true"><BriefcaseBusiness /></span>
          </a>
          <a className="topbar-mail" href="mailto:elfagrouch9@gmail.com" aria-label={t.header.email} title={t.header.email}>
            <Mail aria-hidden="true" />
          </a>
        </div>
      </header>
    </>
  );
};
