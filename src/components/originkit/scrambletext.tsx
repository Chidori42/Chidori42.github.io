import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
export const ScrambleText = ({ text, className, once = true, duration = 0.8 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once });
    const [displayed, setDisplayed] = useState('');
    const hasScrambled = useRef(false);
    useEffect(() => {
        if (!isInView || hasScrambled.current || !text)
            return;
        hasScrambled.current = true;
        let iteration = 0;
        const maxIterations = Math.max(text.length, 1);
        const interval = setInterval(() => {
            setDisplayed(text
                .split('')
                .map((char, index) => {
                if (index < iteration)
                    return text[index];
                if (char === ' ')
                    return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            })
                .join(''));
            iteration += 1 / 3;
            if (iteration >= maxIterations) {
                setDisplayed(text);
                clearInterval(interval);
            }
        }, duration * 1000 / maxIterations);
        return () => clearInterval(interval);
    }, [isInView, text, duration]);
    return (React.createElement(motion.span, { ref: ref, className: className }, displayed || text));
};
