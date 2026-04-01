import React from 'react';
import { motion } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';

const PageLoader = () => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-bg-primary)] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            {/* Background Ambient Glow */}
            <motion.div 
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute w-[20vw] h-[20vw] max-w-[300px] max-h-[300px] bg-violet-400/10 rounded-full blur-[80px]" />
            </motion.div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container */}
                <motion.div
                    className="mb-12 relative flex justify-center items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    <div className="scale-150 transform origin-center">
                        <AnimatedLogo />
                    </div>
                </motion.div>

                {/* Loading Progress Line */}
                <div className="w-64 h-1 bg-[var(--color-border-default)] rounded-full overflow-hidden relative">
                    {/* Actual filling progress */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                            duration: 1.8,
                            ease: "easeInOut",
                        }}
                    />
                </div>
                
                {/* Loading Text */}
                <motion.div
                    className="mt-4 text-[var(--color-text-secondary)] text-sm font-medium tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                        Initializing Interface
                    </motion.span>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PageLoader;
