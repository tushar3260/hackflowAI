import React from 'react';
import Navbar from './Navbar';
import { Container } from '../ui/Layout';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow w-full py-8">
                <Container>
                    {children}
                </Container>
            </main>
        </div>
    );
};

export default Layout;
