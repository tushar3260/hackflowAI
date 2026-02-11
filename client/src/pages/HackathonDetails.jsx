
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/config';
import AuthContext from '../context/AuthContext';
import { Calendar, Users, Trophy, Target, Gift, X, LogIn, ExternalLink } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import InputField from '../components/ui/InputField';
import { Grid, Section, Container } from '../components/ui/Layout';
import { CardSkeleton } from '../components/ui/Skeleton';

const HackathonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Application State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [invites, setInvites] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [myTeamLoading, setMyTeamLoading] = useState(true);

    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                // Public endpoint
                const { data } = await api.get(`/hackathons/${id}`);
                setHackathon(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch hackathon details');
            } finally {
                setLoading(false);
            }
        };

        fetchHackathon();
    }, [id]);

    useEffect(() => {
        const fetchMyTeam = async () => {
            if (!user) {
                setMyTeamLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setMyTeamLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get(`/teams/my/by-hackathon/${id}`, config);
                setMyTeam(data);
            } catch (err) {
                console.error("Error fetching my team:", err);
            } finally {
                setMyTeamLoading(false);
            }
        };

        fetchMyTeam();
    }, [id, user]);

    const handleApply = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Should be handled by UI state, but safe guard
                handleLoginToApply();
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Check if already in a team
            const { data: team } = await api.get(`/teams/my/by-hackathon/${id}`, config);

            if (team) {
                // Already in a team -> Go to participation (which checks profile)
                navigate(`/hackathon/${id}/participation`);
            } else {
                // No team -> Go to team step
                navigate(`/hackathon/${id}/team-step`);
            }
        } catch (err) {
            console.error('Error checking team status:', err);
            // Fallback to team step if error (or show error)
            navigate(`/hackathon/${id}/team-step`);
        }
    };

    const handleLoginToApply = () => {
        navigate(`/login?returnTo=/hackathon/${id}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-12 pb-12">
            <Container>
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-[var(--color-bg-surface)] rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-[var(--color-bg-surface)] rounded w-2/3 mb-8"></div>
                    <Grid cols={3} className="gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <CardSkeleton className="h-40" />
                            <CardSkeleton className="h-40" />
                        </div>
                        <CardSkeleton className="h-64" />
                    </Grid>
                </div>
            </Container>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
            <div className="text-center p-8 bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-danger)]/20">
                <div className="text-[var(--color-danger)] mb-4">
                    <X size={48} className="mx-auto" />
                </div>
                <h2 className="text-heading-md text-[var(--color-text-primary)] mb-2">Error Loading Hackathon</h2>
                <p className="text-[var(--color-text-secondary)]">{error}</p>
                <Link to="/hackathons" className="mt-6 inline-block">
                    <Button variant="secondary">Back to Browse</Button>
                </Link>
            </div>
        </div>
    );

    if (!hackathon) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
            <div className="text-center text-[var(--color-text-secondary)]">Hackathon not found</div>
        </div>
    );

    // Safe Authorization Logic
    const isOrganizer = user && hackathon.createdBy && (user.role === 'organizer' || hackathon.createdBy._id === user._id);
    const isParticipant = user && user.role === 'participant';
    const activeLeaderboard = hackathon.leaderboardPublished !== false; // Assuming default true for now or public view

    const startDate = new Date(hackathon.startDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const endDate = new Date(hackathon.endDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const isEnded = new Date(hackathon.endDate) < new Date();
    const isActive = new Date(hackathon.startDate) <= new Date() && !isEnded;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-12 pb-24">
            <Container>

                {/* Header Section */}
                <div className="relative mb-12">
                    <div className="absolute top-0 right-0 flex gap-3">
                        {/* Organizer - Edit Button */}
                        {isOrganizer && (
                            <Link to={`/dashboard/edit-hackathon/${id}`}>
                                <Button variant="outline">
                                    Edit Hackathon
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex gap-3 mb-6">
                        <Badge variant={isActive ? 'success' : isEnded ? 'default' : 'primary'}>
                            {isActive ? 'ACTIVE' : isEnded ? 'ENDED' : 'UPCOMING'}
                        </Badge>
                        <Badge variant="secondary">
                            {hackathon.difficulty || 'Intermediate'}
                        </Badge>
                    </div>

                    <h1 className="text-display-lg mb-4 text-[var(--color-text-primary)] tracking-tight">
                        {hackathon.title}
                    </h1>
                    <p className="text-body-lg text-[var(--color-text-secondary)] max-w-3xl leading-relaxed mb-8">
                        {hackathon.description}
                    </p>

                    {/* Meta Bar */}
                    <div className="flex flex-wrap gap-6 text-body-md text-[var(--color-text-secondary)] font-medium p-4 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] inline-flex">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-[var(--color-primary)]" size={20} />
                            <span>{startDate} <span className="text-[var(--color-text-muted)] mx-1">to</span> {endDate}</span>
                        </div>
                        <div className="w-px h-6 bg-[var(--color-border-default)] hidden md:block"></div>
                        <div className="flex items-center gap-2">
                            <Target className="text-[var(--color-accent)]" size={20} />
                            <span>Theme: <span className="text-[var(--color-text-primary)] font-bold">{hackathon.theme}</span></span>
                        </div>
                        <div className="w-px h-6 bg-[var(--color-border-default)] hidden md:block"></div>
                        <div className="flex items-center gap-2">
                            <Users className="text-[var(--color-success)]" size={20} />
                            <span>{hackathon.participants?.length || 0} Participants</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <Grid cols={3} className="gap-8">

                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Rounds */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-heading-lg mb-1 text-[var(--color-text-primary)]">Rounds & Schedule</h2>
                                    <p className="text-body-md text-[var(--color-text-secondary)]">The journey to victory</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {hackathon.rounds?.length > 0 ? (
                                    hackathon.rounds.map((round, index) => (
                                        <Card key={index} className="border-l-4 border-l-[var(--color-primary)] group hover:shadow-md transition-all">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                                                    <div>
                                                        <h3 className="text-heading-md text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{round.name}</h3>
                                                        <p className="text-body-md text-[var(--color-text-secondary)] mt-1">{round.description || 'No description provided.'}</p>
                                                    </div>
                                                    <Badge variant="info" className="whitespace-nowrap">
                                                        Weightage: {round.weightagePercent}%
                                                    </Badge>
                                                </div>

                                                {/* Criteria */}
                                                {round.criteria && round.criteria.length > 0 && (
                                                    <div className="bg-[var(--color-bg-muted)]/30 rounded-[var(--radius-md)] p-4 border border-[var(--color-border-default)]">
                                                        <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Evaluation Criteria</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                                                            {round.criteria.map((c, i) => (
                                                                <div key={i} className="flex justify-between items-center text-sm border-b border-[var(--color-border-default)] last:border-0 pb-2 last:pb-0">
                                                                    <span className="text-[var(--color-text-primary)]">{c.title}</span>
                                                                    <span className="font-mono font-bold text-[var(--color-primary)] text-xs bg-[var(--color-primary)]/10 px-2 py-0.5 rounded ml-2">{c.maxMarks} pts</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                                        No rounds defined yet.
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8">

                        {/* Action Card */}
                        <Card className="border-[var(--color-primary)]/20 shadow-lg shadow-indigo-900/5">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-heading-md text-[var(--color-text-primary)] mb-2">Ready to Build?</h3>
                                    <p className="text-body-sm text-[var(--color-text-secondary)]">
                                        {isActive
                                            ? "Registration is open! Form a team and start innovation."
                                            : isEnded
                                                ? "This hackathon has ended. View the leaderboard for results."
                                                : "Registration opens soon. Stay tuned!"}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {/* Determine Main Action Button */}
                                    {!user ? (
                                        <Button variant="primary" className="w-full justify-center text-lg py-6" onClick={handleLoginToApply} disabled={isEnded}>
                                            <LogIn size={20} className="mr-2" /> Login to Apply
                                        </Button>
                                    ) : isParticipant ? (
                                        myTeamLoading ? (
                                            <div className="w-full h-[60px] bg-[var(--color-bg-muted)] animate-pulse rounded-[var(--radius-md)] flex items-center justify-center text-xs text-[var(--color-text-muted)] font-medium">
                                                Checking Status...
                                            </div>
                                        ) : myTeam ? (
                                            <Button variant="success" className="w-full justify-center text-lg py-6" onClick={() => navigate(`/hackathon/${id}/participation`)}>
                                                <ExternalLink size={20} className="mr-2" /> Go to Dashboard
                                            </Button>
                                        ) : (
                                            <Button variant="primary" className="w-full justify-center text-lg py-6" onClick={handleApply} disabled={isEnded}>
                                                Apply Now
                                            </Button>
                                        )
                                    ) : null}

                                    {/* Leaderboard Button */}
                                    <Link to={`/leaderboard/${id}`} className="block">
                                        <Button variant="outline" className="w-full justify-center">
                                            <Trophy size={18} className="mr-2" /> View Leaderboard
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prizes Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-heading-md mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                                    <Gift className="text-[var(--color-primary)]" /> Prizes & Rewards
                                </h3>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-[var(--radius-md)] border border-amber-100">
                                        <Trophy className="text-amber-500" size={24} />
                                        <div>
                                            <div className="text-body-md font-bold text-amber-700">1st Place</div>
                                            <div className="text-caption text-amber-600/80">Gold Champion</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
                                        <Trophy className="text-[var(--color-text-muted)]" size={24} />
                                        <div>
                                            <div className="text-body-md font-bold text-[var(--color-text-secondary)]">2nd Place</div>
                                            <div className="text-caption text-[var(--color-text-muted)]">Silver Runner-up</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-[var(--radius-md)] border border-orange-100">
                                        <Trophy className="text-orange-400" size={24} />
                                        <div>
                                            <div className="text-body-md font-bold text-orange-700">3rd Place</div>
                                            <div className="text-caption text-orange-600/80">Bronze Finalist</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
            </Container>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-text-primary)]/50 backdrop-blur-sm p-4">
                    <Card className="max-w-md w-full animate-fade-up relative">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
                        >
                            <X size={20} />
                        </button>

                        <CardContent className="p-6">
                            <h2 className="text-heading-lg mb-2 text-[var(--color-text-primary)]">Apply for Challenge</h2>
                            <p className="text-[var(--color-text-secondary)] text-sm mb-6">Create your team and invite members to get started.</p>

                            {applyError && (
                                <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] p-3 rounded-[var(--radius-md)] mb-4 text-sm font-medium">
                                    {applyError}
                                </div>
                            )}

                            <form onSubmit={handleApply} className="space-y-4">
                                <InputField
                                    label="Team Name"
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="e.g. Code Wizards"
                                    required
                                />

                                <div>
                                    <label className="block text-body-sm font-bold text-[var(--color-text-secondary)] mb-1">Invite Members (Optional)</label>
                                    <textarea
                                        value={invites}
                                        onChange={(e) => setInvites(e.target.value)}
                                        className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-3 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all h-24 resize-none placeholder-[var(--color-text-muted)]"
                                        placeholder="Enter email addresses separated by commas..."
                                    />
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Example: alice@example.com, bob@example.com</p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        isLoading={applyLoading}
                                        className="w-full justify-center"
                                    >
                                        {applyLoading ? 'Creating Team...' : 'Create Team & Apply'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default HackathonDetails;
