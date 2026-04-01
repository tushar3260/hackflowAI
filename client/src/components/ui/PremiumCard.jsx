import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const PremiumCard = ({ children, className = '', noPadding = false, ...props }) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse coordinates relative to card center
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smoothed spring physics for the tilt
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    // Transform raw mouse values into rotation degrees (max 5 degrees)
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    // Parallax values for internal elements
    const parallaxX = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);
    const parallaxY = useTransform(mouseYSpring, [-0.5, 0.5], [-10, 10]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        // Calculate mouse position relative to card center (-0.5 to 0.5)
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        // On mobile, we might want to disable or severely dampen this. Let CSS media queries handle block display or scale, but we compute it regardless.
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`relative group rounded-[var(--radius-xl)] bg-[rgba(var(--color-bg-surface-rgb),0.8)] border border-[var(--color-border-default)] backdrop-blur-xl shadow-lg transition-colors duration-500 overflow-hidden ${className}`}
            {...props}
        >
            {/* Animated Gradient Glow Border (Visible on hover) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[var(--radius-xl)]">
                <div className="absolute inset-[-1px] rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-info)] opacity-40 blur-sm" />
                <div className="absolute inset-[1px] rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] backdrop-blur-2xl" />
            </div>

            {/* Glowing inner shadow on hover */}
            <div className="absolute inset-0 z-0 pointer-events-none rounded-[var(--radius-xl)] shadow-[inset_0_0_20px_rgba(var(--color-primary-rgb),0.0)] group-hover:shadow-[inset_0_0_20px_rgba(var(--color-primary-rgb),0.1)] transition-shadow duration-500" />

            {/* Shimmer Effect */}
            <motion.div 
                className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100"
                style={{
                    x: parallaxX,
                    y: parallaxY
                }}
            />

            {/* Content Container */}
            <div className={`relative z-10 h-full ${!noPadding ? 'p-6 md:p-8' : ''}`}>
                {children}
            </div>

        </motion.div>
    );
};

export default PremiumCard;
