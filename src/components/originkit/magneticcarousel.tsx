import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import React from 'react';
export const MagneticCarousel = ({ children, className = '', itemClassName = '', magnetStrength = 0.3, }) => {
    const containerRef = useRef(null);
    return (React.createElement("div", { ref: containerRef, className: `flex gap-4 py-4 overflow-visible ${className}` }, React.Children.map(children, (child, index) => (React.createElement(MagneticItem, { key: index, strength: magnetStrength, className: itemClassName }, child)))));
};
const MagneticItem = ({ children, strength, className }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { damping: 15, stiffness: 150 });
    const springY = useSpring(y, { damping: 15, stiffness: 150 });
    const handleMouseMove = (e) => {
        if (!ref.current)
            return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * strength);
        y.set((e.clientY - centerY) * strength);
    };
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };
    return (React.createElement(motion.div, { ref: ref, className: `flex-shrink-0 ${className}`, style: { x: springX, y: springY }, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave }, children));
};
