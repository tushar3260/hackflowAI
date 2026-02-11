
import React from 'react';

const TextareaField = ({
    label,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                className={`
          w-full px-4 py-3 rounded-[var(--radius-md)] border bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
          focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
          disabled:bg-[var(--color-bg-muted)] disabled:cursor-not-allowed
          transition-all outline-none resize-none
          placeholder-[var(--color-text-muted)]
          ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20' : 'border-[var(--color-border-default)]'}
          ${className}
        `}
                {...props}
            />
            {helperText && !error && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>
            )}
        </div>
    );
};

export default TextareaField;
