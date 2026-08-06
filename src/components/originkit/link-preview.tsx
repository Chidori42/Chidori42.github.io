import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React from 'react';
export const LinkPreview = ({ children, url = '', imageSrc = '', className = '', width = 200, height = 140, }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { damping: 12, stiffness: 100 });
    const springY = useSpring(y, { damping: 12, stiffness: 100 });
    const rotateX = useTransform(springY, [-100, 100], [8, -8]);
    const rotateY = useTransform(springX, [-100, 100], [-8, 8]);
    const handleMouseMove = (e) => {
        if (!ref.current)
            return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
        setMousePos({ x: e.clientX, y: e.clientY });
    };
    return (React.createElement(motion.div, { ref: ref, className: `relative inline-flex ${className}`, onMouseEnter: () => setIsHovering(true), onMouseLeave: () => {
            setIsHovering(false);
            x.set(0);
            y.set(0);
        }, onMouseMove: handleMouseMove },
        children,
        isHovering && (React.createElement(motion.div, { className: "fixed pointer-events-none z-50 border border-border bg-card shadow-lg overflow-hidden", style: {
                left: mousePos.x + 16,
                top: mousePos.y + 16,
                width,
                height,
                rotateX,
                rotateY,
                x: springX,
                y: springY,
            }, initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, transition: { duration: 0.2 } }, imageSrc ? (React.createElement("img", { src: imageSrc, alt: "Preview", className: "w-full h-full object-cover" })) : (React.createElement("div", { className: "w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs p-2" }, url || 'Preview'))))));
};
