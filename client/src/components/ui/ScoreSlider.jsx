
import React from 'react';

const ScoreSlider = ({ value, max, onChange, className = '' }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Color logic
    let colorClass = 'bg-[var(--color-danger)]';
    let textClass = 'text-[var(--color-danger)]';

    if (percentage >= 80) {
        colorClass = 'bg-[var(--color-success)]';
        textClass = 'text-[var(--color-success)]';
    } else if (percentage >= 50) {
        colorClass = 'bg-[var(--color-warning)]';
        textClass = 'text-[var(--color-warning)]';
    }

    return (
        <div className={`relative w-full ${className}`}>
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Score</span>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${textClass}`}>
                        {value}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">/ {max}</span>
                </div>
            </div>

            <div className="relative h-6 flex items-center group">
                {/* Track */}
                <div className="absolute w-full h-2 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ease-out ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Range Input (Invisible but interactive) */}
                <input
                    type="range"
                    min="0"
                    max={max}
                    step="1"
                    value={value || 0}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />

                {/* Thumb Handle (Visual) */}
                <div
                    className="absolute h-5 w-5 bg-[var(--color-bg-surface)] border-2 border-[var(--color-primary)] rounded-full shadow-md pointer-events-none transition-all duration-150 group-hover:scale-110 z-10"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        </div>
    );
};

export default ScoreSlider;
