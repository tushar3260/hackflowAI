
import React from 'react';
import PlatformCard from './PlatformCard';

const ListCard = ({
    title,
    subtitle,
    meta,
    actions,
    icon: Icon,
    iconColor = 'text-[var(--color-primary)]',
    iconBg = 'bg-[var(--color-primary)]/10',
    onClick
}) => {
    return (
        <PlatformCard onClick={onClick} className="flex flex-col md:flex-row items-center justify-between gap-4 group" hoverEffect={true}>
            <div className="flex items-center gap-4 w-full md:w-auto">
                {Icon && (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] ${iconBg} flex items-center justify-center`}>
                        <Icon className={iconColor} size={20} />
                    </div>
                )}
                <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                        {title}
                    </h4>
                    {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                {meta && (
                    <div className="text-right mr-2 text-sm text-[var(--color-text-secondary)]">
                        {meta}
                    </div>
                )}
                {actions && (
                    <div className="flex gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </PlatformCard>
    );
};

export default ListCard;
