import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Container } from '../ui/Layout';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col relative overflow-hidden">
            {/* Ambient Noise Overlay */}
            <div 
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} 
            />
            <Navbar />
            <main className={`flex-grow w-full relative z-10 ${isAuthPage ? 'flex items-center justify-center' : 'py-8'}`}>
                {isAuthPage ? (
                    children
                ) : (
                    <Container>
                        {children}
                    </Container>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
