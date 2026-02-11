import React from 'react';
import PlatformCard from './PlatformCard';

const InfoCard = ({
    title,
    description,
    badges = [],
    footer,
    image,
    onClick,
    className = ''
}) => {
    return (
        <PlatformCard onClick={onClick} className={`flex flex-col h-full ${className}`} noPadding>
            {image && (
                <div className="h-48 w-full overflow-hidden rounded-t-xl bg-slate-100 relative">
                    {/* Gradient overlay if no image, or actual image */}
                    {typeof image === 'string' ? (
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        image
                    )}
                </div>
            )}

            <div className="card-padding flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-space-2">
                    <h3 className="text-heading-md text-slate-900 line-clamp-1">{title}</h3>
                </div>

                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-space-2 mb-space-3">
                        {badges.map((badge, index) => (
                            <span
                                key={index}
                                className={`
                                    text-xs px-space-2 py-space-1 rounded-full font-medium border
                                    ${badge.className || 'bg-slate-100 text-slate-600 border-slate-200'}
                                `}
                            >
                                {badge.text || badge}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-body-sm text-slate-500 mb-space-6 line-clamp-3 flex-grow">
                    {description}
                </p>

                {footer && (
                    <div className="pt-space-4 border-t border-slate-100 mt-auto">
                        {footer}
                    </div>
                )}
            </div>
        </PlatformCard>
    );
};

export default InfoCard;
