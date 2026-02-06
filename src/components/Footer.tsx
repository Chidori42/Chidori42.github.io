import { Github, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Logo and Info */}
          <div className="flex items-center gap-4">
            <a href="#home" className="flex items-center gap-2 text-foreground font-mono font-bold">
              <span className="text-primary">{'<'}</span>
              Abdellatif
              <span className="text-primary">{'/>'}</span>
            </a>
            <span className="text-muted-foreground font-mono text-sm">
              elfagrouch9@gmail.com
            </span>
          </div>

          {/* Center: Role */}
          <p className="text-muted-foreground font-mono text-sm">
            {t.footer.role}
          </p>

          {/* Right: Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-foreground font-mono text-sm">{t.footer.media}</span>
            <div className="flex items-center gap-3">
              <a href="https://github.com/Chidori42" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/abdellatifelfagrouch/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:elfagrouch9@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground font-mono text-sm">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
