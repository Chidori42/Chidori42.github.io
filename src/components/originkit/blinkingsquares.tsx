import { useMemo } from 'react';
import { motion } from 'framer-motion';
export const BlinkingSquares = ({ className = '', count = 20, color = 'hsl(var(--primary))', opacity = 0.08, }) => {
    const squares = useMemo(() => {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 6 + Math.random() * 14,
                delay: Math.random() * 4,
            });
        }
        return items;
    }, [count]);
    return (React.createElement("div", { className: `absolute inset-0 pointer-events-none overflow-hidden ${className}`, style: { opacity } }, squares.map((sq) => (React.createElement(motion.div, { key: sq.id, className: "absolute", style: {
            left: `${sq.x}%`,
            top: `${sq.y}%`,
            width: sq.size,
            height: sq.size,
            backgroundColor: color,
        }, animate: {
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.15, 1],
        }, transition: {
            duration: 5 + sq.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: sq.delay,
        } })))));
};
