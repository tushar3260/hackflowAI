import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AnimatedLogo = ({ className = "" }) => {
    const containerRef = useRef(null);
    const pathRef1 = useRef(null);
    const pathRef2 = useRef(null);
    const particleRef1 = useRef(null);
    const particleRef2 = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Path Drawing Animation
            gsap.fromTo([pathRef1.current, pathRef2.current],
                { strokeDasharray: 100, strokeDashoffset: 100, opacity: 0 },
                { strokeDashoffset: 0, opacity: 1, duration: 2, ease: "power2.inOut" }
            );

            // Particle Flow Animation (Following the path)
            // We use motion path logic manually by animating along SVG coordinates or using a loop

            // Continuous Wave Motion (Breathing effect)
            gsap.to(pathRef1.current, {
                attr: { d: "M10 30 Q 20 5 30 30" }, // Morphing to slightly different curve (simulated via scale/y)
                // Since simpler SVG path morphing requires plugins, we'll use scale/rotation for 'flow' feel
                scaleY: 0.9,
                transformOrigin: "center center",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            gsap.to(pathRef2.current, {
                scaleY: 1.1,
                transformOrigin: "center center",
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Fallback lightweight animation without heavy plugins
            const floatParticle = (target, delay) => {
                if (!target) return;
                gsap.to(target, {
                    y: -10,
                    x: 10,
                    opacity: 0,
                    duration: 3,
                    delay: delay,
                    repeat: -1,
                    onRepeat: () => gsap.set(target, { y: 0, x: 0, opacity: 1 })
                });
            };

            floatParticle(particleRef1.current, 0);
            floatParticle(particleRef2.current, 1.5);

            // Glow Pulse
            gsap.to(glowRef.current, {
                opacity: 0.6,
                scale: 1.2,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={`flex items-center gap-3 font-display font-bold text-xl tracking-tight select-none cursor-pointer group ${className}`}>

            {/* Logo Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0" ref={glowRef} />

                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="overflow-visible relative z-10"
                >
                    <defs>
                        <linearGradient id="flow-gradient" x1="0" y1="0" x2="40" y2="40">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>

                    {/* Fluid Waves representing 'Flow' */}
                    <path
                        ref={pathRef1}
                        d="M8 28 C 8 28, 14 10, 20 20 C 26 30, 32 12, 32 12"
                        stroke="url(#flow-gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    <path
                        ref={pathRef2}
                        d="M8 12 C 8 12, 14 30, 20 20 C 26 10, 32 28, 32 28"
                        stroke="#818cf8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-70"
                    />

                    {/* Connecting Dots (Nodes) */}
                    <circle cx="8" cy="12" r="2.5" fill="#fff" ref={particleRef1} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <circle cx="32" cy="28" r="2.5" fill="#fff" ref={particleRef2} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <circle cx="20" cy="20" r="3" fill="#fff" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

                </svg>
            </div>

            {/* Typography */}
            <div className="flex flex-col leading-none">
                <span className="text-lg text-[var(--color-text-primary)] font-extrabold tracking-tight">
                    Hackflow<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">.AI</span>
                </span>
            </div>
        </div>
    );
};

export default AnimatedLogo;
