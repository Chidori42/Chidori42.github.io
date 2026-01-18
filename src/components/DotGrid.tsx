interface DotGridProps {
  className?: string;
  rows?: number;
  cols?: number;
}

export const DotGrid = ({ className = '', rows = 5, cols = 5 }: DotGridProps) => {
  return (
    <div className={`grid gap-3 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          className="w-1 h-1 rounded-full bg-muted-foreground/30"
        />
      ))}
    </div>
  );
};
