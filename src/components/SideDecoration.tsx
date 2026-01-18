import { Linkedin, Github, MessageCircle } from 'lucide-react';

export const SideDecoration = () => {
  return (
    <>
      {/* Left Side - Social Links */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-40">
        <div className="w-px h-16 bg-border" />
        <a target="_blank" href="https://github.com/Chidori42/" className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Github className="w-5 h-5" />
        </a>
        <a target="_blank" href="https://www.linkedin.com/in/abdellatifelfagrouch/" className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="http://abdellatifelfagrouch.me/#contacts" className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-5 h-5" />
        </a>
        <div className="w-px h-16 bg-border" />
      </div>

      {/* Right Side - Decorative Line */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-40">
        <div className="w-px h-32 bg-border" />
        <div className="w-2 h-2 border border-primary rotate-45" />
        <div className="w-px h-32 bg-border" />
      </div>
    </>
  );
};
