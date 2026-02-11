
import React from 'react';

const ProgressBar = ({
    value,
    max = 100,
    color = 'bg-[var(--color-primary)]',
    height = 'h-2',
    showLabel = false,
    labelColor = 'text-[var(--color-text-secondary)]',
    className = ''
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className={`text-xs font-medium ${labelColor}`}>Progress</span>
                    <span className={`text-xs font-medium ${labelColor}`}>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`w-full bg-[var(--color-bg-muted)] rounded-[var(--radius-pill)] overflow-hidden ${height}`}>
                <div
                    className={`${color} h-full rounded-[var(--radius-pill)] transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
