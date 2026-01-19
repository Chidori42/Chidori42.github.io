import { ExternalLink, Github } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  abbrev?: string;
  liveUrl?: string;
  githubUrl?: string;
  figmaUrl?: string;
  cached?: boolean;
  liveLabel: string;
  cachedLabel: string;
  githubLabel: string;
  figmaLabel: string;
}

export const ProjectCard = ({
  title,
  description,
  tags,
  abbrev,
  liveUrl,
  githubUrl,
  figmaUrl,
  cached,
  liveLabel,
  cachedLabel,
  githubLabel,
  figmaLabel,
}: ProjectCardProps) => {
  return (
    <div className="project-card group">
      {/* Project Abbreviation Header */}
      <div className="aspect-video bg-secondary mb-4 overflow-hidden flex items-center justify-center">
        {title === "Portfolio" ? (
          <iframe 
            src="/"
            className="w-full h-full border-none "
            title="Portfolio Preview"
          />
        ) : (
          <img 
            src={abbrev} 
            alt={title} 
            className="w-full h-full object-cover object-center" 
          />
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <span key={index} className="tag-badge">
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-lg font-mono font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm font-mono mb-4 line-clamp-3">
        {description}
      </p>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-sm font-mono text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Github className="w-3 h-3" />
            {githubLabel}
          </a>
        )}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-sm font-mono text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {liveLabel}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {cached && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-sm font-mono text-muted-foreground">
            {cachedLabel}
          </span>
        )}
        {figmaUrl && (
          <a
            href={figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-sm font-mono text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {figmaLabel}
          </a>
        )}
      </div>
    </div>
  );
};
