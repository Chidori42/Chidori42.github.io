import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
export const Typewriter = ({ texts, className, once = true, speed = 50, deleteSpeed = 30, pauseDuration = 2000, cursorClassName = 'text-primary', }) => {
    const [displayed, setDisplayed] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once });
    useEffect(() => {
        if (!isInView)
            return;
        const currentText = texts[textIndex];
        if (!currentText)
            return;
        let timeout;
        if (!isDeleting && displayed.length < currentText.length) {
            timeout = setTimeout(() => {
                setDisplayed(currentText.slice(0, displayed.length + 1));
            }, speed);
        }
        else if (!isDeleting && displayed.length === currentText.length) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, pauseDuration);
        }
        else if (isDeleting && displayed.length > 0) {
            timeout = setTimeout(() => {
                setDisplayed(displayed.slice(0, -1));
            }, deleteSpeed);
        }
        else if (isDeleting && displayed.length === 0) {
            setIsDeleting(false);
            setTextIndex((textIndex + 1) % texts.length);
        }
        return () => clearTimeout(timeout);
    }, [isInView, displayed, isDeleting, textIndex, texts, speed, deleteSpeed, pauseDuration]);
    return (React.createElement(motion.span, { ref: ref, className: className },
        displayed,
        React.createElement(motion.span, { className: `inline-block w-[2px] h-[1em] ml-1 ${cursorClassName}`, animate: { opacity: [1, 0] }, transition: { duration: 0.8, repeat: Infinity, ease: 'linear' } })));
};
