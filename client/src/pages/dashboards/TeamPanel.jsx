
import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import Card, { CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import PlatformCard from '../../components/ui/PlatformCard';
import AnimatedTabs from '../../components/ui/AnimatedTabs';
import Badge from '../../components/ui/Badge';
import { animateStaggerGrid } from '../../utils/scrollAnimations';
import { Copy, User, Users, LogOut } from 'lucide-react';
import { Grid, Section, Container } from '../../components/ui/Layout';

export default function TeamPanel() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('myTeam');
    const [hackathons, setHackathons] = useState([]);
    const [myTeams, setMyTeams] = useState([]);

    // Forms
    const [createForm, setCreateForm] = useState({ name: '', hackathonId: '' });
    const [joinForm, setJoinForm] = useState({ teamCode: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const gridRef = useRef(null);

    useEffect(() => {
        fetchHackathons();
        fetchMyTeams();
    }, []);

    useEffect(() => {
        if (myTeams.length > 0 && gridRef.current) {
            animateStaggerGrid(gridRef.current);
        }
    }, [myTeams]);

    const fetchHackathons = async () => {
        try {
            const res = await api.get('/hackathons');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setHackathons(data);
            if (data.length > 0) {
                setCreateForm(prev => ({ ...prev, hackathonId: data[0]._id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyTeams = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get('/teams/my', config);
            setMyTeams(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await api.post('/teams/create', createForm, config);
            setSuccess('Team created successfully!');
            fetchMyTeams();
            setActiveTab('myTeam');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await api.post('/teams/join', joinForm, config);
            setSuccess('Joined team successfully!');
            fetchMyTeams();
            setActiveTab('myTeam');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join team');
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async (teamId) => {
        if (!window.confirm('Are you sure you want to leave this team?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await api.post('/teams/leave', { teamId }, config);
            fetchMyTeams();
            setSuccess('Left team successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave team');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container>
                <header className="mb-8 pt-8">
                    <h1 className="text-display-md text-[var(--color-text-primary)]">Team Management</h1>
                    <p className="text-body-md text-[var(--color-text-secondary)] mt-2">Join a team or start your own to compete.</p>
                </header>

                {/* Status Messages */}
                {error && <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] p-3 rounded-[var(--radius-md)] mb-4 text-body-sm font-medium">{error}</div>}
                {success && <div className="bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 text-[var(--color-success)] p-3 rounded-[var(--radius-md)] mb-4 text-body-sm font-medium">{success}</div>}

                {/* Tabs */}
                <AnimatedTabs
                    tabs={[
                        { id: 'myTeam', label: 'My Teams' },
                        { id: 'create', label: 'Create Team' },
                        { id: 'join', label: 'Join Team' }
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    className="mb-8"
                />

                {/* Content */}
                <Card className="min-h-[300px]">
                    <CardContent>
                        {/* MY TEAMS TAB */}
                        {activeTab === 'myTeam' && (
                            <div>
                                <h2 className="text-heading-md mb-4 text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Users size={20} className="text-[var(--color-primary)]" /> Your Teams
                                </h2>
                                {myTeams.length === 0 ? (
                                    <div className="text-center py-12 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                                        <p className="text-[var(--color-text-muted)]">You haven't joined any teams yet.</p>
                                    </div>
                                ) : (
                                    <Grid cols={2} ref={gridRef} className="gap-6">
                                        {myTeams.map(team => (
                                            <PlatformCard key={team._id} className="relative group" hoverEffect={false}>
                                                <CardContent>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <CardTitle>{team.name}</CardTitle>
                                                        {team.leader._id === user._id && <Badge variant="warning">Leader</Badge>}
                                                    </div>
                                                    <p className="text-body-sm text-[var(--color-text-secondary)] mb-4">
                                                        Hackathon: <span className="text-[var(--color-primary)] font-medium">{team.hackathon?.title}</span>
                                                    </p>

                                                    <div className="bg-[var(--color-bg-muted)] p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] mb-4 flex justify-between items-center group-hover:border-[var(--color-primary)]/30 transition-colors">
                                                        <div>
                                                            <p className="text-caption text-[var(--color-text-muted)] mb-1">Team Code</p>
                                                            <span className="font-mono text-heading-md text-[var(--color-text-primary)] tracking-widest">{team.teamCode}</span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => navigator.clipboard.writeText(team.teamCode)}
                                                            className="text-xs"
                                                        >
                                                            <Copy size={14} className="mr-1" /> Copy
                                                        </Button>
                                                    </div>

                                                    <div className="mb-6">
                                                        <p className="text-caption text-[var(--color-text-muted)] mb-2">Members</p>
                                                        <ul className="space-y-2">
                                                            {team.members.map(member => (
                                                                <li key={member._id} className="text-body-sm flex items-center gap-2 text-[var(--color-text-primary)]">
                                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-xs ring-1 ring-[var(--color-primary)]/20">
                                                                        <User size={14} />
                                                                    </div>
                                                                    {member.name} {member._id === team.leader._id && <span className="text-caption text-[var(--color-text-muted)]">(Leader)</span>}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <Button
                                                        variant="danger"
                                                        onClick={() => handleLeave(team._id)}
                                                        className="w-full justify-center"
                                                        icon={LogOut}
                                                    >
                                                        Leave Team
                                                    </Button>
                                                </CardContent>
                                            </PlatformCard>
                                        ))}
                                    </Grid>
                                )}
                            </div>
                        )}

                        {/* CREATE TEAM TAB */}
                        {activeTab === 'create' && (
                            <div className="max-w-md mx-auto py-8">
                                <h2 className="text-heading-md mb-6 text-center text-[var(--color-text-primary)]">Form a New Team</h2>
                                <form onSubmit={handleCreate} className="space-y-6">
                                    <InputField
                                        label="Team Name"
                                        value={createForm.name}
                                        onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                        placeholder="E.g. Code Wizards"
                                        required
                                    />
                                    <SelectField
                                        label="Select Hackathon"
                                        value={createForm.hackathonId}
                                        onChange={e => setCreateForm({ ...createForm, hackathonId: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select an event</option>
                                        {hackathons.map(h => (
                                            <option key={h._id} value={h._id}>{h.title}</option>
                                        ))}
                                    </SelectField>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full justify-center shadow-lg shadow-indigo-500/20"
                                        isLoading={loading}
                                    >
                                        Create Team
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* JOIN TEAM TAB */}
                        {activeTab === 'join' && (
                            <div className="max-w-md mx-auto py-8">
                                <h2 className="text-heading-md mb-6 text-center text-[var(--color-text-primary)]">Join Existing Team</h2>
                                <form onSubmit={handleJoin} className="space-y-6">
                                    <div>
                                        <label className="block text-[var(--color-text-secondary)] text-body-sm font-bold mb-2">Enter Team Code</label>
                                        <input
                                            type="text"
                                            value={joinForm.teamCode}
                                            onChange={e => setJoinForm({ ...joinForm, teamCode: e.target.value.toUpperCase() })}
                                            className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 text-[var(--color-text-primary)] font-mono text-center text-heading-lg tracking-[0.5em] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none uppercase transition-all"
                                            placeholder="XXXXXX"
                                            maxLength="6"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full justify-center shadow-lg shadow-indigo-500/20"
                                        isLoading={loading}
                                    >
                                        Join Team
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </div >
    );
}
