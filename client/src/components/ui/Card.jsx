
import React from 'react';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
    return (
        <div
            className={`bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] shadow-sm ${!noPadding ? 'p-6' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-card-title ${className}`}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-6 pt-4 border-t border-[var(--color-border-default)] ${className}`}>
        {children}
    </div>
);

export default Card;
