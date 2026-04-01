import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Logo from '../components/ui/Logo';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function VerifyEmail() {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const { verifyEmail, resendOtp } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        } else {
            // Redirect to login if no email in state (accessed directly)
            navigate('/login');
        }
    }, [location, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setMessage('Please enter a valid 6-digit OTP');
            setMessageType('error');
            return;
        }

        const result = await verifyEmail(email, otp);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setMessage(result.message);
            setMessageType('error');
        }
    };

    const handleResend = async () => {
        setMessage(null);
        const result = await resendOtp(email);
        if (result.success) {
            setMessage('OTP sent successfully');
            setMessageType('success');
        } else {
            setMessage(result.message);
            setMessageType('error');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <Card className="max-w-md w-full animate-fade-up shadow-xl border border-[var(--color-border-default)]">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <Logo size="md" />
                    </div>
                    <CardTitle className="text-display-sm text-[var(--color-text-primary)]">Verify Email</CardTitle>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                        Enter the 6-digit code sent to <strong>{email}</strong>
                    </p>
                </CardHeader>

                <CardContent>
                    {message && (
                        <div className={`border px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center flex items-center justify-center gap-2 font-medium ${messageType === 'error'
                                ? 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/20 text-[var(--color-danger)]'
                                : 'bg-green-50 border-green-200 text-green-700'
                            }`}>
                            {messageType === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                            {message}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <InputField
                                label="Verification Code"
                                type="text"
                                id="otp"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                required
                                className="text-center tracking-widest text-2xl font-mono"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full justify-center shadow-lg shadow-indigo-500/20"
                        >
                            Verify Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-[var(--color-text-secondary)]">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors bg-transparent border-none cursor-pointer p-0"
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
