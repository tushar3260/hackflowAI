import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const Tooltip = ({ 
    children, 
    content, 
    position = 'top',
    delay = 0.2
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div 
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || <Info size={16} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors cursor-help" />}
            
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.2, delay }}
                        className={`absolute z-50 w-max max-w-xs px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl pointer-events-none ${positionStyles[position]}`}
                    >
                        {content}
                        
                        {/* Caret */}
                        <div className={`absolute w-2 h-2 bg-gray-900 rotate-45 
                            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                        `} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
