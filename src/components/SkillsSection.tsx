import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import { motion } from 'framer-motion';
import { sectionTitle, staggerContainer, staggerItem } from '@/lib/motion';

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
      <motion.div className="absolute top-10 left-8 opacity-30" animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={4} cols={4} />
      </motion.div>
      <motion.div className="absolute bottom-20 right-16 opacity-30" animate={{ y: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={6} cols={6} />
      </motion.div>

      <div className="container mx-auto px-4 ">
        <motion.h2 className="text-3xl font-mono mb-12" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={sectionTitle}>
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.skills.title.replace('#', '')}</span>
        </motion.h2>

        <motion.div className="grid lg:grid-cols-1 w-full lg:w-[600px] mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={staggerContainer}>

          {/* Learning Card */}
          <motion.div className="border border-border bg-card p-6" variants={staggerItem} whileHover={{ y: -4 }}>
            <motion.h3 className="text-xl font-mono font-semibold text-primary mb-4" variants={staggerItem}>
              {t.skills.learning}
            </motion.h3>
            <motion.p className="text-muted-foreground font-mono mb-6" variants={staggerItem}>
              {t.skills.learningDesc}
            </motion.p>
            <motion.div className="grid grid-cols-2 gap-4" variants={staggerContainer}>
              <motion.div className="text-center p-4 border border-border" variants={staggerItem} whileHover={{ scale: 1.02 }}>
                <span className="text-3xl font-mono font-bold text-primary block">
                  {t.skills.projects}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {t.skills.projectsLabel}
                </span>
              </motion.div>
              <motion.div className="text-center p-4 border border-border" variants={staggerItem} whileHover={{ scale: 1.02 }}>
                <span className="text-3xl font-mono font-bold text-primary block">
                  {t.skills.years}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {t.skills.yearsLabel}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
          {categories.map((category) => (
            <motion.div key={category.key} className="skill-box" variants={staggerItem} whileHover={{ y: -5 }}>
              <motion.h3 className="text-foreground font-mono font-semibold mb-4 border-b border-border pb-2" variants={staggerItem}>
                {category.title}
              </motion.h3>
              <ul className="space-y-2">
                {category.data.map((skill, index) => (
                  <li key={index} className="text-muted-foreground font-mono text-sm">
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
