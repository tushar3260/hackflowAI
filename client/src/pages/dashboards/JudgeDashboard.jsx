
import React, { useContext, useState, useEffect, useRef } from 'react';
import api from '../../api/config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle, Clock, List, Star, TrendingUp, AlertTriangle } from 'lucide-react';

import PlatformCard from '../../components/ui/PlatformCard';
import MetricCard from '../../components/ui/MetricCard';
import StatusChip from '../../components/ui/StatusChip';
import Button from '../../components/ui/Button';
import ListCard from '../../components/ui/ListCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Grid, Section } from '../../components/ui/Layout';
import { CardContent, CardTitle } from '../../components/ui/Card';

export default function JudgeDashboard() {
    const { user } = useContext(AuthContext);
    const [assignedHackathons, setAssignedHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Stats (Mocked for now until deep calculation implemented)
    const [stats, setStats] = useState({
        assigned: 0,
        completed: 0,
        pending: 0
    });

    useEffect(() => {
        fetchAssignedHackathons();
    }, []);

    const fetchAssignedHackathons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/hackathons/judge/my', config);
            setAssignedHackathons(res.data);

            // Fetch real stats
            const statsRes = await api.get('/hackathons/stats/judge', config);
            const newStats = statsRes.data;
            setStats(newStats);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pieData = [
        { name: 'Completed', value: stats.completed },
        { name: 'Pending', value: stats.pending },
    ];
    const COLORS = ['#10b981', '#cbd5e1'];

    if (loading) return <div className="p-12"><CardSkeleton /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-display-lg text-[var(--color-text-primary)]">
                        Judge <span className="text-[var(--color-primary)]">Console</span>
                    </h1>
                    <p className="text-body-md mt-1">Review submissions and provide expert feedback.</p>
                </div>
            </div>

            {/* ROW 1: Metrics (4 Columns) */}
            <Grid cols={4} className="mb-8">
                <MetricCard
                    title="Assigned Reviews"
                    value={stats.assigned}
                    icon={List}
                    color="primary"
                    trendLabel="+2 new assignments"
                />
                <MetricCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="success"
                    trendLabel={`${Math.round((stats.completed / (stats.assigned || 1)) * 100)}% done`}
                />
                <MetricCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    color="warning"
                    trend={-1}
                    trendLabel="Action required"
                />
                <MetricCard
                    title="Avg Score Given"
                    value="8.5"
                    icon={Star}
                    color="info"
                    trendLabel="Consistent"
                />
            </Grid>

            {/* ROW 2: Charts (Completion & Distribution) */}
            <Grid cols={3} className="mb-8">
                {/* Completion Status */}
                <PlatformCard className="h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <CardTitle className="mb-6">Completion Status</CardTitle>
                        <div className="flex-1 min-h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center mt-[-20px]">
                                    <span className="text-metric text-[var(--color-text-primary)]">{Math.round((stats.completed / (stats.assigned || 1)) * 100)}%</span>
                                    <p className="text-meta">Complete</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </PlatformCard>

                {/* Score Distribution (Mocked for now) */}
                <PlatformCard className="lg:col-span-2 h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <CardTitle>Score Distribution</CardTitle>
                            <Button variant="ghost" size="sm" className="text-[var(--color-primary)]">
                                <TrendingUp size={14} className="mr-1" /> detailed stats
                            </Button>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { range: '0-20', count: 2 },
                                    { range: '21-40', count: 5 },
                                    { range: '41-60', count: 12 },
                                    { range: '61-80', count: 25 },
                                    { range: '81-100', count: 8 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </PlatformCard>
            </Grid>

            {/* ROW 3: Pending Reviews List */}
            <Section>
                <div className="mb-6">
                    <h2 className="text-heading-lg">Pending Reviews</h2>
                    <p className="text-body-md">Submissions waiting for your evaluation</p>
                </div>
                <div className="flex flex-col gap-4">
                    {assignedHackathons.map(h => (
                        <ListCard
                            key={h._id}
                            title={h.title}
                            subtitle={`${new Date(h.startDate).toLocaleDateString()} - ${new Date(h.endDate).toLocaleDateString()}`}
                            meta={
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center text-[var(--color-warning)] text-sm font-medium">
                                        <AlertTriangle size={14} className="mr-1" />
                                        <span>5 Pending</span>
                                    </div>
                                    <StatusChip status="pending" />
                                </div>
                            }
                            actions={
                                <Button variant="primary" size="sm" onClick={() => navigate(`/dashboard/organizer/submissions/${h._id}`)}>
                                    Start Review
                                </Button>
                            }
                        />
                    ))}
                    {assignedHackathons.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                            <p className="text-[var(--color-text-muted)]">No pending reviews. Great job!</p>
                        </div>
                    )}
                </div>
            </Section>
        </div >
    );
}
