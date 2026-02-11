
import React from 'react';
import Card, { CardContent } from '../ui/Card';

const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    color = 'primary'
}) => {
    const colorMap = {
        primary: 'text-[var(--color-primary)] bg-[var(--color-primary)]/10',
        success: 'text-[var(--color-success)] bg-[var(--color-success-bg)]',
        warning: 'text-[var(--color-warning)] bg-[var(--color-warning-bg)]',
        danger: 'text-[var(--color-danger)] bg-[var(--color-danger-bg)]',
        info: 'text-[var(--color-info)] bg-[var(--color-info-bg)]',
    };

    const trendColor = trend > 0 ? 'text-[var(--color-success)]' : trend < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]';
    const TrendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '•';

    return (
        <Card className="hover-lift">
            <CardContent className="flex items-start justify-between">
                <div>
                    <p className="text-meta mb-1">{title}</p>
                    <h3 className="text-metric mb-2">{value}</h3>

                    {(trend || trendLabel) && (
                        <div className="flex items-center text-xs">
                            <span className={`font-medium mr-1.5 ${trendColor}`}>
                                {TrendIcon} {Math.abs(trend)}%
                            </span>
                            <span className="text-[var(--color-text-muted)]">{trendLabel}</span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={`p-3 rounded-[var(--radius-lg)] ${colorMap[color]}`}>
                        <Icon size={24} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MetricCard;
