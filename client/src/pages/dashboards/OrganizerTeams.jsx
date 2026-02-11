
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import PlatformTable from '../../components/ui/PlatformTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Users, User } from 'lucide-react';
import { Container } from '../../components/ui/Layout';

export default function OrganizerTeams() {
    const { user } = useContext(AuthContext);
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOwner = hackathon?.createdBy?._id === (user?._id || user?.id) ||
        hackathon?.createdBy === (user?._id || user?.id);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch hackathon details
                const hackRes = await api.get(`/hackathons/${hackathonId}`);
                setHackathon(hackRes.data);

                // Fetch teams
                const teamRes = await api.get(`/teams/hackathon/${hackathonId}`, config);
                setTeams(teamRes.data);
            } catch (err) {
                setError('Failed to load teams');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [hackathonId]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-text-muted)] animate-pulse">Loading teams...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-danger)]">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container>
                <header className="mb-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-2 pl-0 hover:bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                        </Button>
                        <h1 className="text-display-md text-[var(--color-text-primary)] flex items-center gap-2">
                            <Users className="text-[var(--color-primary)]" /> Teams
                        </h1>
                        <p className="text-body-md text-[var(--color-text-secondary)]">Manage teams for <span className="text-[var(--color-primary)] font-semibold">{hackathon?.title}</span></p>
                    </div>
                </header>

                <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border-default)] overflow-hidden">
                    <PlatformTable
                        headers={[
                            { label: 'Team Name', key: 'name', sortable: true },
                            { label: 'Code', key: 'teamCode' },
                            { label: 'Leader', key: 'leader' },
                            { label: 'Members', key: 'members' },
                            { label: 'Registered', key: 'createdAt', sortable: true }
                        ]}
                        data={teams}
                        renderRow={(team) => (
                            <tr key={team._id} className="hover:bg-[var(--color-bg-muted)]/50 transition-colors border-b border-[var(--color-border-default)] last:border-0">
                                <td className="p-4">
                                    <div className="text-body-sm font-bold text-[var(--color-text-primary)]">{team.name}</div>
                                </td>
                                <td className="p-4">
                                    <span className="font-mono text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] px-2 py-1 rounded border border-[var(--color-border-default)]">
                                        {team.teamCode}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold ring-1 ring-[var(--color-primary)]/20">
                                            {team.leader?.name.charAt(0)}
                                        </div>
                                        <span className="text-body-sm text-[var(--color-text-primary)]">{team.leader?.name}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex -space-x-2">
                                        {team.members.map((m, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-bg-muted)] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)] shadow-sm hover:scale-110 transition-transform z-10 hover:z-20 cursor-default" title={m.name}>
                                                {m.name.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-[var(--color-text-muted)]">
                                    {new Date(team.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        )}
                    />
                </div>
            </Container>
        </div>
    );
}
