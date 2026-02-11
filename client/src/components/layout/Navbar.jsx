
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SERVER_URL } from '../../api/config';
import { User, Menu, X, Terminal, Search, Bell, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileOpen(false);
    }, [location]);

    // Role-based Links
    const getLinks = () => {
        if (!user) return [];
        switch (user.role) {
            case 'organizer':
                return [
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Create Hackathon', path: '/dashboard/create-hackathon' },
                ];
            case 'participant':
                return [
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Find Teams', path: '/dashboard/team' },
                ];
            default:
                return [{ label: 'Dashboard', path: '/dashboard' }];
        }
    };

    const links = getLinks();
    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`
                sticky top-0 z-50 w-full transition-all duration-200 bg-[var(--color-bg-surface)]
                ${isScrolled ? 'shadow-sm border-b border-[var(--color-border-default)]' : 'border-b border-transparent'}
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Left: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="hover:opacity-90 transition-opacity">
                            <Logo size="md" />
                        </Link>
                    </div>

                    {/* Center: Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border-default)] rounded-[var(--radius-md)] leading-5 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:bg-[var(--color-bg-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                placeholder="Search hackathons, teams, or projects..."
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">

                        {user ? (
                            <>
                                {/* Role Badge */}
                                <span className={`
                                    hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${user.role === 'organizer'
                                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                                        : 'bg-[var(--color-info-bg)] text-[var(--color-info)]'}
                                `}>
                                    {user.role}
                                </span>

                                {/* Notification Bell */}
                                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-muted)] transition-colors relative">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full border-2 border-[var(--color-bg-surface)]"></span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative ml-2">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 focus:outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20">
                                            {user.avatar ? (
                                                <img src={`${SERVER_URL}${user.avatar}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="hidden md:block text-body-sm font-medium text-[var(--color-text-primary)] max-w-[100px] truncate">
                                            {user.name}
                                        </span>
                                        <ChevronDown size={14} className="text-[var(--color-text-muted)] hidden md:block" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] shadow-lg ring-1 ring-[var(--color-border-default)] py-1 focus:outline-none animate-fade-up origin-top-right">
                                            <div className="px-4 py-2 border-b border-[var(--color-border-default)] md:hidden">
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
                                                <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                                            </div>

                                            {links.map(link => (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}

                                            <Link to="/profile" className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]">
                                                My Profile
                                            </Link>

                                            <button
                                                onClick={logout}
                                                className="block w-full text-left px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Sign up</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 pt-2 pb-4 shadow-lg absolute w-full">
                    {/* Mobile Search */}
                    <div className="mb-4 mt-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border-default)] rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm"
                                placeholder="Search..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        {user && links.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="block px-3 py-2 rounded-[var(--radius-md)] text-body-md font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!user && (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-[var(--radius-md)] text-base font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]">Log in</Link>
                                <Link to="/register" className="block px-3 py-2 rounded-[var(--radius-md)] text-base font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10">Sign up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
