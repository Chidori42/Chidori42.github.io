import { Linkedin, Github, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SideDecoration = () => {
  return (
    <>
      {/* Left Side - Social Links */}
      <motion.div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-40" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
        <div className="w-px h-16 bg-border" />
        <motion.a target="_blank" href="https://github.com/Chidori42/" className="p-2 text-muted-foreground hover:text-primary transition-colors" whileHover={{ y: -3 }}>
          <Github className="w-5 h-5" />
        </motion.a>
        <motion.a target="_blank" href="https://www.linkedin.com/in/abdellatifelfagrouch/" className="p-2 text-muted-foreground hover:text-primary transition-colors" whileHover={{ y: -3 }}>
          <Linkedin className="w-5 h-5" />
        </motion.a>
        <motion.a href="/#contacts" className="p-2 text-muted-foreground hover:text-primary transition-colors" whileHover={{ y: -3 }}>
          <MessageCircle className="w-5 h-5" />
        </motion.a>
        <div className="w-px h-16 bg-border" />
      </motion.div>

      {/* Right Side - Decorative Line */}
      <motion.div className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-40" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
        <div className="w-px h-32 bg-border" />
        <motion.div className="w-2 h-2 border border-primary rotate-45" animate={{ rotate: [45, 90, 45] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="w-px h-32 bg-border" />
      </motion.div>
    </>
  );
};
