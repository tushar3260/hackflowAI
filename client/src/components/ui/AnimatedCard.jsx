import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedCard - Interactive card with 3D tilt, glow, and scale effects
 * 
 * @param {React.ReactNode} children - Card content
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes
 */
const AnimatedCard = ({ children, onClick, className = '', disableHover = false }) => {
    return (
        <motion.div
            whileHover={!disableHover ? {
                y: -5,
                transition: { duration: 0.2 }
            } : {}}
            whileTap={!disableHover ? { scale: 0.98 } : {}}
            className={`
                relative group cursor-pointer
                bg-white rounded-xl overflow-hidden
                border border-slate-200 shadow-sm hover:shadow-lg
                transition-all duration-300
                ${className}
            `}
            onClick={onClick}
        >
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export default AnimatedCard;
