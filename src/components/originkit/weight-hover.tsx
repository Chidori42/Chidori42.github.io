import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React from 'react';
export const WeightHover = ({ children, className }) => {
    const weight = useMotionValue(400);
    const smoothWeight = useSpring(weight, { damping: 15, stiffness: 150 });
    const scale = useTransform(smoothWeight, [400, 900], [1, 1.05]);
    return (React.createElement(motion.span, { className: className, style: { fontWeight: smoothWeight, scale }, onMouseEnter: () => weight.set(900), onMouseLeave: () => weight.set(400) }, children));
};
