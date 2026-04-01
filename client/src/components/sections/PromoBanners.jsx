import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Trophy, Plus, Compass } from 'lucide-react';
import { Container, Section } from '../ui/Layout';
import HeroButton from '../ui/HeroButton';
import { animateSlideLeft, animateSlideRight } from '../../utils/scrollReveal';

// Interactive wrapper for individual banners
const InteractiveBanner = ({ children, className = '', colorVar = '--color-primary', bgGradient = '' }) => {
    const cardRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const requestRef = useRef();

    // Throttle mouse movement for performance
    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        requestRef.current = requestAnimationFrame(() => {
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePos({ x, y });
        });
    }, []);

    useEffect(() => {
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const calculateRotation = () => {
        if (!cardRef.current || !isHovered) return 'rotateX(0deg) rotateY(0deg)';
        const rect = cardRef.current.getBoundingClientRect();
        const x = mousePos.x;
        const y = mousePos.y;
        
        // Limited rotation to ~4 degrees for premium sublety
        const rotateY = ((x / rect.width) - 0.5) * 4;
        const rotateX = ((y / rect.height) - 0.5) * -4;
        
        return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    return (
        <div 
            ref={cardRef}
            className={`relative group w-full transition-all duration-300 ease-out will-change-transform ${className}`}
            style={{
                transform: isHovered ? `translateY(-4px) ${calculateRotation()}` : 'translateY(0) perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Spotlight Glow Effect - soft and subtle */}
            <div 
                className="absolute -inset-[1px] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(${colorVar}-rgb), 0.3) 0%, transparent 60%)`
                }}
            />

            {/* Main Outer Container - Compact SaaS styling */}
            <div className={`relative flex flex-col justify-between h-full min-h-[300px] max-h-[360px] w-full rounded-[2rem] p-8 md:p-10 border border-[var(--color-border-default)] group-hover:border-[var(${colorVar})] group-hover:shadow-[0_8px_30px_-10px_rgba(var(${colorVar}-rgb),0.2)] bg-[var(--color-bg-surface)] backdrop-blur-lg overflow-hidden z-10 transition-all duration-500`}>
                
                {/* Background Gadients */}
                <div className={`absolute inset-0 opacity-100 transition-opacity duration-500 pointer-events-none ${bgGradient}`} />
                
                {/* Inner Content Component */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between items-start">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PromoBanners = () => {
    const card1Ref = useRef(null);
    const card2Ref = useRef(null);

    useEffect(() => {
        // Entrance animations
        animateSlideLeft(card1Ref.current);
        animateSlideRight(card2Ref.current, { delay: 0.2 });
    }, []);

    return (
        <Section className="py-12 bg-[var(--color-bg-primary)] overflow-hidden">
            <Container>
                {/* 2 columns on desktop/tablet, tightly grouped, stacked on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                    {/* Banner 1: Organizer / Create */}
                    <div ref={card1Ref} className="opacity-0 h-full">
                        <InteractiveBanner 
                            colorVar="--color-primary"
                            bgGradient="bg-gradient-to-br from-[rgba(var(--color-primary-rgb),0.05)] via-[rgba(var(--color-bg-surface-rgb),0.9)] to-[var(--color-bg-surface)]"
                            className="h-full"
                        >
                            {/* Decorative Elements - subtle opacity and very slow animations */}
                            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem]">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[rgba(var(--color-primary-rgb),0.15)] rounded-full blur-[50px] animate-pulse" style={{animationDuration: '8s'}} />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[rgba(var(--color-accent-rgb),0.1)] rounded-full blur-[40px] animate-pulse" style={{animationDuration: '10s'}} />
                            </div>

                            {/* Top Section */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(var(--color-primary-rgb),0.08)] border border-[rgba(var(--color-primary-rgb),0.15)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-5 group-hover:bg-[rgba(var(--color-primary-rgb),0.12)] transition-colors">
                                    <Zap size={14} className="group-hover:scale-110 transition-transform duration-300" /> For Organizers
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-3 leading-tight tracking-tight">
                                    Launch Your Hackathon with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">AI Precision</span>
                                </h2>

                                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-sm line-clamp-2">
                                    Create, evaluate, and publish results with transparent AI scoring.
                                </p>
                            </div>

                            {/* Bottom Section */}
                            <div className="mt-8">
                                <Link to="/dashboard/create-hackathon" className="inline-block">
                                    <HeroButton variant="primary" className="!h-12 !px-6 !text-sm">
                                        Create Hackathon <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </HeroButton>
                                </Link>
                            </div>
                        </InteractiveBanner>
                    </div>

                    {/* Banner 2: Participant / Compete */}
                    <div ref={card2Ref} className="opacity-0 h-full">
                        <InteractiveBanner 
                            colorVar="--color-accent"
                            bgGradient="bg-gradient-to-br from-[rgba(var(--color-accent-rgb),0.05)] via-[rgba(var(--color-bg-surface-rgb),0.9)] to-[var(--color-bg-surface)]"
                            className="h-full"
                        >
                            {/* Decorative Elements - subtle and slow */}
                            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem]">
                                <div className="absolute -bottom-10 right-0 w-40 h-40 bg-[rgba(var(--color-accent-rgb),0.15)] rounded-full blur-[50px] animate-pulse" style={{animationDuration: '9s', animationDelay: '1s'}} />
                                <div className="absolute top-0 -left-10 w-32 h-32 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-full blur-[40px] animate-pulse" style={{animationDuration: '11s'}} />
                            </div>

                            {/* Top Section */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(var(--color-accent-rgb),0.08)] border border-[rgba(var(--color-accent-rgb),0.15)] text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider mb-5 group-hover:bg-[rgba(var(--color-accent-rgb),0.12)] transition-colors">
                                    <Compass size={14} className="group-hover:scale-110 transition-transform duration-300" /> For Participants
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold leading-tight text-[var(--color-text-primary)] mb-3 tracking-tight">
                                    Compete. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-info)]">Dominate.</span>
                                </h3>

                                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-sm line-clamp-2">
                                    Join live hackathons, submit projects, and climb the global leaderboard.
                                </p>
                            </div>

                            {/* Bottom Section */}
                            <div className="mt-8">
                                <Link to="/hackathons" className="inline-block">
                                    <HeroButton variant="secondary" className="!h-12 !px-6 !text-sm border-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.05)]">
                                        Explore Hackathons <Compass size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </HeroButton>
                                </Link>
                            </div>
                        </InteractiveBanner>
                    </div>

                </div>
            </Container>
        </Section>
    );
};

export default PromoBanners;
