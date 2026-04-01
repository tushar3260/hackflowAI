import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Magnetic = ({ children }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;
    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
};

const HeroButton = ({ 
    children, 
    variant = 'primary', 
    className = '', 
    onClick,
    type = "button",
    ...props 
}) => {
    const baseStyles = "relative group inline-flex items-center justify-center font-bold px-8 py-4 h-14 text-base rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] overflow-hidden";
    
    if (variant === 'primary') {
        return (
            <Magnetic>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type={type}
                    onClick={onClick}
                    className={`${baseStyles} text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] ${className}`}
                    {...props}
                >
                    {/* Idle slow pulse glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] blur-md opacity-50 animate-pulse-slow pointer-events-none" style={{ animationDuration: '4s' }} />
                    
                    {/* Background Gradient */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] group-hover:from-[var(--color-accent)] group-hover:to-[var(--color-primary)] transition-all duration-500" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {children}
                    </span>
                </motion.button>
            </Magnetic>
        );
    }

    if (variant === 'secondary') {
        return (
            <Magnetic>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type={type}
                    onClick={onClick}
                    className={`${baseStyles} text-white border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(var(--color-accent-rgb),0.5)] hover:shadow-[0_0_25px_rgba(var(--color-accent-rgb),0.2)] ${className}`}
                    {...props}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {children}
                    </span>
                </motion.button>
            </Magnetic>
        );
    }

    return null;
};

export default HeroButton;
