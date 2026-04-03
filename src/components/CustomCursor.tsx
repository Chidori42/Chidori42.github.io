import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CustomCursorProps {
  hideDefaultCursor?: boolean;
}

export const CustomCursor = ({ hideDefaultCursor = true }: CustomCursorProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 420, damping: 24, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 420, damping: 24, mass: 0.45 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePointerMode = () => {
      setIsPointerFine(finePointer.matches && !reducedMotion.matches);
      if (!finePointer.matches || reducedMotion.matches) {
        setIsVisible(false);
      }
    };

    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setIsVisible(true);

      const target = event.target as HTMLElement | null;
      setIsHovering(Boolean(target?.closest('a, button, input, textarea, select, [role="button"]')));
    };

    const handleLeave = () => setIsVisible(false);

    updatePointerMode();
    finePointer.addEventListener('change', updatePointerMode);
    reducedMotion.addEventListener('change', updatePointerMode);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);

    if (hideDefaultCursor) {
      document.documentElement.style.cursor = 'none';
    }

    return () => {
      if (hideDefaultCursor) {
        document.documentElement.style.cursor = 'auto';
      }
      finePointer.removeEventListener('change', updatePointerMode);
      reducedMotion.removeEventListener('change', updatePointerMode);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [x, y, hideDefaultCursor]);

  if (!isPointerFine) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden lg:block"
      style={{ x: springX, y: springY }}
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, scale: 0.4 },
        visible: { opacity: 1, scale: 1 },
      }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2 rounded-full border backdrop-blur-sm"
        animate={{
          width: isHovering ? 30 : 20,
          height: isHovering ? 30 : 20,
          scale: isHovering ? 1.06 : 1,
          rotate: isHovering ? 16 : 0,
          borderColor: isHovering ? 'hsl(var(--primary) / 0.95)' : 'hsl(var(--primary) / 0.65)',
          background:
            isHovering
              ? 'radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.38) 0%, hsl(var(--primary) / 0.1) 58%, transparent 100%)'
              : 'radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.24) 0%, hsl(var(--primary) / 0.08) 58%, transparent 100%)',
          boxShadow: isHovering
            ? '0 0 0 1px hsl(var(--primary) / 0.3) inset, 0 0 26px hsl(var(--primary) / 0.45), 0 0 56px hsl(var(--primary) / 0.2)'
            : '0 0 0 1px hsl(var(--primary) / 0.18) inset, 0 0 16px hsl(var(--primary) / 0.28)',
        }}
        transition={{ type: 'spring', stiffness: 310, damping: 24, mass: 0.5 }}
      />
    </motion.div>
  );
};
