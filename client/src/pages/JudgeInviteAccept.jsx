import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Logo from '../components/ui/Logo';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function JudgeInviteAccept() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying invitation...');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);

    useEffect(() => {
        const verifyInvite = async () => {
            // 1. Get token from URL query params
            const searchParams = new URLSearchParams(location.search);
            consttoken = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid invitation link. Token missing.');
                return;
            }

            // 2. Check if logged in
            if (!user && !authLoading) {
                // Redirect to login with returnTo
                // Store token in state or URL to persist after login?
                // Better: Redirect to login, passing the current URL as redirect target

                // For now, simpler: user must be logged in. If not, show button to Login
                setStatus('error');
                setMessage('Please log in to accept this invitation.');
                return;
            }

            if (authLoading) return; // Wait for auth check

            // 3. Call API to accept
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/hackathons/accept-judge-invite`,
                    { token },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );

                setStatus('success');
                setMessage('Invitation accepted! You have been added as a judge.');

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);

            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Failed to accept invitation.');
            }
        };

        verifyInvite();
    }, [location.search, user, authLoading, navigate]);

    const handleLoginRedirect = () => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        // We want to return here after login
        // The login component usually redirects to /dashboard. 
        // Implementation detail: Login component doesn't inherently support dynamic redirects yet easily.
        // Simpler: Send user to Login, they login, then they have to click the email link again?
        // OR: We store returnUrl in localStorage?

        // Let's assume standard flow: User clicks link -> Login Page -> Dashboard -> User clicks link again -> Success.
        // Or User logs in -> clicks link -> Success.
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <Card className="max-w-md w-full animate-fade-up shadow-xl border border-[var(--color-border-default)]">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <Logo size="md" />
                    </div>
                    <CardTitle className="text-display-sm text-[var(--color-text-primary)]">
                        Judge Invitation
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">

                    {status === 'verifying' && (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)] mb-4" />
                            <p className="text-[var(--color-text-secondary)]">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">Success!</h3>
                            <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
                            <Button onClick={() => navigate('/dashboard')} variant="primary">
                                Go to Dashboard
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <AlertCircle className="h-12 w-12 text-[var(--color-danger)] mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">Unable to Accept</h3>
                            <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>

                            {message.includes('log in') ? (
                                <Button onClick={handleLoginRedirect} variant="primary">
                                    Log In
                                </Button>
                            ) : (
                                <Button onClick={() => navigate('/dashboard')} variant="secondary">
                                    Return to Dashboard
                                </Button>
                            )}
                        </>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
