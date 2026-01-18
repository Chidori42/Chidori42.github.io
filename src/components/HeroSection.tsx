import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { CornerBracket, AnimatedSquare } from './GeometricShapes';

export const HeroSection = () => {
  const { t, direction } = useLanguage();

  return (
    <section id="home" className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-32 left-8 opacity-50">
        <DotGrid rows={4} cols={4} />
      </div>
      <div className="absolute bottom-32 right-8 opacity-50">
        <DotGrid rows={6} cols={6} />
      </div>
      <CornerBracket className="top-40 left-4" />
      <AnimatedSquare className="absolute bottom-40 left-20 opacity-40" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Text Content */}
          <div className={`space-y-6 animate-fade-in ${direction === 'rtl' ? 'lg:order-2' : ''}`}>
            <p className="text-muted-foreground font-mono text-lg">
              {t.hero.greeting}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-mono leading-tight">
              <span className="text-primary glow-text">{t.hero.name}</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-mono text-foreground">
              <span className="text-primary">{t.hero.role1}</span>
              <span className="text-muted-foreground"> {t.hero.and} </span>
              <span className="text-foreground">{t.hero.role2}</span>
            </h2>
            
            <p className="text-muted-foreground font-mono text-lg max-w-lg">
              {t.hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <a 
                href="#projects" 
                className="px-6 py-3 bg-primary text-primary-foreground font-mono hover-glow transition-all duration-300"
              >
                {t.hero.viewWork}
              </a>
              <a 
                href="#contacts" 
                className="px-6 py-3 border border-primary text-primary font-mono hover-glow hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                {t.hero.contactMe}
              </a>
            </div>
          </div>

          {/* Hero Image Area */}
          <div className={`relative ${direction === 'rtl' ? 'lg:order-1' : ''}`}>
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Background geometric shapes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border border-primary/30 rotate-12" />
                <div className="absolute w-48 h-48 border border-primary/20 -rotate-6" />
              </div>
              
              {/* Profile placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-72 bg-gradient-to-b from-primary/20 to-transparent border border-border rounded-sm overflow-hidden">
                  <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                    <img src='/assets/ael-fagr.png' className='w-full h-full object-cover object-center'/>
                  </div>
                </div>
              </div>

              {/* Decorative dots */}
              <div className="absolute top-4 right-0">
                <DotGrid rows={4} cols={4} />
              </div>
              <div className="absolute bottom-8 left-0">
                <DotGrid rows={3} cols={3} />
              </div>

              {/* Currently working badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-card border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
                  <span className="text-muted-foreground text-xs font-mono">
                    {t.hero.currentlyWorking}
                  </span>
                </div>
                <p className="text-foreground font-mono font-semibold mt-1">
                  {t.hero.portfolio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="mt-16 py-8 border-t border-b border-border max-w-2xl mx-auto text-center">
          <div className="text-4xl text-primary mb-2">"</div>
          <p className="text-lg font-mono text-foreground italic">
            {t.quote.text}
          </p>
          <div className="text-4xl text-primary mt-2">"</div>
          <p className="text-muted-foreground font-mono mt-4">- {t.quote.author}</p>
        </div>
      </div>
    </section>
  );
};
