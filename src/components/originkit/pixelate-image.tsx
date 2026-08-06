import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';
export const PixelateImage = ({ src, alt, className = '', pixelSize = 1, maxPixelSize = 20, }) => {
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const pixelSizeVal = useTransform(mouseY, [0, 1], [pixelSize, maxPixelSize]);
    const blurFilter = useTransform(pixelSizeVal, (v) => `blur(${v / 2}px)`);
    const bgImage = useTransform(pixelSizeVal, (v) => `linear-gradient(to right, #00000020 ${v}px, transparent ${v}px)`);
    const bgSize = useTransform(pixelSizeVal, (v) => `${v * 2}px ${v * 2}px`);
    const handleMouseMove = (e) => {
        if (!containerRef.current)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };
    return (React.createElement(motion.div, { ref: containerRef, className: `relative overflow-hidden ${className}`, onMouseEnter: () => setIsHovering(true), onMouseLeave: () => {
            setIsHovering(false);
            mouseX.set(0.5);
            mouseY.set(0.5);
        }, onMouseMove: handleMouseMove },
        src && (React.createElement(motion.img, { src: src, alt: alt, className: "w-full h-full object-cover", style: {
                imageRendering: isHovering ? 'pixelated' : 'auto',
                filter: isHovering ? blurFilter : 'blur(0px)',
            } })),
        React.createElement(motion.div, { className: "absolute inset-0 pointer-events-none", animate: { opacity: isHovering ? 1 : 0 }, style: {
                backgroundImage: bgImage,
                backgroundSize: bgSize,
            } })));
};
