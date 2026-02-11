
import React from 'react';

const Logo = ({ size = "md", className = "", showText = true, textColor = "text-[var(--color-text-primary)]" }) => {
    const sizeMap = {
        sm: { h: "h-6", text: "text-body-md", gap: "gap-1.5" },
        md: { h: "h-8", text: "text-heading-md", gap: "gap-2" },
        lg: { h: "h-12", text: "text-display-xs", gap: "gap-3" },
        xl: { h: "h-20", text: "text-display-lg", gap: "gap-4" },
    };

    const currentSize = sizeMap[size] || sizeMap.md;

    return (
        <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
            {/* Logo Icon: Technical Terminal + Flow */}
            <div className={`relative flex-shrink-0 aspect-square ${currentSize.h}`}>
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Background Soft Shape */}
                    <rect width="40" height="40" rx="8" fill="url(#logo-gradient)" fillOpacity="0.08" />

                    {/* Terminal Prompt (>) */}
                    <path
                        d="M10 12L18 20L10 28"
                        stroke="url(#logo-gradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Flow/Code Lines */}
                    <path
                        d="M24 14H32"
                        stroke="url(#logo-gradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeOpacity="0.8"
                    />
                    <path
                        d="M24 20H30"
                        stroke="url(#logo-gradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M24 26H32"
                        stroke="url(#logo-gradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeOpacity="0.4"
                    />

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stopColor="var(--color-primary)" />
                            <stop offset="1" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Logo Text */}
            {showText && (
                <span className={`tracking-tight font-extrabold ${currentSize.text} ${textColor}`}>
                    Hackflow<span className="text-[var(--color-primary)]">AI</span>
                </span>
            )}
        </div>
    );
};

export default Logo;
