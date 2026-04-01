import React, { useEffect, useRef } from 'react';
import { Container, Section } from '../ui/Layout';
import { animateFadeUp } from '../../utils/scrollReveal';
import { initFloatingParallax } from '../../utils/parallaxEffects';

// Placeholder Logo Component
const CompanyLogo = ({ name, color }) => (
    <div className="flex items-center justify-center gap-2 group transition-all duration-300">
        {/* SVG Placeholder */}
        <div className={`
            h-12 w-auto flex items-center justify-center px-4 
            grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 
            hover-scale filter
        `}>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-muted)] to-[var(--color-text-secondary)] group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-accent)] transition-all duration-300">
                {name}
            </span>
        </div>
    </div>
);

// Specialized SVG Logos
const GoogleLogo = () => (
    <svg className="h-8 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover-scale" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.52-.24-2.225h-11.28z" />
    </svg>
);

const MicrosoftLogo = () => (
    <svg className="h-8 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover-scale" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
    </svg>
);

// Simple text placeholders for others to match "Industry Veterans" request without external assets
const companies = [
    { name: 'Google', Logo: GoogleLogo },
    { name: 'Microsoft', Logo: MicrosoftLogo },
    { name: 'Amazon', Logo: () => <span className="font-bold text-2xl tracking-tight">amazon</span> },
    { name: 'TCS', Logo: () => <span className="font-bold text-2xl tracking-wider">tcs</span> },
    { name: 'Infosys', Logo: () => <span className="font-bold text-2xl">Infosys</span> },
    { name: 'Samsung', Logo: () => <span className="font-bold text-2xl tracking-tight">SAMSUNG</span> },
    { name: 'IBM', Logo: () => <span className="font-bold text-2xl tracking-widest">IBM</span> },
    { name: 'Oracle', Logo: () => <span className="font-bold text-2xl">ORACLE</span> },
];

const TrustedBy = () => {
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const logosRef = useRef(null);

    useEffect(() => {
        animateFadeUp(headingRef.current);

        const mm = initFloatingParallax({
            container: sectionRef.current,
            elements: logosRef.current ? Array.from(logosRef.current.children) : []
        });

        return () => {
            if (mm) mm.revert();
        };
    }, []);

    return (
        <Section ref={sectionRef} className="py-24 relative overflow-hidden bg-[var(--color-bg-primary)] border-b border-[var(--color-border-default)]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.05),transparent_50%)]" />

            <Container className="relative z-10">
                    <div className="text-center mb-16 opacity-0" ref={headingRef}>
                        <h2 className="text-heading-lg font-bold mb-4 text-[var(--color-text-primary)]">
                            Trusted by Industry <span className="text-gradient">Veterans</span>
                        </h2>
                        <p className="text-body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                            Leading organizations and institutions trust HackFlow AI to power transparent, high-impact hackathons.
                        </p>
                    </div>

                {/* Marquee Container */}
                <div className="relative w-full overflow-hidden mask-gradient-x">
                    {/* Gradient Overlay for Fade Effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent z-10 pointer-events-none" />

                    {/* Scrolling Track */}
                    <div ref={logosRef} className="flex gap-16 items-center animate-scroll whitespace-nowrap">
                        {/* Duplicate lists for seamless loop */}
                        {[...companies, ...companies, ...companies].map((company, index) => (
                            <div key={index} className="flex-shrink-0 flex items-center justify-center h-16 px-8 rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)] hover-scale cursor-default transition-all duration-500 group">
                                {typeof company.Logo === 'function' ? (
                                    <div className="text-white group-hover:text-white transition-colors duration-500 scale-90 group-hover:scale-100">
                                        <company.Logo />
                                    </div>
                                ) : (
                                    <span className="text-xl font-bold text-[#71717a] group-hover:text-white transition-colors duration-500">
                                        {company.name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>

            {/* Custom Styles for Animation */}
            <style jsx>{`
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .mask-gradient-x {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .text-gradient {
                    background: linear-gradient(to right, var(--color-primary), var(--color-accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </Section>
    );
};

export default TrustedBy;
