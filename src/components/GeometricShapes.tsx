export const CornerBracket = ({ className = '' }: { className?: string }) => (
  <div className={`absolute ${className}`}>
    <div className="w-4 h-4 border-l-2 border-t-2 border-primary" />
  </div>
);

export const GeometricBox = ({ className = '' }: { className?: string }) => (
  <div className={`border border-primary/50 ${className}`}>
    <div className="w-full h-full bg-primary/10" />
  </div>
);

export const AnimatedSquare = ({ className = '' }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-8 h-8 border border-primary animate-pulse-slow" />
    <div className="absolute inset-2 w-4 h-4 bg-primary/20" />
  </div>
);
