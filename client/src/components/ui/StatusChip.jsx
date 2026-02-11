
import React from 'react';
import Badge from './Badge';

const StatusChip = ({ status, label, className = '' }) => {
    const normalizedStatus = status?.toLowerCase() || 'inactive';

    const variantMap = {
        active: 'success',
        completed: 'info',
        pending: 'warning',
        inactive: 'default',
        rejected: 'danger',
        draft: 'default',
        published: 'success',
        upcoming: 'primary'
    };

    return (
        <Badge
            variant={variantMap[normalizedStatus] || 'default'}
            className={className}
        >
            {label || status}
        </Badge>
    );
};

export default StatusChip;
