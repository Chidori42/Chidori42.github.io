import { motion, useInView } from 'framer-motion';
import React from 'react';
export const PixelReveal = ({ children, className, once = true, amount = 0.3 }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once, amount });
    return (React.createElement(motion.div, { ref: ref, className: className, initial: { opacity: 0, scale: 0.95, filter: 'blur(8px)' }, animate: isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.95, filter: 'blur(8px)' }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }, children));
};
