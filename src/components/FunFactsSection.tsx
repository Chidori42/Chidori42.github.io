import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';

export const FunFactsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 relative">
      <div className="absolute bottom-10 left-8 opacity-30">
        <DotGrid rows={4} cols={4} />
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-mono mb-12">
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.funFacts.title.replace('#', '')}</span>
        </h2>

        <div className="flex flex-wrap gap-4">
          {t.funFacts.facts.map((fact, index) => (
            <div key={index} className="fun-fact-tag font-mono hover:border-primary hover:text-primary transition-colors cursor-default">
              {fact}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
