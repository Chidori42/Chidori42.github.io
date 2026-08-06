import { useMemo } from 'react';
import { motion } from 'framer-motion';
export const CharacterWaves = ({ className = '', text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', fontSize = 20, gap = 6, color = 'hsl(var(--primary))', }) => {
    const chars = useMemo(() => text.split(''), [text]);
    return (React.createElement("div", { className: `fixed inset-0 pointer-events-none overflow-hidden ${className}`, style: { opacity: 0.08, zIndex: -1 } },
        React.createElement("div", { className: "flex flex-wrap p-4", style: { gap } }, chars.map((char, i) => (React.createElement(motion.span, { key: i, className: "inline-block", style: { fontSize, color, lineHeight: 1 }, animate: {
                y: [0, -4, 0],
                opacity: [0.2, 0.5, 0.2],
            }, transition: {
                duration: 4 + (i % 5) * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.08,
            } }, char))))));
};
