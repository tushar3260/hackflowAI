import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import AnimatedLogo from '../components/ui/AnimatedLogo';
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound, Mail, RefreshCw } from 'lucide-react';

export default function ForgotPassword() {
    const { forgotPassword, resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();

    // Steps: 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);

    // Resend countdown timer
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    // Step 1: Send OTP to email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        const res = await forgotPassword(email.trim());
        setLoading(false);

        if (res.success) {
            setStep(2);
            setResendTimer(60);
            setSuccessMessage(`A 6-digit verification code has been sent to ${email}`);
        } else {
            setError(res.message || 'Failed to send verification code. Please check the email.');
        }
    };

    // Resend OTP in Step 2
    const handleResendOtp = async () => {
        if (resendTimer > 0 || resendLoading) return;
        setError(null);
        setResendLoading(true);

        const res = await forgotPassword(email.trim());
        setResendLoading(false);

        if (res.success) {
            setResendTimer(60);
            setSuccessMessage('A new verification code has been sent to your email.');
        } else {
            setError(res.message || 'Failed to resend code');
        }
    };

    // Step 2: Submit OTP & New Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);

        if (otp.length !== 6) {
            setError('Please enter the 6-digit verification code');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const res = await resetPassword(email.trim(), otp.trim(), newPassword);
        setLoading(false);

        if (res.success) {
            setStep(3);
        } else {
            setError(res.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 relative">
            <div className="absolute top-8 left-8">
                <Link to="/login" className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Back to login
                </Link>
            </div>

            <Card className="max-w-md w-full animate-fade-up shadow-2xl shadow-black/40 border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <AnimatedLogo size="lg" />
                    </div>

                    {step === 1 && (
                        <>
                            <CardTitle className="text-heading-lg font-bold text-[var(--color-text-primary)] tracking-tight">Forgot Password</CardTitle>
                            <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                                Enter your email and we'll send a 6-digit verification code to reset your password.
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CardTitle className="text-heading-lg font-bold text-[var(--color-text-primary)] tracking-tight">Reset Password</CardTitle>
                            <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                                Enter the verification code sent to <strong className="text-[var(--color-text-primary)]">{email}</strong>
                            </p>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="flex justify-center my-3">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <CheckCircle size={32} />
                                </div>
                            </div>
                            <CardTitle className="text-heading-lg font-bold text-[var(--color-text-primary)] tracking-tight">Password Reset Complete</CardTitle>
                            <p className="text-body-sm text-[var(--color-text-secondary)] mt-2">
                                Your password has been successfully updated. You can now log in with your new credentials.
                            </p>
                        </>
                    )}
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-[rgba(var(--color-danger-rgb),0.1)] border border-[rgba(var(--color-danger-rgb),0.2)] text-[var(--color-danger)] px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center font-medium flex items-center justify-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && step === 2 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center font-medium flex items-center justify-center gap-2">
                            <CheckCircle size={16} className="shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <InputField
                                label="Account Email"
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hack@example.com"
                                required
                                autoFocus
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={loading}
                                className="w-full justify-center shadow-lg shadow-[rgba(var(--color-primary-rgb),0.2)] mt-4 font-bold"
                            >
                                Send Reset Code
                            </Button>
                        </form>
                    )}

                    {/* Step 2: OTP & New Password Form */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--color-text-secondary)]">Sent to {email}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className="text-[var(--color-primary)] hover:underline font-medium"
                                >
                                    Change email
                                </button>
                            </div>

                            <div>
                                <InputField
                                    label="6-Digit Verification Code"
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    required
                                    className="text-center tracking-widest text-2xl font-mono"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="relative">
                                <InputField
                                    label="New Password"
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-[var(--color-text-muted)] hover:text-white"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="relative">
                                <InputField
                                    label="Confirm New Password"
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={loading}
                                className="w-full justify-center shadow-lg shadow-[rgba(var(--color-primary-rgb),0.2)] mt-4 font-bold"
                            >
                                Reset Password
                            </Button>

                            <div className="flex items-center justify-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0 || resendLoading}
                                    className={`text-xs flex items-center gap-1.5 font-medium transition-colors ${
                                        resendTimer > 0 || resendLoading
                                            ? 'text-[var(--color-text-muted)] cursor-not-allowed'
                                            : 'text-[var(--color-primary)] hover:underline cursor-pointer'
                                    }`}
                                >
                                    <RefreshCw size={12} className={resendLoading ? 'animate-spin' : ''} />
                                    {resendTimer > 0
                                        ? `Resend code in ${resendTimer}s`
                                        : resendLoading
                                        ? 'Resending...'
                                        : 'Resend verification code'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Success Screen */}
                    {step === 3 && (
                        <div className="space-y-4 pt-2">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/login')}
                                className="w-full justify-center shadow-lg shadow-[rgba(var(--color-primary-rgb),0.2)] font-bold"
                            >
                                Back to Log In
                            </Button>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-body-sm text-[var(--color-text-secondary)]">
                            Remember your password?{' '}
                            <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
