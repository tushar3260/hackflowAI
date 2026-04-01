import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Terminal as TerminalIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Container } from '../ui/Layout';
import HeroButton from '../ui/HeroButton';

const TerminalLine = ({ delay, children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay }}
        className={`flex items-start gap-3 py-1 ${className}`}
    >
        {children}
    </motion.div>
);

const Hero = () => {
    const { user } = useAuth();

    return (
        <section className="relative min-h-[95vh] flex items-center pb-12 overflow-hidden bg-[var(--color-bg-primary)] pt-12 lg:pt-0">
            {/* Soft Ambient Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full opacity-50">
                <div className="absolute -top-[20%] right-[10%] w-[500px] h-[500px] bg-[rgba(var(--color-primary-rgb),0.1)] rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{animationDuration: '10s'}} />
                <div className="absolute -bottom-[20%] left-[5%] w-[600px] h-[600px] bg-[rgba(var(--color-accent-rgb),0.08)] rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{animationDuration: '12s', animationDelay: '1s'}} />
                <div className="absolute inset-0 bg-[url('/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
            </div>

            <Container className="relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

                    {/* Text Content (Left) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(var(--color-primary-rgb),0.08)] border border-[rgba(var(--color-primary-rgb),0.15)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm self-center lg:self-start">
                            <Sparkles size={14} className="text-[var(--color-accent)] animate-pulse" /> The New Standard
                        </div>

                        <h1 className="text-display-xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
                            Run Hackathons <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-info)] animate-gradient-x inline-block mt-2 pb-2">
                                Without Chaos.
                            </span>
                        </h1>

                        <p className="text-body-lg text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed text-lg">
                            HackFlow AI automates submissions, judging, scoring, and leaderboards for modern hackathons. Say goodbye to spreadsheets.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 w-full justify-center lg:justify-start">
                            <Link to={user ? "/dashboard" : "/dashboard/create-hackathon"} className="w-full sm:w-auto">
                                <HeroButton variant="primary" className="w-full !px-10 h-[60px]">
                                    {user ? "Go to Dashboard" : "Create Hackathon"}
                                </HeroButton>
                            </Link>
                            <Link to="/hackathons" className="w-full sm:w-auto">
                                <HeroButton variant="secondary" className="w-full !px-8 h-[60px] border-[rgba(var(--color-border-strong-rgb),0.5)]">
                                    <Play size={18} fill="currentColor" className="transition-transform duration-300 group-hover:scale-110 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" />
                                    Explore Hackathons
                                </HeroButton>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Terminal Window Mockup (Right) */}
                    <div className="relative w-full aspect-square lg:h-[500px] flex items-center justify-center lg:justify-end perspective-[1000px] mt-8 lg:mt-0 px-4 sm:px-0">
                        {/* Huge glow behind terminal */}
                        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[80%] h-[80%] bg-[rgba(var(--color-primary-rgb),0.15)] blur-[100px] rounded-full pointer-events-none" />

                        {/* Terminal Window */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                            className="relative z-10 w-full max-w-[500px] bg-[#0c0c0e] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_20px_rgba(79,70,229,0.15)] overflow-hidden font-mono text-sm transform-style-3d transition-all duration-500 ease-out"
                        >
                            {/* Window Header */}
                            <div className="h-10 bg-[#18181b] border-b border-[rgba(255,255,255,0.05)] flex items-center px-4 justify-between">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-[rgba(255,255,255,0.1)]" />
                                    <div className="w-3 h-3 rounded-full bg-[#f59e0b] border border-[rgba(255,255,255,0.1)]" />
                                    <div className="w-3 h-3 rounded-full bg-[#10b981] border border-[rgba(255,255,255,0.1)]" />
                                </div>
                                <div className="flex items-center gap-2 text-[#71717a] text-xs font-semibold">
                                    <TerminalIcon size={12} /> root@hackflow:~
                                </div>
                                <div className="w-12" /> {/* Spacer for centering */}
                            </div>

                            {/* Window Body (Editor area) */}
                            <div className="p-6 text-gray-300 min-h-[360px] flex flex-col gap-2 relative">
                                {/* Watermark */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
                                    <TerminalIcon size={180} />
                                </div>

                                <TerminalLine delay={0.5}>
                                    <span className="text-[var(--color-info)]">➜</span>
                                    <span className="text-[var(--color-primary)] font-bold">~</span>
                                    <span className="text-white">hackflow init "DevRally 2026"</span>
                                </TerminalLine>

                                <TerminalLine delay={1.2} className="text-[#a1a1aa] ml-6">
                                    Initializing global hackathon environment...
                                </TerminalLine>

                                <TerminalLine delay={1.8} className="text-[var(--color-success)] ml-6 font-semibold">
                                    [OK] Environment configured
                                </TerminalLine>

                                <TerminalLine delay={2.5}>
                                    <span className="text-[var(--color-info)]">➜</span>
                                    <span className="text-[var(--color-primary)] font-bold">~</span>
                                    <span className="text-white">hackflow deploy --smart-contracts</span>
                                </TerminalLine>

                                <TerminalLine delay={3.2} className="text-[#a1a1aa] ml-6">
                                    Compiling Solidity 0.8.20... Done in 0.42s
                                </TerminalLine>

                                <TerminalLine delay={4.0} className="text-[#a1a1aa] ml-6 flex flex-col gap-1">
                                    <span>Deploying Prize Pool Escrow...</span>
                                    <span className="text-[#fbbf24] animate-pulse">Waiting for network confirmation...</span>
                                </TerminalLine>

                                <TerminalLine delay={5.5} className="ml-6">
                                    <div className="px-3 py-2 bg-[rgba(var(--color-success-rgb),0.1)] border border-[rgba(var(--color-success-rgb),0.2)] rounded-md flex flex-col gap-1 mt-1 w-full relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[rgba(var(--color-success-rgb),0.2)] to-transparent blur-xl pointer-events-none" />
                                        <div className="text-[var(--color-success)] font-bold flex items-center gap-2">
                                            <CheckCircle2 size={14} className="fill-[rgba(var(--color-success-rgb),0.2)]" /> 
                                            DEPLOYMENT SUCCESSFUL
                                        </div>
                                        <div className="text-xs text-[#a1a1aa]">Contract: 0x8a9C...3B92</div>
                                        <div className="text-xs text-[#a1a1aa]">Network: Polygon Mainnet</div>
                                    </div>
                                </TerminalLine>

                                <TerminalLine delay={6.2}>
                                    <span className="text-[var(--color-info)]">➜</span>
                                    <span className="text-[var(--color-primary)] font-bold">~</span>
                                    <span className="text-white border-b-2 border-white animate-pulse">_</span>
                                </TerminalLine>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </Container>
        </section>
    );
};

export default Hero;
