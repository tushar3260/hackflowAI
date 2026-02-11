
import React from 'react';

/**
 * A flexible Grid component that supports both legacy and explicit responsive behavior.
 * Legacy behavior: cols={4} -> grid-cols-1 md:grid-cols-2 lg:grid-cols-4
 * Explicit behavior: cols={1} mdCols={2} lgCols={4} -> same result, but cleaner props
 */
export const Grid = ({
    children,
    className = '',
    cols = 1,
    smCols,
    mdCols,
    lgCols,
    gap = 6,
    ...props
}) => {
    // Legacy mapping to maintain backward compatibility for existing dashboards
    const legacyColMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        12: 'grid-cols-12',
    };

    // Simple mapping for explicit breakpoints
    const colMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        12: 'grid-cols-12',
    };

    const classes = [
        'grid',
        // Use legacy map if NO explicit responsive overrides are passed, 
        // this keeps all existing layouts intact.
        (!smCols && !mdCols && !lgCols) ? (legacyColMap[cols] || 'grid-cols-1') : (colMap[cols] || 'grid-cols-1'),
        smCols ? `sm:${colMap[smCols] || `grid-cols-${smCols}`}` : '',
        mdCols ? `md:${colMap[mdCols] || `grid-cols-${mdCols}`}` : '',
        lgCols ? `lg:${colMap[lgCols] || `grid-cols-${lgCols}`}` : '',
        gap ? `gap-${gap}` : 'gap-6',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export const Container = ({ children, className = '', ...props }) => (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
        {children}
    </div>
);

export const Section = ({ children, className = '', ...props }) => (
    <section className={`py-12 ${className}`} {...props}>
        {children}
    </section>
);

export default { Grid, Container, Section };
