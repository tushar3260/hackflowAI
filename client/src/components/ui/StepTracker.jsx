import React from 'react';
import { motion } from 'framer-motion';
import { Check, Dot } from 'lucide-react';

const StepTracker = ({ currentStepIndex }) => {
    // Define the core participation steps
    const steps = [
        "Join Team",
        "Complete Profile",
        "Submit Round",
        "Wait for Judging",
        "View Leaderboard"
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                
                {/* Background Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[var(--color-border-default)] -translate-y-1/2 z-0"></div>

                {/* Animated Progress Line */}
                <motion.div 
                    className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] -translate-y-1/2 z-0"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />

                {/* Render Nodes */}
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const isFuture = index > currentStepIndex;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                            {/* The Step Circle Indicator */}
                            <motion.div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500
                                    ${isCompleted ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]' : 
                                      isActive ? 'bg-[var(--color-bg-surface)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] glow-pulse' : 
                                      'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}
                                `}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                            >
                                {isCompleted ? (
                                    <Check size={16} strokeWidth={3} />
                                ) : isActive ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                                ) : (
                                    <Dot size={20} />
                                )}
                            </motion.div>
                            
                            {/* The Step Label */}
                            <span className={`text-xs md:text-sm font-medium absolute -bottom-8 whitespace-nowrap transition-all duration-300
                                ${isCompleted ? 'text-[var(--color-text-primary)]' : 
                                  isActive ? 'text-[var(--color-primary)] font-bold' : 
                                  'text-[var(--color-text-tertiary)]'}
                            `}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepTracker;
