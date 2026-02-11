
import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)] shadow-sm hover:shadow-md',
        secondary: 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] focus:ring-[var(--color-border-strong)] shadow-sm',
        ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-primary)]',
        outline: 'bg-transparent border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        danger: 'bg-[var(--color-danger)] text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
    };

    const sizes = {
        sm: 'text-sm px-3 py-1.5 rounded-[var(--radius-md)] space-x-1.5',
        md: 'text-sm px-4 py-2 rounded-[var(--radius-md)] space-x-2',
        lg: 'text-base px-6 py-3 rounded-[var(--radius-lg)] space-x-2.5',
        icon: 'p-2 rounded-[var(--radius-md)]',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{children}</span>
        </button>
    );
};

export default Button;
