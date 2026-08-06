import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import React from 'react';
export const EmojiBurst = ({ children, emojis = ['🚀', '✅', '🎉', '💫'], count = 8, duration = 1.2, className = '', trigger = false, }) => {
    const [burst, setBurst] = useState(false);
    const controls = useAnimation();
    const timeoutRef = useRef();
    useEffect(() => {
        if (trigger) {
            setBurst(true);
            controls.start({
                scale: [1, 1.1],
                transition: { duration: 0.2 },
            });
            timeoutRef.current = setTimeout(() => {
                setBurst(false);
                controls.start({ scale: 1 });
            }, duration * 1000);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [trigger, duration, controls]);
    return (React.createElement("span", { className: `relative inline-flex ${className}` },
        React.createElement(motion.span, { animate: controls, className: "inline-flex" }, children),
        burst && (React.createElement("span", { className: "absolute inset-0 pointer-events-none" }, Array.from({ length: count }).map((_, i) => {
            const angle = (360 / count) * i;
            const emoji = emojis[i % emojis.length];
            return (React.createElement(motion.span, { key: i, className: "absolute left-1/2 top-1/2", initial: { x: 0, y: 0, opacity: 1, scale: 0.5 }, animate: {
                    x: Math.cos((angle * Math.PI) / 180) * 60,
                    y: Math.sin((angle * Math.PI) / 180) * 60,
                    opacity: 0,
                    scale: [0.5, 1.2, 0.8],
                }, transition: { duration: duration, ease: 'easeOut' } }, emoji));
        })))));
};
export const useEmojiBurst = (duration = 1200) => {
    const [burst, setBurst] = useState(false);
    const timeoutRef = useRef();
    const trigger = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setBurst(true);
        timeoutRef.current = setTimeout(() => setBurst(false), duration);
    };
    return { burst, trigger };
};
