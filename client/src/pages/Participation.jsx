
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/config';
import { Container, Grid, Section } from '../components/ui/Layout';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
    Trophy, Calendar, CheckCircle, Clock, AlertCircle,
    FileText, Upload, Lock, ChevronRight, Star
} from 'lucide-react';

export default function Participation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const response = await api.get(`/participation/${id}/me`, config);
                setData(response.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 403) {
                    const code = err.response.data.code;
                    if (code === 'NO_TEAM') navigate(`/hackathon/${id}/team-step`);
                    else if (code === 'NO_PROFILE') navigate(`/hackathon/${id}/participant-form`);
                    else setError(err.response.data.message);
                } else {
                    setError('Failed to load dashboard data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-12">
                <Container>
                    <div className="animate-pulse space-y-6">
                        <div className="h-48 bg-[var(--color-bg-surface)] rounded-xl"></div>
                        <div className="h-24 bg-[var(--color-bg-surface)] rounded-xl"></div>
                        <div className="h-24 bg-[var(--color-bg-surface)] rounded-xl"></div>
                    </div>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-12">
                <Container>
                    <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] p-4 rounded-lg">
                        {error}
                    </div>
                </Container>
            </div>
        );
    }

    const { hackathon, team, rounds } = data;

    // Calculate Progress
    const completedRounds = rounds.filter(r => r.submission).length;
    const totalRounds = rounds.length;
    const progressPercent = Math.round((completedRounds / totalRounds) * 100);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
            {/* Header / Stats */}
            <div className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] pt-8 pb-12 mb-8">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wider">{hackathon.title}</span>
                                <Badge variant="outline" size="sm" className="capitalize">{hackathon.status}</Badge>
                            </div>
                            <h1 className="text-display-md text-[var(--color-text-primary)] mb-2">
                                Team {team.name}
                            </h1>
                            <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                                <span className="flex items-center gap-1.5 bg-[var(--color-bg-secondary)] px-2 py-1 rounded text-sm font-mono">
                                    <span className="text-[var(--color-text-tertiary)]">CODE:</span> {team.teamCode}
                                </span>
                                <span className="capitalize text-sm">• {team.role}</span>
                            </div>
                        </div>

                        <div className="w-full md:w-64 bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-[var(--color-border)]">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Progress</span>
                                <span className="text-heading-sm text-[var(--color-primary)]">{progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-primary)] transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-2 text-right">
                                {completedRounds} of {totalRounds} rounds completed
                            </p>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-heading-md text-[var(--color-text-primary)]">Competition Rounds</h2>
                    </div>

                    <div className="grid gap-6">
                        {rounds.map((round) => (
                            <Card key={round.roundIndex} className={`
                                transition-all border-l-4 
                                ${round.submission ? 'border-l-[var(--color-success)]' : 'border-l-[var(--color-border)]'}
                            `}>
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">

                                        {/* Status Column */}
                                        <div className="p-6 md:w-64 border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 flex flex-col justify-center">
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <Badge variant={
                                                        round.submission ? 'success' :
                                                            round.status === 'open' ? 'primary' :
                                                                round.status === 'judging' ? 'info' : 'secondary'
                                                    } size="lg" className="capitalize">
                                                        {round.submission ? 'Completed' : (round.status || 'draft').replace('_', ' ')}
                                                    </Badge>
                                                    {round.submission && (
                                                        <Badge variant="outline" size="sm">v{round.submission.version}</Badge>
                                                    )}
                                                    {round.submission?.isLocked && (
                                                        <Badge variant="warning" size="sm"><Lock size={10} className="mr-1" /> Locked</Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-heading-sm text-[var(--color-text-primary)] mb-1">
                                                    {round.name}
                                                </h3>
                                                <p className="text-sm text-[var(--color-text-secondary)]">
                                                    Max Score: {round.maxScore}
                                                </p>
                                            </div>

                                            {/* Score Display (If Available) */}
                                            {round.score ? (
                                                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-[var(--color-text-secondary)]">Score</span>
                                                        <div className="flex items-center text-[var(--color-warning)]">
                                                            <Star size={12} fill="currentColor" className="mr-1" />
                                                            <span className="font-bold">{round.score.finalTotal}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-[var(--color-bg-secondary)] h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[var(--color-warning)]"
                                                            style={{ width: `${(round.score.finalTotal / round.maxScore) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-xs text-[var(--color-text-tertiary)] italic">
                                                    <Clock size={12} className="mr-1.5" />
                                                    Scores not released
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Column */}
                                        <div className="p-6 flex-1">
                                            <p className="text-body-md text-[var(--color-text-secondary)] mb-6">
                                                {round.description || "No description provided for this round."}
                                            </p>

                                            <div className="flex flex-wrap gap-3">
                                                {round.submission ? (
                                                    // Submitted State
                                                    <>
                                                        <Link to={`/hackathon/${id}/round/${round.roundIndex}/view`}>
                                                            <Button variant="outline" className="gap-2">
                                                                <FileText size={16} /> View Submission
                                                            </Button>
                                                        </Link>
                                                        {round.submission.status !== 'locked' && !round.submission.isLocked && round.status === 'open' && (
                                                            <Link to={`/hackathon/${id}/round/${round.roundIndex}/submit`}>
                                                                <Button variant="ghost" className="gap-2">
                                                                    Edit (v{round.submission.version})
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </>
                                                ) : (
                                                    // Pending State
                                                    round.status === 'open' ? (
                                                        <Link to={`/hackathon/${id}/round/${round.roundIndex}/submit`}>
                                                            <Button variant="primary" className="gap-2">
                                                                <Upload size={16} /> Submit Project
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="secondary" disabled className="gap-2 opacity-70 cursor-not-allowed">
                                                            <Lock size={16} /> {round.status === 'judging' ? 'Judging in Progress' : 'Submission Closed'}
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}
