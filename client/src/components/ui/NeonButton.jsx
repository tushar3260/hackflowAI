import React from 'react';
import { motion } from 'framer-motion';

/**
 * NeonButton - Interactive button with neon glow effects
 * 
 * @param {string} variant - 'blue' | 'purple' | 'pink' (default: 'blue')
 * @param {React.ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes
 */
const NeonButton = ({ variant = 'blue', children, onClick, className = '', ...props }) => {

    const getButtonClass = () => {
        if (variant === 'secondary' || variant === 'outline') return 'btn-secondary';
        if (variant === 'ghost') return 'btn-ghost';
        return 'btn-primary';
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                ${getButtonClass()}
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default NeonButton;
