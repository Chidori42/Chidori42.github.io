import { ExternalLink, Github, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { hoverLift } from '@/lib/motion';

interface TeamMember {
  name: string;
  profilePng: string;
  githubUrl: string;
}

interface ProjectCardProps {
  title: string;
  description: string;
  team?: TeamMember[];
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
  motionProps?: {
    variants?: Variants;
  };
}

export const ProjectCard = ({
  title,
  description,
  tags,
  team,
  abbrev,
  liveUrl,
  githubUrl,
  figmaUrl,
  cached,
  liveLabel,
  cachedLabel,
  githubLabel,
  figmaLabel,
  motionProps,
}: ProjectCardProps) => {
  return (
    <motion.div
      className="project-card group border border-border p-4 hover:border-primary transition-all flex flex-col h-full"
      variants={motionProps?.variants}
      whileHover={hoverLift}
    >
      {/* Project Abbreviation Header */}
      <div className="aspect-video bg-secondary mb-4 overflow-hidden flex items-center justify-center">
        <img 
          src={abbrev} 
          alt={title} 
          className="w-full h-full object-cover object-center" 
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <span key={index} className="tag-badge text-[10px] px-2 py-0.5 border border-border font-mono text-muted-foreground">
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

      {/* Team Section */}
      {team && team.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3">
            <Users className="w-3 h-3" />
            <span>{team.length > 1 ? 'Team Members' : 'Contributor'}:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {team.map((member, idx) => (
              <a
                key={idx}
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={member.name}
                className="flex items-center gap-2 pr-3 pl-1 py-1  transition-all group/member"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border group-hover/member:border-primary">
                  <img 
                    src={member.profilePng || '/assets/default-avatar.png'} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* <span className="text-[11px] font-mono whitespace-nowrap">{member.name}</span> */}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3 mt-auto pt-2">
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
        {cached && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-sm font-mono text-muted-foreground">
            {cachedLabel}
          </span>
        )}
      </div>
    </motion.div>
  );
};