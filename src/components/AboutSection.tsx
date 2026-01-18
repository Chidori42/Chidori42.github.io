import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { Code, Lightbulb, Users, Rocket } from 'lucide-react';

export const AboutSection = () => {
  const { t, direction } = useLanguage();

  const expertiseItems = [
    { icon: Code, ...t.about.expertise.technical },
    { icon: Lightbulb, ...t.about.expertise.problem },
    { icon: Users, ...t.about.expertise.user },
    { icon: Rocket, ...t.about.expertise.innovation },
  ];

  return (
    <section id="about-me" className="py-20 relative">
      <div className="absolute top-20 right-8 opacity-30">
        <DotGrid rows={5} cols={5} />
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-mono mb-4">
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.about.title.replace('#', '')}</span>
        </h2>
        <p className="text-muted-foreground font-mono mb-12">{t.about.subtitle}</p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Area */}
          <div className={`relative ${direction === 'rtl' ? 'lg:order-2' : ''}`}>
            <div className="relative max-w-sm mx-auto">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4">
                <DotGrid rows={5} cols={5} />
              </div>
              <div className="absolute -bottom-4 -left-4">
                <DotGrid rows={4} cols={4} />
              </div>

              {/* Image placeholder */}
              <div className="relative z-10 aspect-square bg-gradient-to-br from-primary/20 to-secondary border border-border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src='/assets/ael-fagr.png' className='w-full h-full object-cover object-center'/>
                </div>
              </div>

              {/* Corner brackets */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-primary" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-primary" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-primary" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-primary" />

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <a
                  target="_blank"
                  href="/cv.pdf"
                  className="px-4 py-2 border border-primary text-primary font-mono text-sm hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {t.about.readMore}
                </a>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className={`space-y-6 ${direction === 'rtl' ? 'lg:order-1' : ''}`}>
            <p className="text-foreground font-mono text-lg">
              {t.about.greeting}
            </p>
            <p className="text-muted-foreground font-mono">
              {t.about.paragraph1}
            </p>
            <p className="text-muted-foreground font-mono">
              {t.about.paragraph2}
            </p>
            <p className="text-muted-foreground font-mono">
              {t.about.paragraph3}
            </p>
          </div>
        </div>

        {/* Expertise Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {expertiseItems.map((item, index) => (
            <div key={index} className="border border-border bg-card p-6 hover:border-primary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-mono font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground font-mono text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
