import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Plus, Calendar, Users, Briefcase, FileText, TrendingUp, CheckCircle, UserPlus, Edit3, Shield, Mail, Layers, Zap } from 'lucide-react';

import PlatformCard from '../../components/ui/PlatformCard';
import MetricCard from '../../components/ui/MetricCard';
import ListCard from '../../components/ui/ListCard';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Grid, Section } from '../../components/ui/Layout';
import { CardContent, CardTitle } from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';

export const getHackathonStatus = (event) => {
    if (!event) return 'active';

    if (event.status === 'completed' || event.status === 'ended') {
        return 'completed';
    }

    // If rounds exist and any round is actively open or in judging
    const hasLiveRound = event.rounds?.some(r => r.status === 'open' || r.status === 'judging');
    if (hasLiveRound) {
        return 'active';
    }

    const now = new Date();
    const start = event.startDate ? new Date(event.startDate) : null;
    const end = event.endDate ? new Date(event.endDate) : null;

    if (end && now > end) {
        return 'completed';
    }
    if (start && now < start) {
        return 'upcoming';
    }
    if (start && end && now >= start && now <= end) {
        return 'active';
    }

    return event.status || 'active';
};

export default function OrganizerDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [hackathons, setHackathons] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'completed'
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedHackathonId, setSelectedHackathonId] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState({ type: '', text: '' });
    const [inviteLoading, setInviteLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeTeams: 0,
        totalSubmissions: 0,
        completionRate: 0,
        totalParticipants: 0
    });
    const [chartData, setChartData] = useState([]);

    const STATUS_COLORS = {
        Active: '#10b981',
        Upcoming: '#4f46e5',
        Completed: '#71717a'
    };

    const fetchHackathons = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/hackathons/organizer/my', config);
            const myHackathons = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setHackathons(myHackathons);

            if (myHackathons.length > 0) {
                setSelectedHackathonId((prev) => prev || myHackathons[0]._id);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching organizer hackathons:', err);
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/hackathons/stats/organizer', config);
            if (res.data) {
                setStats(res.data.stats || {
                    totalEvents: 0,
                    activeTeams: 0,
                    totalSubmissions: 0,
                    completionRate: 0,
                    totalParticipants: 0
                });
                setChartData(res.data.chartData || []);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setChartData([]);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchHackathons();
            fetchStats();
        }
    }, [user, fetchHackathons, fetchStats]);

    // Computed Counts
    const counts = useMemo(() => {
        let active = 0;
        let upcoming = 0;
        let completed = 0;

        hackathons.forEach(h => {
            const status = getHackathonStatus(h);
            if (status === 'active') active++;
            else if (status === 'upcoming') upcoming++;
            else if (status === 'completed') completed++;
        });

        return {
            all: hackathons.length,
            active,
            upcoming,
            completed
        };
    }, [hackathons]);

    // Status breakdown data for the pie chart
    const statusData = useMemo(() => {
        return [
            { name: 'Active', value: counts.active, color: STATUS_COLORS.Active },
            { name: 'Upcoming', value: counts.upcoming, color: STATUS_COLORS.Upcoming },
            { name: 'Completed', value: counts.completed, color: STATUS_COLORS.Completed }
        ].filter(d => d.value > 0);
    }, [counts]);

    // Filtered list based on active tab
    const filteredHackathons = useMemo(() => {
        const sorted = [...hackathons].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
        if (statusFilter === 'all') return sorted;
        return sorted.filter(h => getHackathonStatus(h) === statusFilter);
    }, [hackathons, statusFilter]);

    const handleOpenInviteModal = (hackathonId = null) => {
        if (hackathonId) {
            setSelectedHackathonId(hackathonId);
        } else if (hackathons.length > 0 && !selectedHackathonId) {
            setSelectedHackathonId(hackathons[0]._id);
        }
        setInviteEmail('');
        setInviteStatus({ type: '', text: '' });
        setShowInviteModal(true);
    };

    const handleInviteJudge = async (e) => {
        e.preventDefault();
        if (!selectedHackathonId) {
            setInviteStatus({ type: 'error', text: 'Please select a hackathon first.' });
            return;
        }

        setInviteLoading(true);
        setInviteStatus({ type: 'info', text: 'Sending invitation email...' });

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.post(`/hackathons/${selectedHackathonId}/invite-judge`, { email: inviteEmail.trim() }, config);
            setInviteStatus({ type: 'success', text: res.data?.message || 'Judge invitation sent successfully!' });
            setInviteEmail('');
            fetchHackathons();
            setTimeout(() => {
                setShowInviteModal(false);
                setInviteStatus({ type: '', text: '' });
            }, 2000);
        } catch (err) {
            setInviteStatus({
                type: 'error',
                text: err.response?.data?.message || 'Error sending invitation. Please verify the email.'
            });
        } finally {
            setInviteLoading(false);
        }
    };

    if (loading) return <div className="p-12"><CardSkeleton /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-display-lg text-[var(--color-text-primary)]">
                        Organizer <span className="text-[var(--color-primary)]">Dashboard</span>
                    </h1>
                    <p className="text-body-md mt-1 text-[var(--color-text-secondary)]">Manage your events, tracks, judges, and teams.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => handleOpenInviteModal()}
                        disabled={hackathons.length === 0}
                    >
                        <UserPlus size={18} className="mr-1.5" /> Invite Judge
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/dashboard/create-hackathon')}>
                        <Plus size={18} className="mr-1.5" /> New Hackathon
                    </Button>
                </div>
            </div>

            {/* ROW 1: Metrics (4 Columns) */}
            <Grid cols={4} className="mb-8">
                <MetricCard
                    title="Active Hackathons"
                    value={counts.active}
                    icon={Zap}
                    color="success"
                />
                <MetricCard
                    title="Total Events"
                    value={hackathons.length}
                    icon={Calendar}
                    color="primary"
                />
                <MetricCard
                    title="Total Participants"
                    value={stats.totalParticipants || 0}
                    icon={Users}
                    color="info"
                />
                <MetricCard
                    title="Total Submissions"
                    value={stats.totalSubmissions || 0}
                    icon={FileText}
                    color="warning"
                />
            </Grid>

            {/* ROW 2: Charts & Trends (2 Columns) */}
            <Grid cols={3} className="mb-8">
                {/* Registration Trend Chart */}
                <PlatformCard className="lg:col-span-2 min-h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <CardTitle>Submission Trends</CardTitle>
                                <p className="text-caption text-[var(--color-text-muted)] mt-0.5">Real-time daily submission volume across your hackathons</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[280px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                borderColor: '#27272a',
                                                borderRadius: '8px',
                                                color: '#fafafa',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                            }}
                                            itemStyle={{ color: '#818cf8' }}
                                        />
                                        <Area type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--color-text-muted)]">
                                    <FileText size={40} className="mb-2 opacity-30" />
                                    <p className="text-body-sm font-medium">No submission activity yet</p>
                                    <p className="text-caption mt-1">Submissions from participants will automatically appear here.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </PlatformCard>

                {/* Status Breakdown Pie Chart */}
                <PlatformCard className="min-h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <CardTitle className="mb-1">Event Status</CardTitle>
                        <p className="text-caption text-[var(--color-text-muted)] mb-4">Active, upcoming & completed hackathons</p>
                        <div className="flex-1 min-h-[260px] flex items-center justify-center">
                            {statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                borderColor: '#27272a',
                                                borderRadius: '8px',
                                                color: '#fafafa'
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center p-8 text-[var(--color-text-muted)]">
                                    <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-body-sm font-medium">No events to display</p>
                                    <p className="text-caption mt-1">Create a hackathon to view status breakdown.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </PlatformCard>
            </Grid>

            {/* ROW 3: Events List with Filter Tabs */}
            <Section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-heading-lg text-[var(--color-text-primary)]">Your Hackathons</h2>
                        <p className="text-body-md text-[var(--color-text-secondary)]">Manage teams, rounds, submissions, and judges for your events</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)]">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-white'
                            }`}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('active')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                statusFilter === 'active'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-white'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Active ({counts.active})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('upcoming')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                statusFilter === 'upcoming'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-white'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                            Upcoming ({counts.upcoming})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                statusFilter === 'completed'
                                    ? 'bg-zinc-700 text-white shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-white'
                            }`}
                        >
                            Completed ({counts.completed})
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredHackathons.length > 0 ? (
                        filteredHackathons.map((event) => {
                            const isOwner = event.createdBy?._id === user?._id || event.createdBy === user?._id;
                            const status = getHackathonStatus(event);

                            return (
                                <ListCard
                                    key={event._id}
                                    title={event.title}
                                    subtitle={`${new Date(event.startDate).toLocaleDateString()} — ${new Date(event.endDate).toLocaleDateString()}`}
                                    meta={
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center text-[var(--color-text-muted)] text-xs">
                                                <Users size={13} className="mr-1" />
                                                <span>{event.teams?.length || 0} teams</span>
                                            </div>
                                            <div className="flex items-center text-[var(--color-text-muted)] text-xs">
                                                <Layers size={13} className="mr-1" />
                                                <span>{event.rounds?.length || 0} rounds</span>
                                            </div>
                                            <div className="flex items-center text-[var(--color-text-muted)] text-xs">
                                                <Shield size={13} className="mr-1" />
                                                <span>{event.judges?.length || 0} judges</span>
                                            </div>
                                            <StatusChip
                                                status={status}
                                                label={status === 'active' ? 'Active' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                                            />
                                        </div>
                                    }
                                    actions={
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {isOwner ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/dashboard/edit-hackathon/${event._id}`)}
                                                        title="Edit Hackathon Details"
                                                    >
                                                        <Edit3 size={14} className="mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/dashboard/organizer/teams/${event._id}`)}
                                                    >
                                                        <Users size={14} className="mr-1" /> Teams
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/dashboard/organizer/rounds/${event._id}`)}
                                                    >
                                                        <Layers size={14} className="mr-1" /> Rounds
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/dashboard/organizer/submissions/${event._id}`)}
                                                    >
                                                        <FileText size={14} className="mr-1" /> Submissions
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/dashboard/organizer/judges/${event._id}`)}
                                                    >
                                                        <Shield size={14} className="mr-1" /> Judges
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleOpenInviteModal(event._id)}
                                                    >
                                                        <UserPlus size={14} className="mr-1" /> Invite Judge
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge variant="outline">View Only</Badge>
                                            )}
                                        </div>
                                    }
                                />
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                            <Calendar size={48} className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-40" />
                            <h3 className="text-heading-md text-[var(--color-text-primary)] font-semibold mb-1">
                                {statusFilter === 'all'
                                    ? 'No hackathons created yet'
                                    : `No ${statusFilter} hackathons`}
                            </h3>
                            <p className="text-[var(--color-text-secondary)] text-sm mb-6 max-w-sm mx-auto">
                                {statusFilter === 'all'
                                    ? 'Launch your first hackathon to begin accepting participants, configuring scoring rounds, and assigning judges.'
                                    : `You currently don't have any ${statusFilter} hackathons. Switch to another tab or create a new event.`}
                            </p>
                            {statusFilter === 'all' ? (
                                <Button variant="primary" onClick={() => navigate('/dashboard/create-hackathon')}>
                                    <Plus size={18} className="mr-1.5" /> Create Hackathon
                                </Button>
                            ) : (
                                <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                                    View All Events
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Section>

            {/* Invite Judge Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] shadow-2xl border border-[var(--color-border-default)] animate-fade-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h3 className="text-heading-md font-bold text-[var(--color-text-primary)]">Invite Judge</h3>
                                <p className="text-caption text-[var(--color-text-secondary)]">Send an invitation link via email to review projects</p>
                            </div>
                        </div>

                        <form onSubmit={handleInviteJudge} className="mt-5 space-y-4">
                            {hackathons.length > 1 && (
                                <SelectField
                                    label="Select Hackathon"
                                    value={selectedHackathonId}
                                    onChange={(e) => setSelectedHackathonId(e.target.value)}
                                    required
                                >
                                    {hackathons.map((h) => (
                                        <option key={h._id} value={h._id}>
                                            {h.title}
                                        </option>
                                    ))}
                                </SelectField>
                            )}

                            {hackathons.length === 1 && (
                                <div className="p-3 bg-[var(--color-bg-muted)]/50 rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
                                    <span className="text-caption text-[var(--color-text-muted)] block">Target Hackathon</span>
                                    <span className="text-body-sm font-medium text-[var(--color-text-primary)]">{hackathons[0]?.title}</span>
                                </div>
                            )}

                            <InputField
                                label="Judge Email Address"
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="judge@example.com"
                                autoFocus
                            />

                            {inviteStatus.text && (
                                <div className={`text-sm p-3 rounded-[var(--radius-md)] flex items-center gap-2 ${
                                    inviteStatus.type === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : inviteStatus.type === 'error'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                }`}>
                                    {inviteStatus.type === 'success' ? (
                                        <CheckCircle size={16} className="shrink-0" />
                                    ) : (
                                        <Mail size={16} className="shrink-0" />
                                    )}
                                    <span>{inviteStatus.text}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setInviteStatus({ type: '', text: '' });
                                    }}
                                    disabled={inviteLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    isLoading={inviteLoading}
                                >
                                    Send Invitation
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
