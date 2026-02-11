
import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const PlatformCard = ({
    children,
    className = '',
    onClick,
    hoverEffect = true,
    noPadding = false,
    ...props
}) => {
    const MotionCard = motion.create(Card);

    // Hover animation props
    const hoverProps = (onClick || hoverEffect) ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
        whileTap: onClick ? { scale: 0.98 } : {}
    } : {};

    return (
        <MotionCard
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...hoverProps}
            onClick={onClick}
            noPadding={noPadding}
            className={`
                ${(onClick || hoverEffect) ? 'cursor-pointer' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </MotionCard>
    );
};

export default PlatformCard;
