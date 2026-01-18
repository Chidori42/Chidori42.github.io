import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';

const categorizedSkills = {
  languages: ['C', 'C++', 'JavaScript', 'TypeScript'],
  frameworks: ['React', 'Express.js', 'Node.js', 'Fastify.js'],
  tools: ['Docker', 'Git', 'VSCode', 'Figma', 'Linux', 'Vim', 'Prisma'],
  databases: ['SQLite', 'MongoDB', 'MariaDB'],
  other: ['HTML5', 'CSS3', 'REST API', 'Unix Shell'],
};

export const SkillsSection = () => {
  const { t, direction } = useLanguage();

  const categories = [
    { key: 'languages', title: t.skills.languages, data: categorizedSkills.languages },
    { key: 'frameworks', title: t.skills.frameworks, data: categorizedSkills.frameworks },
    { key: 'tools', title: t.skills.tools, data: categorizedSkills.tools },
    { key: 'databases', title: t.skills.databases, data: categorizedSkills.databases },
    { key: 'other', title: t.skills.other, data: categorizedSkills.other },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute top-10 left-8 opacity-30">
        <DotGrid rows={4} cols={4} />
      </div>
      <div className="absolute bottom-20 right-16 opacity-30">
        <DotGrid rows={6} cols={6} />
      </div>

      <div className="container mx-auto px-4 ">
        <h2 className="text-3xl font-mono mb-12">
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.skills.title.replace('#', '')}</span>
        </h2>

        <div className="grid lg:grid-cols-1 w-full lg:w-[600px] mx-auto">

          {/* Learning Card */}
          <div className="border border-border bg-card p-6">
            <h3 className="text-xl font-mono font-semibold text-primary mb-4">
              {t.skills.learning}
            </h3>
            <p className="text-muted-foreground font-mono mb-6">
              {t.skills.learningDesc}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border">
                <span className="text-3xl font-mono font-bold text-primary block">
                  {t.skills.projects}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {t.skills.projectsLabel}
                </span>
              </div>
              <div className="text-center p-4 border border-border">
                <span className="text-3xl font-mono font-bold text-primary block">
                  {t.skills.years}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {t.skills.yearsLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
          {categories.map((category) => (
            <div key={category.key} className="skill-box">
              <h3 className="text-foreground font-mono font-semibold mb-4 border-b border-border pb-2">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.data.map((skill, index) => (
                  <li key={index} className="text-muted-foreground font-mono text-sm">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
