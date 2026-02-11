
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { Container, Grid } from '../components/ui/Layout';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { Users, UserPlus } from 'lucide-react';

export default function TeamStep() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Create Team State
    const [createName, setCreateName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Join Team State
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState(null);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await api.post('/teams/create', {
                name: createName,
                hackathonId: id
            }, config);

            navigate(`/hackathon/${id}/participation`);
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to create team');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        setJoinLoading(true);
        setJoinError(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await api.post('/teams/join', {
                teamCode: joinCode
            }, config);

            navigate(`/hackathon/${id}/participation`);
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Failed to join team');
        } finally {
            setJoinLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-12 pb-24">
            <Container>
                <div className="text-center mb-12">
                    <h1 className="text-display-md text-[var(--color-text-primary)] mb-3">Team Registration</h1>
                    <p className="text-body-lg text-[var(--color-text-secondary)]">To participate, you must either create a new team or join an existing one.</p>
                </div>

                <Grid cols={2} className="max-w-4xl mx-auto gap-8">

                    {/* Create Team Card */}
                    <Card className="hover:border-[var(--color-primary)]/50 transition-colors h-full">
                        <CardHeader className="text-center pb-2">
                            <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                                <Users size={24} />
                            </div>
                            <CardTitle>Create a Team</CardTitle>
                            <p className="text-sm text-[var(--color-text-secondary)]">Start a new team and invite others</p>
                        </CardHeader>
                        <CardContent>
                            {createError && (
                                <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm p-3 rounded mb-4">
                                    {createError}
                                </div>
                            )}
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <InputField
                                    label="Team Name"
                                    placeholder="e.g. The Avengers"
                                    value={createName}
                                    onChange={(e) => setCreateName(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full justify-center"
                                    isLoading={createLoading}
                                >
                                    Create & Continue
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Join Team Card */}
                    <Card className="hover:border-[var(--color-primary)]/50 transition-colors h-full">
                        <CardHeader className="text-center pb-2">
                            <div className="w-12 h-12 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-accent)]">
                                <UserPlus size={24} />
                            </div>
                            <CardTitle>Join a Team</CardTitle>
                            <p className="text-sm text-[var(--color-text-secondary)]">Enter a code to join an existing team</p>
                        </CardHeader>
                        <CardContent>
                            {joinError && (
                                <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm p-3 rounded mb-4">
                                    {joinError}
                                </div>
                            )}
                            <form onSubmit={handleJoinTeam} className="space-y-4">
                                <InputField
                                    label="Team Code"
                                    placeholder="e.g. XY78Z9"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full justify-center"
                                    isLoading={joinLoading}
                                >
                                    Join & Continue
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                </Grid>
            </Container>
        </div>
    );
}
