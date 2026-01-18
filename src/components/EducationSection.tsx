import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { Calendar, MapPin } from 'lucide-react';

export const EducationSection = () => {
  const { t, direction } = useLanguage();

  return (
    <section className="py-20 relative">
      <div className="absolute top-10 left-8 opacity-30">
        <DotGrid rows={4} cols={4} />
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-mono mb-4">
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.education.title.replace('#', '')}</span>
        </h2>
        <p className="text-muted-foreground font-mono mb-12">{t.education.subtitle}</p>

        <div className="relative">
          {/* Timeline line */}
          <div className={`absolute top-0 bottom-0 w-px bg-border ${direction === 'rtl' ? 'right-4 md:right-1/2' : 'left-4 md:left-1/2'}`} />

          <div className="space-y-12">
            {t.education.items.map((item, index) => (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  direction === 'rtl' 
                    ? index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    : index % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className={`absolute w-3 h-3 rounded-full bg-primary border-4 border-background ${
                  direction === 'rtl' ? 'right-2.5 md:right-1/2 md:-translate-x-[-50%]' : 'left-2.5 md:left-1/2 md:-translate-x-1/2'
                } top-0`} />

                {/* Content */}
                <div className={`flex-1 ${direction === 'rtl' ? 'pr-12 md:pr-0' : 'pl-12 md:pl-0'} ${
                  direction === 'rtl'
                    ? index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'
                    : index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}>
                  <div className="border border-border bg-card p-6 hover:border-primary transition-colors">
                    <div className="flex items-center gap-2 text-primary font-mono text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      {item.period}
                    </div>
                    <h3 className="text-xl font-mono font-semibold text-foreground mb-2">
                      {item.school}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
