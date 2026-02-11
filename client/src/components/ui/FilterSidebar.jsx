
import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from './Button';

const FilterSidebar = ({ filters, setFilters, clearFilters, className = '' }) => {

    // Helper to update a specific filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key] === value ? '' : value // Toggle off if clicked again (optional, or just set)
        }));
    };

    const handleCheckboxChange = (group, value) => {
        setFilters(prev => ({
            ...prev,
            [group]: prev[group] === value ? '' : value
        }));
    };

    return (
        <div className={`bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] p-6 h-fit shadow-sm ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Filter size={18} /> Filters
                </h3>
                {(filters.status || filters.difficulty || filters.theme) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] h-auto py-1 px-2"
                    >
                        <X size={12} className="mr-1" /> Clear
                    </Button>
                )}
            </div>

            {/* Status Section */}
            <div className="mb-8">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Status</h4>
                <div className="space-y-2">
                    {['Upcoming', 'Active', 'Past'].map((status) => (
                        <label key={status} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.status === status.toLowerCase() ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border-default)] group-hover:border-[var(--color-primary)]'
                                }`}>
                                {filters.status === status.toLowerCase() && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filters.status === status.toLowerCase()}
                                onChange={() => handleCheckboxChange('status', status.toLowerCase())}
                            />
                            <span className={`text-sm ${filters.status === status.toLowerCase() ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
                                {status}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Difficulty Section */}
            <div className="mb-8">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Difficulty</h4>
                <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.difficulty === level ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border-default)] group-hover:border-[var(--color-primary)]'
                                }`}>
                                {filters.difficulty === level && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filters.difficulty === level}
                                onChange={() => handleCheckboxChange('difficulty', level)}
                            />
                            <span className={`text-sm ${filters.difficulty === level ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
                                {level}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Theme Section (Common themes) */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Popular Themes</h4>
                <div className="flex flex-wrap gap-2">
                    {['FinTech', 'HealthTech', 'EdTech', 'AI/ML', 'Blockchain', 'Social Good'].map((theme) => (
                        <button
                            key={theme}
                            onClick={() => handleFilterChange('theme', theme)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filters.theme === theme
                                ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)] font-medium'
                                : 'bg-[var(--color-bg-muted)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                }`}
                        >
                            {theme}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default FilterSidebar;
