import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectCard } from './ProjectCard';
import { DotGrid } from './DotGrid';

const onProgress = [
  {
    title: 'E-RH Connect',
    abbrev: '/assets/ERH-connect.png',
    description: 'Smart Applicant Tracking System A modern hiring platform designed to bridge the gap between recruiters and candidates',
    // githubUrl: "#",
    tags: ['React', 'Express.js', 'Mysql', 'JavaScript', 'TypeScript'],
  },
];

const featuredProjects = [
  {
    title: 'Portfolio',
    abbrev: '/assets/portfolio.png',
    description: 'A comprehensive portfolio showcasing efficient algorithms for sorting a stack of integers using limited operations.',
    tags: ['React', 'Tailwind', 'Typescript'],
    githubUrl: "https://github.com/Chidori42/Chidori42.github.io",
  },
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
      <div className="absolute top-20 right-8 opacity-30">
        <DotGrid rows={5} cols={5} />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-mono">
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.title.replace('#', '')}</span>
          </h2>
          <a href="https://github.com/Chidori42" className="text-muted-foreground hover:text-[#171d8baa] font-mono text-sm transition-colors">
            {t.projects.viewAll}
          </a>
        </div>

        {/* OnProgress Projects */}
        <div className="mb-16">
          <h3 className="text-xl font-mono mb-8">
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.onProgress.replace('#', '')}</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onProgress.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                tags={project.tags}
                abbrev={project.abbrev}
                liveLabel={t.projects.live}
                cachedLabel={t.projects.cached}
                githubLabel={t.projects.github}
                figmaLabel={t.projects.figma}
              />
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h3 className="text-xl font-mono mb-8">
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.completeApps.replace('#', '')}</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                tags={project.tags}
                abbrev={project.abbrev}
                githubUrl={project.githubUrl}
                figmaUrl={project.figmaUrl}
                liveLabel={t.projects.live}
                cachedLabel={t.projects.cached}
                githubLabel={t.projects.github}
                figmaLabel={t.projects.figma}
              />
            ))}
          </div>
        </div>

        {/* Small Projects */}
        <div>
          <h3 className="text-xl font-mono mb-8">
            <span className="text-primary">#</span>
            <span className="text-foreground">{t.projects.smallProjects.replace('#', '')}</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                tags={project.tags}
                abbrev={project.abbrev}
                githubUrl={project.githubUrl}
                liveLabel={t.projects.live}
                cachedLabel={t.projects.cached}
                githubLabel={t.projects.github}
                figmaLabel={t.projects.figma}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
