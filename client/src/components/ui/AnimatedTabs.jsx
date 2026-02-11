import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedTabs = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`flex space-x-1 p-1 bg-slate-100/50 rounded-xl ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        relative px-4 py-2 text-sm font-medium rounded-lg transition-colors z-10
                        ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}
                    `}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10 border border-slate-200/50"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AnimatedTabs;
