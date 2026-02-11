import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Trophy, Users, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { Container, Grid, Section } from '../components/ui/Layout';
import Card, { CardContent } from '../components/ui/Card';

const Landing = () => {
    return (
        <div className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-primary)]/20 via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] pointer-events-none" />

                <Container className="relative z-10 text-center">
                    <h1 className="text-display-xl font-bold tracking-tight mb-6 animate-fade-down">
                        Launch Your Next <span className="text-gradient">Hackathon</span> in Minutes
                    </h1>
                    <p className="text-body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-up">
                        The all-in-one platform for organizers, participants, and judges. Manage teams, submissions, and evaluation with AI-powered insights.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up">
                        <Link to="/register">
                            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                                Get Started
                            </Button>
                        </Link>
                        <Link to="/hackathons">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                Explore Hackathons
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <Section className="bg-[var(--color-bg-surface)] py-20">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-display-md font-bold mb-4">Why Choose Hackflow AI?</h2>
                        <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
                            Streamline every stage of your hackathon with our powerful suite of tools.
                        </p>
                    </div>

                    <Grid cols={3} gap={8}>
                        <FeatureCard
                            icon={Zap}
                            title="Instant Setup"
                            description="Create and launch your event page in under 5 minutes with customizable templates."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Team Management"
                            description="Built-in team formation tools, role management, and real-time collaboration updates."
                        />
                        <FeatureCard
                            icon={Trophy}
                            title="Smart Judging"
                            description="AI-assisted evaluation, automated scoring rubrics, and live leaderboards."
                        />
                    </Grid>
                </Container>
            </Section>

            {/* CTA Section */}
            <Section className="py-20">
                <Container>
                    <div className="bg-[var(--color-primary)] rounded-[var(--radius-xl)] p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-display-md font-bold mb-6">Ready to Innovate?</h2>
                            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                                Join thousands of developers and organizers building the future with Hackflow AI.
                            </p>
                            <Link to="/register">
                                <Button className="bg-black text-[var(--color-primary)] hover:bg-gray-900 font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105">
                                    Start Building Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </Section>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
    <Card className="h-full border border-[var(--color-border-default)] hover:border-[var(--color-primary)]/50 transition-colors group">
        <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Icon size={32} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-heading-sm font-bold mb-3">{title}</h3>
            <p className="text-[var(--color-text-secondary)]">{description}</p>
        </CardContent>
    </Card>
);

export default Landing;
