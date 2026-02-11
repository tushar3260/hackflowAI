import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import { Container } from '../../components/ui/Layout';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Badge from '../../components/ui/Badge';
import { Users, Mail, Trash2, Shield, ArrowLeft, UserPlus } from 'lucide-react';

export default function OrganizerJudges() {
    const { user } = useContext(AuthContext);
    const { hackathonId: id } = useParams();
    const navigate = useNavigate();
    const [hackathon, setHackathon] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [inviteLoading, setInviteLoading] = useState(false);

    const isOwner = hackathon?.createdBy?._id === (user?._id || user?.id) ||
        hackathon?.createdBy === (user?._id || user?.id);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchHackathon();
    }, [id]);

    const fetchHackathon = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/hackathons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Need to populate judges details. 
            // The getHackathonById endpoint might not populate 'judges' deeply or at all depending on controller.
            // Let's assume for now it returns IDs or we need a specific endpoint. 
            // Actually getHackathonById populates createdBy. 
            // Previous controller code: .populate('createdBy', 'name email').
            // It does NOT populate judges. We need to fetch details or update controller.
            // For now, I will optimistically check if they are populated or just ID.
            // If just ID, UI will be ugly. 
            // CORRECT APPROACH: Update getHackathonById in controller to populate judges?
            // OR make a specific getHackathonJudges endpoint.
            // Trying to use what we have: checks hackathon.judges.
            // Let's rely on React state updates after "Invite" which returns updated hackathon. 
            // BUT initial load needs population.
            // I'll update the controller to populate judges in a separate Step or here?
            // I should assume I need to populate.
            // Let's check if I can just Populate in the Controller quickly.

            // Wait, looking at file view of hackathonController.js
            // getHackathonById: .populate('createdBy', 'name email'); 
            // It MISSES judges.

            setHackathon(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load hackathon');
        } finally {
            setLoading(false);
        }
    };

    // Helper to fetch full details if not populated
    // Actually, I should update the backend controller to populate judges for the Organizer.
    // I will do that in next step. For now writing frontend.

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const res = await api.post(`/hackathons/${id}/judges`,
                { email: inviteEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setHackathon(res.data);
            setSuccess('Judge invited successfully!');
            setInviteEmail('');
            // reload to get populated data if controller updated
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to invite judge');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemove = async (judgeId) => {
        if (!window.confirm('Are you sure you want to remove this judge?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await api.delete(`/hackathons/${id}/judges/${judgeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHackathon(res.data);
            setSuccess('Judge removed successfully');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove judge');
        }
    };

    if (loading) return <Container className="pt-20">Loading...</Container>;
    if (!hackathon) return <Container className="pt-20">Hackathon not found</Container>;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-20">
            <Container>
                <div className="pt-8 mb-8">
                    <Button variant="ghost" className="mb-4 pl-0 gap-2" onClick={() => navigate(`/dashboard/organizer`)}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                    <h1 className="text-display-sm text-[var(--color-text-primary)] mb-2">Manage Judges</h1>
                    <p className="text-[var(--color-text-secondary)]">Hackathon: <span className="font-semibold">{hackathon.title}</span></p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invite Section */}
                    {isOwner && (
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus size={20} className="text-[var(--color-primary)]" />
                                        Invite Judge
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleInvite} className="space-y-4">
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            Enter the email address of the user you want to invite as a judge. They must already have a "Judge" account.
                                        </p>
                                        <InputField
                                            label="Judge Email"
                                            type="email"
                                            placeholder="judge@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            icon={Mail}
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            isLoading={inviteLoading}
                                            className="w-full"
                                        >
                                            Send Invitation
                                        </Button>
                                        {error && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] p-2 rounded">{error}</div>}
                                        {success && <div className="text-sm text-[var(--color-success)] bg-[var(--color-success-bg)] p-2 rounded">{success}</div>}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* List Section */}
                    <div className={isOwner ? "lg:col-span-2" : "lg:col-span-3"}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield size={20} className="text-[var(--color-info)]" />
                                    Assigned Judges
                                    <Badge variant="secondary" className="ml-2">{hackathon.judges?.length || 0}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hackathon.judges && hackathon.judges.length > 0 ? (
                                    <div className="divide-y divide-[var(--color-border)]">
                                        {hackathon.judges.map((judge) => (
                                            <div key={judge._id || judge} className="py-4 flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-secondary)]">
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        {/* Handle both populated and unpopulated cases gracefully */}
                                                        <p className="font-medium text-[var(--color-text-primary)]">
                                                            {judge.name || 'Judge User'}
                                                        </p>
                                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                                            {judge.email || (typeof judge === 'string' ? judge : 'Detail not loaded')}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isOwner && (
                                                    <Button
                                                        variant="ghost"
                                                        className="text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                                                        onClick={() => handleRemove(judge._id || judge)}
                                                        title="Remove Judge"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-[var(--color-text-muted)]">
                                        <Shield size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No judges assigned yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
}
