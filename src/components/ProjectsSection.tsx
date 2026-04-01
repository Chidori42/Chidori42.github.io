import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectCard } from './ProjectCard';
import { DotGrid } from './DotGrid';
import { motion } from 'framer-motion';
import { sectionTitle, staggerContainer, staggerItem } from '@/lib/motion';

const onProgress = [
  {
    title: 'Hirefy',
    abbrev: '/assets/Hirefy.png',
    description: 'Smart Applicant Tracking System A modern hiring platform designed to bridge the gap between recruiters and candidates',
    team: [
      {profilePng:'/team/eaboudi.jpg', name:'EL HOUSSAINE ABOUDI', githubUrl:'https://github.com/eaboudi'},
      {profilePng:'/team/sessarhi.jpg', name:'سفيان الصغير', githubUrl:'https://github.com/soufianeessarhir'},
      {profilePng:'/team/ibes-sed.jpg', name:'Ibrahim Es.seddyq', githubUrl:'https://github.com/ibrahimesseddyq'},
      {profilePng:'/team/aachalla.jpg', name:'Abdelmajid Achallah', githubUrl:'https://github.com/AM9-push'},
    ],
    tags: ['React', 'Express.js', 'Mysql', 'JavaScript', 'TypeScript'],
  },
];

const featuredProjects = [
  {
    title: 'UX/UI Design',
    abbrev: '/assets/ux_ui.jpg',
    description: 'Designed a clean, responsive interface in Figma with a focus on usability, modern visuals, and intuitive navigation.',
    tags: ['Figma', 'Design', 'Prototyping'],
    figmaUrl: 'https://www.figma.com/design/uENBWm0X7VeAsydvQnV25A/ft_trancendance--Copy-?m=auto&t=WnjTdGSlO6i3vwVD-1',
  },
  {
    title: 'SimpleShell',
    abbrev: '/assets/Bash-Script.jpg',
    description: 'A fundamental exercise in understanding and implementing a basic Unix shell with modern features.',
    team: [
      {profilePng:'/team/bramzil.jpg', name:'Amzil Brahim', githubUrl:'https://github.com/bramzil'},
    ],
    tags: ['C', 'Unix Shell'],
    githubUrl: "https://github.com/Chidori42/Minishell",
  },
];

const otherProjects = [
  {
    title: 'IRC Server',
    abbrev: '/assets/irc-server.png',
    description: 'Developed a basic IRC server in C++ adhering to RFC 2812, supporting multiple client connections and real-time communication.',
    githubUrl: "https://github.com/Chidori42/Irc",
    team: [
      {profilePng:'/team/yakazdao.jpg', name:'Younes Akazdaou', githubUrl:'https://github.com/Younes-AK'},
      {profilePng:'/team/ezahiri.jpg', name:'El Mustapha Zahiri', githubUrl:'https://github.com/ezahiri10'},
    ],
    tags: ['C++', 'Networking'],
  },
  {
    title: 'RayFlow Engine',
    abbrev: '/assets/3dgame.png',
    description: 'A retro-inspired 3D game engine showcasing raycasting, graphics rendering, and first-person perspective.',
    githubUrl: "https://github.com/Chidori42/Cube_3d ",
    tags: ['C', 'Graphics', 'Game Dev'],
  },
  {
    title: 'Path Finding Visualizer',
    abbrev: '/assets/path-finding.png',
    description: 'A visual simulation of pathfinding algorithms (floodfill, BFS) with interactive demonstrations.',
    githubUrl: "https://github.com/Chidori42/Floodfill",
    tags: ['C++', 'Algorithms'],
  },
];

export const ProjectsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="projects" className="py-20 relative">
      <motion.div className="absolute top-20 right-8 opacity-30" animate={{ y: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={5} cols={5} />
      </motion.div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div className="flex items-center justify-between mb-12" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={staggerContainer}>
          <motion.h2 className="text-3xl font-mono" variants={sectionTitle}>
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.title.replace('#', '')}</span>
          </motion.h2>
          <motion.a href="https://github.com/Chidori42" className="text-muted-foreground hover:text-[#171d8baa] font-mono text-sm transition-colors" variants={sectionTitle} whileHover={{ y: -2 }}>
            {t.projects.viewAll}
          </motion.a>
        </motion.div>

        {/* OnProgress Projects */}
        <div className="mb-16">
          <motion.h3 className="text-xl font-mono mb-8" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.onProgress.replace('#', '')}</span>
          </motion.h3>
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {onProgress.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                {...project}
                tags={project.tags}
                abbrev={project.abbrev}
                liveLabel={t.projects.live}
                cachedLabel={t.projects.cached}
                githubLabel={t.projects.github}
                figmaLabel={t.projects.figma}
                motionProps={{ variants: staggerItem }}
              />
            ))}
          </motion.div>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <motion.h3 className="text-xl font-mono mb-8" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.completeApps.replace('#', '')}</span>
          </motion.h3>
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                {...project}
                tags={project.tags}
                abbrev={project.abbrev}
                githubUrl={project.githubUrl}
                figmaUrl={project.figmaUrl}
                liveLabel={t.projects.live}
                cachedLabel={t.projects.cached}
                githubLabel={t.projects.github}
                figmaLabel={t.projects.figma}
                motionProps={{ variants: staggerItem }}
              />
            ))}
          </motion.div>
        </div>

        {/* Small Projects */}
        <div>
          <motion.h3 className="text-xl font-mono mb-8" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.smallProjects.replace('#', '')}</span>
          </motion.h3>
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {otherProjects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                {...project}
                tags={project.tags}
                abbrev={project.abbrev}
                githubUrl={project.githubUrl}
                liveLabel={t.projects.live}
                cachedLabel={t.projects.cached}
                githubLabel={t.projects.github}
                figmaLabel={t.projects.figma}
                motionProps={{ variants: staggerItem }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
