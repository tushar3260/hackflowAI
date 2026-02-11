
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import PlatformTable from '../../components/ui/PlatformTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Container } from '../../components/ui/Layout';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import Card from '../../components/ui/Card';

const Leaderboard = () => {
    const { hackathonId } = useParams();
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [isTransparencyMode, setIsTransparencyMode] = useState(false); // For organizers

    const fetchLeaderboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/leaderboard/${hackathonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaderboard(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, [hackathonId]);

    const handleExpandWrapper = (teamId) => {
        if (expandedRow === teamId) {
            setExpandedRow(null);
        } else {
            setExpandedRow(teamId);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-text-muted)] animate-pulse">Loading Leaderboard...</div>
        </div>
    );

    if (!leaderboard) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-text-muted)]">No leaderboard data available yet.</div>
        </div>
    );

    const isOrganizer = user && user.role === 'organizer';

    return (
        <div className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-[500px] rounded-[var(--radius-xl)]">
            <Container className="py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-display-sm text-[var(--color-text-primary)] flex items-center gap-2">
                        <Trophy className="text-[var(--color-warning)]" /> Live Leaderboard
                    </h1>
                    <div className="flex gap-4">
                        {isOrganizer && (
                            <Button
                                variant={isTransparencyMode ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setIsTransparencyMode(!isTransparencyMode)}
                            >
                                {isTransparencyMode ? 'Transparency: ON' : 'Transparency: OFF'}
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={fetchLeaderboard}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            Refresh Now
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border-0 shadow-lg">
                    <PlatformTable
                        headers={[
                            { label: 'Rank', key: 'rank', width: 'w-24', sortable: true },
                            { label: 'Team', key: 'team.name' },
                            { label: 'Rounds Completed', key: 'roundScores.length' },
                            { label: 'Total Score', key: 'totalScore', sortable: true },
                            { label: '', key: 'expand', width: 'w-16' }
                        ]}
                        data={leaderboard.rows}
                        renderRow={(row) => (
                            <React.Fragment key={row.team._id}>
                                <tr
                                    className={`hover:bg-[var(--color-bg-muted)]/50 transition-colors cursor-pointer border-b border-[var(--color-border-default)] last:border-0 ${expandedRow === row.team._id ? 'bg-[var(--color-bg-muted)]/30' : ''}`}
                                    onClick={() => handleExpandWrapper(row.team._id)}
                                >
                                    <td className="p-4">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${row.rank === 1 ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/30' :
                                            row.rank === 2 ? 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]' :
                                                row.rank === 3 ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/30' :
                                                    'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-default)]'
                                            }`}>
                                            {row.rank}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-[var(--color-text-primary)]">{row.team.name}</div>
                                        <div className="text-xs text-[var(--color-text-muted)] font-mono">{row.team.teamCode}</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="info">
                                            {row.roundScores.length} Rounds
                                        </Badge>
                                    </td>
                                    <td className="p-4 font-bold text-lg text-[var(--color-primary)]">
                                        {row.totalScore.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center text-[var(--color-text-muted)]">
                                        {expandedRow === row.team._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </td>
                                </tr>

                                {/* Expandable Breakdown */}
                                {expandedRow === row.team._id && (
                                    <tr className="bg-[var(--color-bg-muted)]/30">
                                        <td colSpan="5" className="p-0 border-b border-[var(--color-border-default)]">
                                            <div className="p-6 animate-fade-in">
                                                <h3 className="text-xs font-bold text-[var(--color-text-muted)] mb-4 uppercase tracking-wider">Score Breakdown</h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {row.roundScores.map((round) => (
                                                        <div key={round.roundIndex} className="bg-[var(--color-bg-surface)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] shadow-sm relative overflow-hidden">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-bold text-[var(--color-text-primary)]">{round.roundName}</span>
                                                                <span className="text-[10px] font-bold px-2 py-1 bg-[var(--color-bg-muted)] rounded text-[var(--color-text-secondary)] uppercase">Weight: {round.weightagePercent}%</span>
                                                            </div>

                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between text-[var(--color-text-secondary)]">
                                                                    <span>Judge Avg:</span>
                                                                    <span className="font-mono font-medium">{round.averageJudgeScore ? round.averageJudgeScore.toFixed(1) : '-'}</span>
                                                                </div>
                                                                <div className="flex justify-between text-[var(--color-text-secondary)]">
                                                                    <span>AI Score:</span>
                                                                    <span className="font-mono font-medium">{round.aiScore ? round.aiScore.toFixed(1) : '-'}</span>
                                                                </div>
                                                                <div className="h-px bg-[var(--color-border-default)] my-2"></div>
                                                                <div className="flex justify-between items-center font-bold">
                                                                    <span className="text-[var(--color-text-primary)]">Weighted:</span>
                                                                    <span className="text-[var(--color-primary)]">{round.weightedRoundScore ? round.weightedRoundScore.toFixed(2) : '0.00'}</span>
                                                                </div>
                                                            </div>

                                                            {/* Contribution Bar */}
                                                            <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
                                                                <div className="flex h-1.5 w-full bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                                                                    <div className="bg-[var(--color-primary)] h-full" style={{ width: '70%' }}></div>
                                                                    <div className="bg-[var(--color-info)] h-full" style={{ width: '30%' }}></div>
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                                                                    <span>Judge</span>
                                                                    <span>AI</span>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )}
                    />
                </Card>

                <div className="text-center text-xs text-[var(--color-text-muted)] mt-6">
                    Scores update live. Ranks are calculated based on weighted round performance.
                </div>
            </Container>
        </div>
    );
};

export default Leaderboard;
