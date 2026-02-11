
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const RankBadge = ({ rank = 'bronze', label, size = 'md', className = '' }) => {
    const ranks = {
        gold: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Trophy
        },
        silver: {
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-200',
            icon: Medal
        },
        bronze: {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-200',
            icon: Award
        }
    };

    const config = ranks[rank.toLowerCase()] || ranks.bronze;
    const Icon = config.icon;

    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border ${config.bg} ${config.text} ${config.border} ${sizeClasses} font-medium ${className}`}>
            <Icon size={size === 'sm' ? 12 : 14} />
            {label || rank.charAt(0).toUpperCase() + rank.slice(1)}
        </span>
    );
};

export default RankBadge;
