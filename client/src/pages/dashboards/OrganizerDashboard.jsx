
import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Plus, Calendar, Users, Briefcase, FileText, TrendingUp, CheckCircle } from 'lucide-react';

import PlatformCard from '../../components/ui/PlatformCard';
import MetricCard from '../../components/ui/MetricCard';
import ListCard from '../../components/ui/ListCard';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Grid, Section } from '../../components/ui/Layout';
import { CardContent, CardTitle } from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';

export default function OrganizerDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [hackathons, setHackathons] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedHackathonId, setSelectedHackathonId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeTeams: 0,
        totalSubmissions: 0,
        completionRate: 0,
        totalParticipants: 0,
        activeProjects: 0
    });
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

    useEffect(() => {
        if (user) {
            fetchHackathons();
            fetchStats();
        }
    }, [user]);

    const fetchHackathons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/hackathons/organizer/my', config);
            const myHackathons = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setHackathons(myHackathons);

            // Get recent events (last 5)
            const sorted = [...myHackathons].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            setRecentEvents(sorted.slice(0, 5));

            // Populate status data for pie chart
            const active = myHackathons.filter(h => new Date(h.endDate) > new Date()).length;
            const completed = myHackathons.length - active;
            setStatusData([
                { name: 'Active', value: active },
                { name: 'Completed', value: completed },
            ]);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/hackathons/stats/organizer', config);
            if (res.data) {
                setStats(res.data.stats || {
                    totalEvents: 0,
                    activeTeams: 0,
                    totalSubmissions: 0,
                    completionRate: 0,
                    totalParticipants: 0,
                    activeProjects: 0
                });
                setChartData(res.data.chartData || []);
            }

        } catch (err) {
            console.error('Error fetching stats:', err);
            // Fallback mock data if API fails or doesn't exist yet
            setChartData([
                { name: 'Jan', submissions: 10 },
                { name: 'Feb', submissions: 25 },
                { name: 'Mar', submissions: 40 },
                { name: 'Apr', submissions: 30 },
                { name: 'May', submissions: 60 },
            ]);
        }
    };

    const handleInviteJudge = async (e) => {
        e.preventDefault();
        setInviteStatus('Inviting...');
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await api.post(`/hackathons/${selectedHackathonId}/invite-judge`, { email: inviteEmail }, config);
            setInviteStatus('Judge added successfully!');
            setInviteEmail('');
            setTimeout(() => { setShowInviteModal(false); setInviteStatus(''); }, 1500);
        } catch (err) {
            setInviteStatus(err.response?.data?.message || 'Error adding judge');
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
                    <p className="text-body-md mt-1">Manage your events and track performance.</p>
                </div>
                <Button variant="primary" onClick={() => navigate('/dashboard/create-hackathon')}>
                    <Plus size={18} /> New Hackathon
                </Button>
            </div>

            {/* ROW 1: Metrics (4 Columns) */}
            <Grid cols={4} className="mb-8">
                <MetricCard
                    title="Total Events"
                    value={stats.totalEvents}
                    icon={Calendar}
                    color="primary"
                    trend={1}
                    trendLabel="this month"
                />
                <MetricCard
                    title="Total Participants"
                    value={stats.totalParticipants || 0}
                    icon={Users}
                    color="success"
                    trend={12}
                    trendLabel="growth"
                />
                <MetricCard
                    title="Total Submissions"
                    value={stats.totalSubmissions}
                    icon={FileText}
                    color="warning"
                    trend={8}
                    trendLabel="total"
                />
                <MetricCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    icon={CheckCircle}
                    color="info"
                    trendLabel="Consistent"
                />
            </Grid>

            {/* ROW 2: Charts & Trends (2 Columns) */}
            <Grid cols={3} className="mb-8">
                {/* Registration Trend Chart */}
                <PlatformCard className="lg:col-span-2 h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <CardTitle>Submission Trends</CardTitle>
                            <Button variant="ghost" size="sm" className="text-[var(--color-primary)]">
                                <TrendingUp size={14} /> View Report
                            </Button>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#4f46e5' }}
                                    />
                                    <Area type="monotone" dataKey="submissions" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </PlatformCard>

                {/* Status Breakdown Pie Chart */}
                <PlatformCard className="h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <CardTitle className="mb-6">Event Status</CardTitle>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </PlatformCard>
            </Grid>

            {/* ROW 3: Recent Activity / Events List */}
            <Section>
                <div className="mb-6">
                    <h2 className="text-heading-lg">Recent Events</h2>
                    <p className="text-body-md">Quick access to your managed hackathons</p>
                </div>
                <div className="flex flex-col gap-4">
                    {recentEvents.length > 0 ? (
                        recentEvents.map((event) => (
                            <ListCard
                                key={event._id}
                                title={event.title}
                                subtitle={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`}
                                meta={
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                            <Users size={14} className="mr-1" />
                                            <span>{event.participants?.length || 0} participants</span>
                                        </div>
                                        <StatusChip status={new Date(event.endDate) > new Date() ? 'active' : 'completed'} />
                                    </div>
                                }
                                actions={
                                    <div className="flex gap-2">
                                        {event.createdBy?._id === user?._id || event.createdBy === user?._id ? (
                                            <>
                                                <Button variant="secondary" size="sm" onClick={() => navigate(`/dashboard/organizer/teams/${event._id}`)}>
                                                    Manage Teams
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/organizer/rounds/${event._id}`)}>
                                                    Rounds
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/organizer/judges/${event._id}`)}>
                                                    Judges
                                                </Button>
                                            </>
                                        ) : (
                                            <Badge variant="outline">View Only</Badge>
                                        )}
                                    </div>
                                }
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                            <p className="text-[var(--color-text-muted)] mb-4">No events created yet.</p>
                            <Button variant="primary" onClick={() => navigate('/dashboard/create-hackathon')}>
                                Create First Event
                            </Button>
                        </div>
                    )}
                </div>
            </Section >

            {/* Invite Modal */}
            {
                showInviteModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] shadow-2xl border border-[var(--color-border-default)]">
                            <h3 className="text-heading-md mb-4 text-[var(--color-text-primary)]">Invite Judge</h3>
                            <form onSubmit={handleInviteJudge}>
                                <InputField
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="judge@example.com"
                                    className="mb-4"
                                />
                                {inviteStatus && (
                                    <p className={`text-sm mb-4 ${inviteStatus.includes('success') ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                        {inviteStatus}
                                    </p>
                                )}
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                                    <Button variant="primary" type="submit">Send Invite</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
