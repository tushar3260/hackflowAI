
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, Activity, Zap, Target, Clock, Calendar, Upload } from 'lucide-react';

import api from '../../api/config';
import AuthContext from '../../context/AuthContext';

import PlatformCard from '../../components/ui/PlatformCard';
import MetricCard from '../../components/ui/MetricCard';
import ListCard from '../../components/ui/ListCard';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusChip from '../../components/ui/StatusChip';
import RankBadge from '../../components/ui/RankBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Grid, Section } from '../../components/ui/Layout';
import { CardContent, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function ParticipantDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [myHackathons, setMyHackathons] = useState([]);
    const [stats, setStats] = useState({
        activeHackathons: 0,
        submissionsCount: 0,
        avgScore: 0,
        currentRank: 0,
        totalWins: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchMyHackathons();
        }
    }, [user]);

    const fetchMyHackathons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/teams/my', config);

            // Extract unique hackathons from teams
            const teams = res.data;
            const hacks = teams.map(team => {
                return {
                    ...team.hackathon,
                    teamId: team._id,
                    teamName: team.name,
                    role: team.members.find(m => m.user === user._id)?.role || 'member'
                };
            }).filter((h, index, self) =>
                index === self.findIndex((t) => (
                    t._id === h._id
                ))
            );

            setMyHackathons(hacks);
        } catch (err) {
            console.error("Failed to fetch my hackathons", err);
        }
    };

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/hackathons/stats/participant', config);

            if (res.data) {
                setStats({
                    activeHackathons: res.data.activeHackathons || 0,
                    submissionsCount: res.data.submissionsCount || 0,
                    avgScore: res.data.avgScore || 0,
                    currentRank: res.data.currentRank || 0,
                    totalWins: res.data.totalWins || 0
                });
                setChartData(res.data.chartData || []);
            }

            setLoading(false);

        } catch (err) {
            console.error(err);
            setLoading(false);
            setChartData([]); // No dummy data
        }
    };

    if (loading) return <div className="p-12"><CardSkeleton /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-display-lg text-[var(--color-text-primary)]">
                        Welcome back, <span className="text-[var(--color-primary)]">{user?.name}</span>
                    </h1>
                    <p className="text-body-md mt-1">Ready to build something amazing today?</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => navigate('/hackathons')}>
                        Browse Events
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/dashboard/submission')}>
                        <Upload size={18} /> New Submission
                    </Button>
                </div>
            </div>

            {/* ROW 1: Metrics (4 Columns) */}
            <Grid cols={4} className="mb-8">
                <MetricCard
                    title="Active Hackathons"
                    value={stats.activeHackathons}
                    icon={Zap}
                    color="warning"
                    trendLabel="+1 this month"
                />
                <MetricCard
                    title="Total Wins"
                    value={stats.totalWins}
                    icon={Trophy}
                    color="warning"
                    trendLabel="Top 10%"
                />
                <MetricCard
                    title="Avg Score"
                    value={`${stats.avgScore}/100`}
                    icon={Target}
                    color="success"
                    trendLabel="+5.2 points"
                />
                <MetricCard
                    title="Next Deadline"
                    value="2 Days"
                    icon={Clock}
                    color="danger"
                    trendLabel="Urgent"
                />
            </Grid>

            {/* ROW 2: Charts & Progress (2 Columns) */}
            <Grid cols={3} className="mb-8">
                {/* Activity Chart */}
                <PlatformCard className="lg:col-span-2 h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <CardTitle>Activity & Performance</CardTitle>
                            <Badge variant="info" className="flex items-center gap-1">
                                <Activity size={12} /> High Activity
                            </Badge>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
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
                                    <Area type="monotone" dataKey="commits" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </PlatformCard>

                {/* Current Progress Widget */}
                <PlatformCard className="h-96 flex flex-col" hoverEffect={false}>
                    <CardContent className="h-full flex flex-col">
                        <CardTitle className="mb-6">Current Progress</CardTitle>
                        <div className="flex-1 flex flex-col justify-center gap-8">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[var(--color-text-secondary)]">Profile Completion</span>
                                    <span className="font-bold text-[var(--color-primary)]">85%</span>
                                </div>
                                <ProgressBar value={85} color="bg-[var(--color-primary)]" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[var(--color-text-secondary)]">Hackathon Readiness</span>
                                    <span className="font-bold text-[var(--color-success)]">92%</span>
                                </div>
                                <ProgressBar value={92} color="bg-[var(--color-success)]" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[var(--color-text-secondary)]">Rank</span>
                                    <span className="font-bold text-[var(--color-warning)]">Gold</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <RankBadge rank="gold" label="Gold Member" size="sm" />
                                    <span className="text-caption">Top 5% of participants</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-auto justify-center" onClick={() => navigate('/profile')}>
                            Complete Profile
                        </Button>
                    </CardContent>
                </PlatformCard>
            </Grid>

            {/* ROW 3: Active Hackathons List */}
            <Section>
                <div className="mb-6">
                    <h2 className="text-heading-lg">Active Hackathons</h2>
                    <p className="text-body-md">Events you are currently participating in</p>
                </div>

                <div className="flex flex-col gap-4">
                    {myHackathons.length > 0 ? (
                        myHackathons.map((hackathon) => (
                            <ListCard
                                key={hackathon._id}
                                title={hackathon.title}
                                subtitle={hackathon.theme || "No theme"}
                                meta={
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                            <Calendar size={14} className="mr-1" />
                                            <span>Ends {new Date(hackathon.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusChip status="active" label="In Progress" />
                                            <span className="text-xs font-mono bg-[var(--color-bg-muted)] px-2 py-0.5 rounded text-[var(--color-text-secondary)]">Team: {hackathon.teamName}</span>
                                        </div>
                                    </div>
                                }
                                actions={
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => navigate(`/hackathon/${hackathon._id}`)}>
                                            Details
                                        </Button>
                                        <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/submission', { state: { initialHackathonId: hackathon._id } })}>
                                            Submit
                                        </Button>
                                    </div>
                                }
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                            <p className="text-[var(--color-text-muted)] mb-4">You haven't joined any hackathons yet.</p>
                            <Button variant="primary" onClick={() => navigate('/hackathons')}>
                                Explore Events
                            </Button>
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}
