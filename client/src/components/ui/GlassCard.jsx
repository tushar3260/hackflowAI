import React from 'react';

/**
 * GlassCard - A reusable container with glassmorphism styling
 * 
 * @param {React.ReactNode} children - Content to render
 * @param {string} className - Additional CSS classes
 * @param {Object} props - Additional props
 */
const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`glass-panel rounded-xl p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
