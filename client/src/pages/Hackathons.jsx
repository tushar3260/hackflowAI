
import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import HackathonCard from '../components/ui/HackathonCard';
import FilterSidebar from '../components/ui/FilterSidebar';
import SectionTitle from '../components/ui/SectionTitle';
import InputField from '../components/ui/InputField';
import SelectField from '../components/ui/SelectField';
import Button from '../components/ui/Button';
import { Container, Grid } from '../components/ui/Layout';

const Hackathons = () => {
    // State for Data
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, pages: 1 });

    // State for Filters & Search
    const [filters, setFilters] = useState({
        status: '',
        difficulty: '',
        theme: ''
    });
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest'); // newest, oldest, deadline
    const [page, setPage] = useState(1);

    // Toggle Mobile Sidebar
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHackathons();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters, sort, page]);

    const fetchHackathons = async () => {
        setLoading(true);
        try {
            // Build Query String
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filters.status) params.append('status', filters.status);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.theme) params.append('theme', filters.theme);
            if (sort) params.append('sort', sort);
            params.append('page', page);
            params.append('limit', 9);

            const res = await api.get(`/hackathons?${params.toString()}`);

            // Handle response structure ( { data: [], meta: {} } from updated API )
            if (res.data.data) {
                setHackathons(res.data.data);
                setMeta(res.data.meta);
            } else if (Array.isArray(res.data)) {
                // Fallback
                setHackathons(res.data);
                setMeta({ total: res.data.length, page: 1, limit: 9, pages: 1 });
            }
        } catch (err) {
            console.error("Failed to fetch hackathons", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilters({ status: '', difficulty: '', theme: '' });
        setSearch('');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container className="pt-24 pb-20">
                <SectionTitle
                    title="Explore Hackathons"
                    subtitle="Discover upcoming challenges, join teams, and build the future."
                    center
                />

                {/* Top Toolbar: Search & Sort */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, theme, or keywords..."
                            className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all shadow-sm text-[var(--color-text-primary)]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex gap-3">
                        <div className="relative min-w-[180px]">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-3 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] focus:border-[var(--color-primary)] outline-none cursor-pointer shadow-sm text-[var(--color-text-primary)] font-medium"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="deadline">Approaching Deadline</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" size={16} />
                        </div>

                        {/* Mobile Filter Toggle */}
                        <Button
                            variant="secondary"
                            className="md:hidden px-3"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <SlidersHorizontal size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Sidebar (Desktop & Mobile) */}
                    <div className={`w-full md:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                        <FilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                            clearFilters={handleClearFilters}
                        />
                    </div>

                    {/* Main Grid */}
                    <div className="flex-1 w-full">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-80 bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] p-4 animate-pulse">
                                        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-1/4 mb-4"></div>
                                        <div className="h-6 bg-[var(--color-bg-muted)] rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-1/2 mb-6"></div>
                                        <div className="h-32 bg-[var(--color-bg-muted)] rounded mb-4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : hackathons.length > 0 ? (
                            <>
                                <Grid cols={1} mdCols={2} lgCols={3} className="gap-6 mb-10">
                                    {hackathons.map((hackathon) => (
                                        <HackathonCard key={hackathon._id} hackathon={hackathon} />
                                    ))}
                                </Grid>

                                {/* Pagination */}
                                {meta.pages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-3"
                                        >
                                            <ChevronLeft size={20} />
                                        </Button>
                                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                                            Page {page} of {meta.pages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                                            disabled={page === meta.pages}
                                            className="px-3"
                                        >
                                            <ChevronRight size={20} />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-default)]">
                                <Search size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No hackathons found</h3>
                                <p className="text-[var(--color-text-secondary)] mb-6">Try adjusting your filters or search terms.</p>
                                <Button
                                    variant="ghost"
                                    onClick={handleClearFilters}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </Container>
        </div>
    );
};

export default Hackathons;
