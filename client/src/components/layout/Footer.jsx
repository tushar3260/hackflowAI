import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Twitter,
    Linkedin,
    Github,
    Instagram,
    ChevronDown,
    Send,
    ShieldCheck,
    Database,
    Lock,
    Apple,
    Play
} from 'lucide-react';
import { Container } from '../ui/Layout';
import Button from '../ui/Button';
import { animateFadeUp } from '../../utils/scrollReveal';

const Footer = () => {
    const mainRef = useRef(null);
    const ctaRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        animateFadeUp(mainRef.current);
        animateFadeUp(ctaRef.current, { delay: 0.2 });
        animateFadeUp(bottomRef.current, { delay: 0.3, triggerStart: "top 95%" });
    }, []);

    return (
        <footer className="bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-t border-[var(--color-border-default)] font-sans">
            {/* Main Footer Content */}
            <div className="py-16 overflow-hidden">
                <Container>
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">

                        {/* Links Grid */}
                        <div ref={mainRef} className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            <FooterColumn
                                title="Platform"
                                links={[
                                    { label: 'Browse Hackathons', href: '/hackathons' },
                                    { label: 'Live Leaderboards', href: '/leaderboard' },
                                    { label: 'AI Evaluation', href: '#' },
                                    { label: 'Create Hackathon', href: '/dashboard/create-hackathon' },
                                    { label: 'For Judges', href: '#' },
                                    { label: 'For Organizers', href: '#' },
                                ]}
                            />
                            <FooterColumn
                                title="Participate"
                                links={[
                                    { label: 'Competitions', href: '#' },
                                    { label: 'Hackathons', href: '/hackathons' },
                                    { label: 'Workshops', href: '#' },
                                    { label: 'Challenges', href: '#' },
                                    { label: 'College Events', href: '#' },
                                ]}
                            />
                            <FooterColumn
                                title="Resources"
                                links={[
                                    { label: 'Blog', href: '#' },
                                    { label: 'Guides', href: '#' },
                                    { label: 'Documentation', href: '#' },
                                    { label: 'FAQs', href: '#' },
                                    { label: 'Support', href: '#' },
                                ]}
                            />
                            <FooterColumn
                                title="Company"
                                links={[
                                    { label: 'About Us', href: '#' },
                                    { label: 'Careers', href: '#' },
                                    { label: 'Contact', href: '#' },
                                    { label: 'Privacy Policy', href: '#' },
                                    { label: 'Terms', href: '#' },
                                ]}
                            />
                            <FooterColumn
                                title="For Business"
                                links={[
                                    { label: 'Host Hackathon', href: '#' },
                                    { label: 'AI Screening', href: '#' },
                                    { label: 'Campus Hiring', href: '#' },
                                    { label: 'Enterprise Solutions', href: '#' },
                                ]}
                            />
                        </div>

                        {/* CTA Section */}
                        <div ref={ctaRef} className="w-full lg:w-80 flex-shrink-0 bg-[var(--color-bg-muted)]/30 p-6 rounded-2xl border border-[var(--color-border-default)] self-start">
                            <h3 className="text-display-sm font-bold text-[var(--color-text-primary)] mb-2 bg-gradient-to-r from-[var(--color-primary)] to-purple-400 bg-clip-text text-transparent">
                                Build. Compete. Win.
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                                Empowering hackathons with AI-driven transparency. Join the future of innovation.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--color-text-primary)] mb-1.5 block">Newsletter</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                                        />
                                        <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-md px-3 flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[var(--color-border-default)]">
                                    <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-3">Download App</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white py-2 rounded-lg text-xs font-medium transition-transform hover:-translate-y-0.5">
                                            <Apple size={16} /> App Store
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white py-2 rounded-lg text-xs font-medium transition-transform hover:-translate-y-0.5">
                                            <Play size={16} fill="currentColor" /> Google Play
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </Container>
            </div>

            {/* Bottom Strip */}
            <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)] py-8 overflow-hidden">
                <Container>
                    <div ref={bottomRef} className="flex flex-col md:flex-row justify-between items-center gap-6">

                        {/* Copyright */}
                        <div className="text-sm text-[var(--color-text-muted)]">
                            &copy; 2026 HackFlow AI. All rights reserved.
                        </div>

                        {/* Security Badges */}
                        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-[var(--color-text-secondary)]">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span>AI Secured</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                                <Database size={14} className="text-blue-500" />
                                <span>GDPR Ready</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                                <Lock size={14} className="text-amber-500" />
                                <span>Secure Upload</span>
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <SocialLink href="#" icon={Linkedin} />
                            <SocialLink href="#" icon={Twitter} />
                            <SocialLink href="#" icon={Github} />
                            <SocialLink href="#" icon={Instagram} />
                        </div>

                    </div>
                </Container>
            </div>
        </footer>
    );
};

// Reusable Components

const FooterColumn = ({ title, links }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Mobile: Accordion behavior
    // Desktop: Always visible
    return (
        <div className="flex flex-col">
            <button
                className="flex items-center justify-between w-full lg:cursor-default lg:pointer-events-none group py-2 lg:py-0"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="font-bold text-[var(--color-text-primary)] text-sm uppercase tracking-wider">{title}</h4>
                <ChevronDown
                    size={16}
                    className={`text-[var(--color-text-muted)] lg:hidden transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <ul className={`
                flex flex-col gap-3 mt-4 overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}
            `}>
                {links.map((link, idx) => (
                    <li key={idx}>
                        <Link
                            to={link.href}
                            className="text-sm hover:text-[var(--color-primary)] transition-colors duration-200 hover:tracking-wide w-fit block"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SocialLink = ({ href, icon: Icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 hover:-translate-y-1 text-[var(--color-text-secondary)]"
    >
        <Icon size={16} />
    </a>
);

export default Footer;
