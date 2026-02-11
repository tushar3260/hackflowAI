
import React from 'react';

const SelectField = React.forwardRef(({
    label,
    error,
    helperText,
    options = [],
    className = '',
    children,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2 rounded-[var(--radius-md)] border bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] appearance-none
            focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
            disabled:bg-[var(--color-bg-muted)] disabled:cursor-not-allowed
            transition-all outline-none
            ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20' : 'border-[var(--color-border-default)]'}
            ${className}
          `}
                    {...props}
                >
                    {children || options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {helperText && !error && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>
            )}
        </div>
    );
});

export default SelectField;
