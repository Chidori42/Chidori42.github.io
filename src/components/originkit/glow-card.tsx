import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React from 'react';
export const GlowCard = ({ children, className = '', glowColor = 'hsl(var(--primary))', }) => {
    const ref = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 20, stiffness: 100 });
    const springY = useSpring(mouseY, { damping: 20, stiffness: 100 });
    const handleMouseMove = (e) => {
        if (!ref.current)
            return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };
    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };
    return (React.createElement(motion.div, { ref: ref, className: `relative ${className}`, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave },
        React.createElement(motion.div, { className: "absolute inset-0 pointer-events-none", style: {
                background: useTransform([springX, springY], ([x, y]) => `radial-gradient(300px circle at ${x}px ${y}px, ${glowColor}25, transparent 60%)`),
            } }),
        React.createElement("div", { className: "relative z-10" }, children)));
};
