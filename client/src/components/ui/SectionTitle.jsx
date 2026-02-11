
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * SectionTitle - Expanding horizontal title with gradient text
 * 
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle below
 * @param {boolean} center - Whether to center align (default: true)
 */
const SectionTitle = ({ title, subtitle, center = true }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div
            ref={ref}
            className={`mb-12 ${center ? 'text-center' : 'text-left'}`}
        >
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-display-lg mb-4 text-[var(--color-text-primary)]"
            >
                {title}
            </motion.h2>

            {subtitle && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto"
                >
                    {subtitle}
                </motion.p>
            )}

            {/* Decorative underline */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`h-1 w-24 bg-[var(--color-primary)] mt-6 rounded-full ${center ? 'mx-auto' : ''}`}
            />
        </div>
    );
};

export default SectionTitle;
