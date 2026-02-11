
import React from 'react';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const variants = {
        default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]',
        primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
        success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
        danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
        info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
        outline: 'bg-transparent border border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
    };

    const sizes = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-[var(--radius-pill)] ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
