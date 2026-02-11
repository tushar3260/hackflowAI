
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * PlatformTable Component
 * 
 * @param {Array} headers - Array of objects { key: string, label: string, sortable?: boolean, width?: string }
 * @param {Array} data - Array of data objects
 * @param {Function} renderRow - Function to render each row (receives item, index)
 * @param {string} className - Additional classes
 * @param {object} sortConfig - { key: string, direction: 'asc' | 'desc' }
 * @param {Function} onSort - Function called when a header is clicked
 */
const PlatformTable = ({
    headers = [],
    data = [],
    renderRow,
    className = '',
    sortConfig,
    onSort
}) => {
    return (
        <div className={`bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] shadow-sm overflow-hidden flex flex-col ${className}`}>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--color-bg-muted)]/50 border-b border-[var(--color-border-default)] sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header.key || header.label}
                                    className={`
                                        p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap
                                        ${header.sortable ? 'cursor-pointer hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-primary)] transition-colors' : ''}
                                        ${header.width || ''}
                                    `}
                                    onClick={() => header.sortable && onSort && onSort(header.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {header.label}
                                        {sortConfig && sortConfig.key === header.key && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-default)]">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="p-12 text-center text-[var(--color-text-muted)]">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => renderRow(item, index))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlatformTable;
