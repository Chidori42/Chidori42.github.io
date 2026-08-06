import { motion } from 'framer-motion';
import React from 'react';
export const ShinyPill = ({ children, className, sheenColor = 'hsl(var(--primary))' }) => {
    return (React.createElement(motion.div, { className: `relative overflow-hidden ${className || ''}`, whileHover: "hover", initial: "initial" },
        children,
        React.createElement(motion.div, { className: "absolute inset-0 pointer-events-none", variants: {
                initial: { x: '-100%', skewX: -15 },
                hover: { x: ['-100%', '200%'], transition: { duration: 0.8, ease: 'easeInOut' } },
            }, style: {
                background: `linear-gradient(90deg, transparent, ${sheenColor}40, transparent)`,
            } })));
};
