
import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
    return (
        <div
            className={`animate-pulse bg-[var(--color-border-default)] rounded-[var(--radius-md)] ${className}`}
            {...props}
        />
    );
};

export const CardSkeleton = () => (
    <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between pt-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center space-x-4 py-4 border-b border-[var(--color-border-default)]">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
    </div>
);
