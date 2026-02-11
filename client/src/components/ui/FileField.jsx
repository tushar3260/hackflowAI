
import React from 'react';
import { Upload } from 'lucide-react';

const FileField = ({
    label,
    error,
    helperText,
    accept,
    onChange,
    name,
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {label}
                </label>
            )}
            <div className={`relative flex items-center justify-center w-full`}>
                <label
                    className={`
            flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed rounded-[var(--radius-lg)] cursor-pointer 
            transition-colors
            ${error
                            ? 'border-[var(--color-danger)] bg-[var(--color-danger-bg)]/10 hover:bg-[var(--color-danger-bg)]/20'
                            : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-primary)]/50'
                        }
          `}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-3 ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`} />
                        <p className={`mb-2 text-sm ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            {accept ? accept.replace(/,/g, ', ') : 'Any file'}
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={onChange}
                        name={name}
                        {...props}
                    />
                </label>
            </div>
            {helperText && !error && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>
            )}
        </div>
    );
};

export default FileField;
