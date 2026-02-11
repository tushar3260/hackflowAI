
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import { Container, Grid } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Layers, CheckCircle, Lock, Eye, Edit3, AlertCircle, Clock } from 'lucide-react';

export default function OrganizerRounds() {
    const { user } = useContext(AuthContext);
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null); // roundIndex of updating

    const isOwner = hackathon?.createdBy?._id === (user?._id || user?.id) ||
        hackathon?.createdBy === (user?._id || user?.id);

    useEffect(() => {
        fetchHackathon();
    }, [hackathonId]);

    const fetchHackathon = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/hackathons/${hackathonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHackathon(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleStatusChange = async (roundIndex, newStatus) => {
        setUpdating(roundIndex);
        try {
            const token = localStorage.getItem('token');
            await api.put(
                `/hackathons/${hackathonId}/round/${roundIndex}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchHackathon(); // Refresh
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    // Helper to get next logical status
    const getNextStatus = (current) => {
        const flow = ['draft', 'open', 'submission_closed', 'judging', 'published'];
        const idx = flow.indexOf(current);
        if (idx === -1 || idx === flow.length - 1) return null;
        return flow[idx + 1];
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'open': return 'success';
            case 'submission_closed': return 'warning';
            case 'judging': return 'info';
            case 'published': return 'primary';
            default: return 'secondary';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-text-muted)] animate-pulse">Loading rounds...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container>
                <header className="mb-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-2 pl-0 text-[var(--color-text-secondary)]">
                            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                        </Button>
                        <h1 className="text-display-md text-[var(--color-text-primary)] flex items-center gap-2">
                            <Layers className="text-[var(--color-primary)]" /> Round Management
                        </h1>
                        <p className="text-body-md text-[var(--color-text-secondary)]">
                            Control lifecycle for <span className="font-semibold text-[var(--color-primary)]">{hackathon?.title}</span>
                        </p>
                    </div>
                </header>

                <div className="space-y-6 max-w-4xl">
                    {hackathon?.rounds.map((round) => {
                        const nextStatus = getNextStatus(round.status);

                        return (
                            <Card key={round.order} className={`border-l-4 ${round.status === 'open' ? 'border-l-[var(--color-success)]' :
                                round.status === 'judging' ? 'border-l-[var(--color-info)]' :
                                    'border-l-[var(--color-border)]'
                                }`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-heading-sm">{round.name}</h3>
                                                <Badge variant={getStatusColor(round.status)} className="capitalize">
                                                    {round.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                                {round.description || 'No description'}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                                                <span className="flex items-center gap-1"><AlertCircle size={12} /> Max Score: {round.maxScore}</span>
                                                <span className="flex items-center gap-1"><AlertCircle size={12} /> Weightage: {round.weightagePercent}%</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mt-2">
                                                {round.startTime && round.endTime ? (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(round.startTime).toLocaleString()} - {new Date(round.endTime).toLocaleString()}
                                                        {round.autoTimeControlEnabled && <Badge variant="secondary" className="ml-2 text-[10px] py-0">Auto-Schedule</Badge>}
                                                    </span>
                                                ) : (
                                                    <span className="italic flex items-center gap-1"><Clock size={12} /> No time window set</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Current State</span>
                                                <div className="text-sm font-medium capitalize text-[var(--color-text-primary)]">
                                                    {round.status.replace('_', ' ')}
                                                </div>
                                            </div>

                                            {/* Status Controls */}
                                            {isOwner && nextStatus && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    isLoading={updating === round.order}
                                                    onClick={() => handleStatusChange(round.order, nextStatus)}
                                                >
                                                    Move to {nextStatus.replace('_', ' ')}
                                                </Button>
                                            )}

                                            {/* Reset/Override Options */}
                                            {isOwner && round.status !== 'draft' && (
                                                <div className="flex gap-2">
                                                    {round.status !== 'open' && (
                                                        <button
                                                            onClick={() => handleStatusChange(round.order, 'open')}
                                                            className="text-xs text-[var(--color-primary)] hover:underline"
                                                            disabled={updating === round.order}
                                                        >
                                                            Re-open
                                                        </button>
                                                    )}
                                                    {round.status !== 'draft' && (
                                                        <button
                                                            onClick={() => handleStatusChange(round.order, 'draft')}
                                                            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:underline"
                                                            disabled={updating === round.order}
                                                        >
                                                            Reset to Draft
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </Container>
        </div>
    );
}
