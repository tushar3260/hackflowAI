import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Code, Trophy, Users, Zap, Loader2, ShieldCheck, BarChart3, Globe, Sparkles, Terminal } from 'lucide-react';
import api from '../api/config';
import Button from '../components/ui/Button';
import { Container, Grid, Section } from '../components/ui/Layout';
import Card, { CardContent } from '../components/ui/Card';
import HackathonCard from '../components/ui/HackathonCard';
import TrustedBy from '../components/sections/TrustedBy';
import PromoBanners from '../components/sections/PromoBanners';
import Hero from '../components/sections/Hero';
import PremiumCard from '../components/ui/PremiumCard';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../components/ui/PageLoader';
import { animateFadeUp, animateScaleIn, animateStaggerGrid } from '../utils/scrollReveal';
import { initCardParallax, cleanupCardParallax } from '../utils/parallaxEffects';

const Landing = () => {
    const { user } = useAuth();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appLoading, setAppLoading] = useState(true);

    const hackathonHeaderRef = useRef(null);
    const hackathonGridRef = useRef(null);
    const featuresHeaderRef = useRef(null);
    const featuresGridRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        // Hide loader after minimum time
        const timer = setTimeout(() => {
            setAppLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const res = await api.get('/hackathons?sort=newest&limit=3');
                if (res.data.data) {
                    setHackathons(res.data.data);
                } else if (Array.isArray(res.data)) {
                    setHackathons(res.data.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch landing hackathons", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHackathons();
    }, []);

    useEffect(() => {
        let mmCards;
        if (!appLoading) {
            setTimeout(() => {
                animateFadeUp(hackathonHeaderRef.current);
                if (hackathonGridRef.current) {
                    const cards = Array.from(hackathonGridRef.current.querySelectorAll('.hackathon-card-reveal'));
                    animateStaggerGrid(cards, hackathonGridRef.current);

                    mmCards = initCardParallax({
                        cards: cards,
                        container: hackathonGridRef.current
                    });
                }
                
                animateFadeUp(featuresHeaderRef.current);
                if (featuresGridRef.current) {
                    const features = Array.from(featuresGridRef.current.querySelectorAll('.bento-reveal'));
                    animateStaggerGrid(features, featuresGridRef.current);
                }

                animateScaleIn(ctaRef.current);
            }, 500);
        }

        return () => {
            if (mmCards) {
                if (hackathonGridRef.current) {
                    cleanupCardParallax(Array.from(hackathonGridRef.current.querySelectorAll('.hackathon-card-reveal')));
                }
                mmCards.revert();
            }
        };
    }, [appLoading, hackathons]);

    return (
        <>
            <AnimatePresence>
                {appLoading && <PageLoader key="page-loader" />}
            </AnimatePresence>

            <motion.div 
                className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: appLoading ? 0 : 1, y: appLoading ? 20 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                {/* Hero Section */}
                <Hero />

                {/* Trusted By Section */}
                <TrustedBy />

                {/* Active Hackathons Section */}
                <Section className="relative bg-[var(--color-bg-primary)] py-32 border-b border-[var(--color-border-default)] overflow-hidden">
                    {/* Massive Ambient Glow behind Hackathons */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-[rgba(var(--color-primary-rgb),0.05)] blur-[150px] rounded-full pointer-events-none" />

                    <Container className="relative z-10">
                        <div ref={hackathonHeaderRef} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 opacity-0">
                            <div>
                                <h2 className="text-display-md font-bold mb-4 tracking-tight">Featured Hackathons</h2>
                                <p className="text-[var(--color-text-secondary)] max-w-xl text-lg">
                                    Discover the latest challenges happening right now on the global network.
                                </p>
                            </div>
                            <Link to="/hackathons">
                                <Button variant="outline" className="gap-2 bg-[var(--color-bg-surface)] hover:text-white hover:border-[var(--color-primary)] transition-all">
                                    View All Events <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-96 bg-[var(--color-bg-surface)] animate-pulse rounded-[var(--radius-xl)]" />
                                ))}
                            </div>
                        ) : hackathons.length > 0 ? (
                            <div ref={hackathonGridRef}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {hackathons.map((h) => (
                                        <div key={h._id} className="hackathon-card-reveal opacity-0">
                                            <HackathonCard hackathon={h} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[var(--color-bg-surface)]/50 backdrop-blur-sm rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-default)]">
                                <p className="text-[var(--color-text-secondary)] text-lg">No active hackathons at the moment. Check back soon!</p>
                            </div>
                        )}
                    </Container>
                </Section>

                {/* Promo Banners Section */}
                <PromoBanners />

                {/* Asymmetric Bento Box Features Section */}
                <Section className="relative bg-[var(--color-bg-primary)] py-32 overflow-hidden">
                    {/* Massive Ambient Glow for Features */}
                    <div className="absolute bottom-0 right-0 w-[1000px] h-[1000px] bg-[rgba(var(--color-accent-rgb),0.04)] blur-[150px] rounded-full pointer-events-none translate-x-1/4 translate-y-1/4" />

                    <Container className="relative z-10">
                        <div ref={featuresHeaderRef} className="text-center mb-24 opacity-0 max-w-3xl mx-auto">
                            <h2 className="text-display-lg font-bold mb-6 tracking-tight">Built for Scale.</h2>
                            <p className="text-body-lg text-[var(--color-text-secondary)] text-xl">
                                Replace your tangled web of spreadsheets, forms, and payment processors with one beautifully designed platform.
                            </p>
                        </div>

                        <div ref={featuresGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                            {/* Bento Card 1: Massive Hero Feature */}
                            <div className="bento-reveal opacity-0 md:col-span-2 md:row-span-2 relative group overflow-hidden bg-[var(--color-bg-surface)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-10 flex flex-col justify-end">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                {/* Abstract wireframe mockup in background */}
                                <div className="absolute top-8 right-8 w-3/4 h-3/4 bg-[#18181b] border border-white/10 rounded-xl rounded-br-none shadow-2xl transform rotate-3 group-hover:rotate-0 transition-all duration-700 ease-out overflow-hidden flex flex-col pointer-events-none">
                                    <div className="h-8 border-b border-white/10 flex items-center px-4 gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col gap-4">
                                        <div className="w-1/3 h-4 bg-white/5 rounded" />
                                        <div className="w-full h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] opacity-20 rounded" />
                                    </div>
                                </div>

                                <div className="relative z-20">
                                    <div className="w-14 h-14 bg-[var(--color-primary)]/20 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-primary)] backdrop-blur-md">
                                        <BarChart3 size={28} />
                                    </div>
                                    <h3 className="text-display-md font-bold mb-3 text-white">AI-Assisted Judging.</h3>
                                    <p className="text-lg text-[var(--color-text-secondary)] max-w-sm">
                                        Automate your scoring rubrics and let our AI engine pre-evaluate submissions to save hundreds of hours of manual labor.
                                    </p>
                                </div>
                            </div>

                            {/* Bento Card 2: Square */}
                            <div className="bento-reveal opacity-0 md:col-span-1 md:row-span-1 border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] rounded-3xl p-8 flex flex-col hover:border-[var(--color-primary)] transition-colors duration-500 group relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--color-info)]/10 blur-2xl rounded-full group-hover:bg-[var(--color-info)]/20 transition-all duration-500" />
                                <Globe size={32} className="text-[var(--color-info)] mb-auto" />
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Global Reach</h3>
                                    <p className="text-[var(--color-text-muted)] text-sm">Target hackers worldwide with built-in localized timezone streaming.</p>
                                </div>
                            </div>

                            {/* Bento Card 3: Square */}
                            <div className="bento-reveal opacity-0 md:col-span-1 md:row-span-1 border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] rounded-3xl p-8 flex flex-col hover:border-[var(--color-accent)] transition-colors duration-500 group relative overflow-hidden">
                                <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-[var(--color-accent)]/10 blur-2xl rounded-full group-hover:bg-[var(--color-accent)]/20 transition-all duration-500" />
                                <ShieldCheck size={32} className="text-[var(--color-accent)] mb-auto" />
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Anti-Cheat Engine</h3>
                                    <p className="text-[var(--color-text-muted)] text-sm">Plagiarism detection and repo-scanning natively integrated.</p>
                                </div>
                            </div>

                            {/* Bento Card 4: Wide Span */}
                            <div className="bento-reveal opacity-0 md:col-span-3 md:row-span-1 border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-500 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--color-primary-rgb),0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                                    <Terminal size={40} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-bold mb-3 text-white">Deploy In One Click</h3>
                                    <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl">
                                        Use our robust CLI to set up hackathon subdomains, spawn secure databases, and wire up Stripe payments instantaneously. Focus on the hackers, we handle the infra.
                                    </p>
                                </div>
                                <div className="shrink-0 hidden lg:block">
                                    <Link to="/register">
                                        <button className="h-12 px-6 rounded-full border border-white/10 hover:border-white/30 text-white font-semibold transition-all hover:bg-white/5 active:scale-95">
                                            Get Started
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* Cinematic CTA Finale */}
                <Section className="py-0 overflow-hidden bg-[var(--color-bg-primary)]">
                    <div ref={ctaRef} className="relative w-full min-h-[600px] flex items-center justify-center border-t border-[rgba(255,255,255,0.05)] mt-12 opacity-0">
                        {/* Elite Radial Gradient Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.15)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(var(--color-accent-rgb),0.1)_0%,rgba(0,0,0,0)_40%)] pointer-events-none" />
                        
                        {/* Starry/Particle Background mask */}
                        <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-[0.05] pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' }} />

                        <Container className="relative z-10 text-center flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-white/5 backdrop-blur-lg text-sm text-white font-medium mb-8">
                                <Sparkles size={16} className="text-[var(--color-primary)]" /> Built for the Next Generation
                            </div>
                            
                            <h2 className="text-display-xl md:text-7xl font-bold mb-8 tracking-tighter text-white">
                                Your Next Hackathon <br/> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] animate-gradient-x">Starts Here.</span>
                            </h2>
                            
                            <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
                                Join thousands of developers and organizers who have switched to Hackflow AI to run the most engaging, transparent, and flawless events on the planet.
                            </p>
                            
                            <Link to="/register">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group h-16 px-10 rounded-full bg-white text-black font-bold text-lg overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                    Launch Free Event
                                </motion.button>
                            </Link>
                        </Container>
                    </div>
                </Section>
            </motion.div>
        </>
    );
};

export default Landing;
