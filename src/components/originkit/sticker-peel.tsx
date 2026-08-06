import { motion } from 'framer-motion';
import React from 'react';
export const StickerPeel = ({ children, className, perspective = 800 }) => {
    return (React.createElement(motion.div, { className: `relative ${className || ''}`, whileHover: "hover", initial: "initial", style: { perspective } },
        React.createElement(motion.div, { variants: {
                initial: { rotateX: 0, rotateY: 0, scale: 1, z: 0 },
                hover: {
                    rotateX: [0, -8, 0],
                    rotateY: [0, 6, 0],
                    scale: 1.02,
                    z: 20,
                    transition: { duration: 0.6, ease: 'easeOut' },
                },
            }, style: { transformStyle: 'preserve-3d' } }, children)));
};
