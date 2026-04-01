import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import AnimatedLogo from '../components/ui/AnimatedLogo';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { login, googleLogin, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            // Check for returnTo param
            const params = new URLSearchParams(window.location.search);
            const returnTo = params.get('returnTo');
            if (returnTo) {
                navigate(returnTo);
            } else {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 relative">
            <div className="absolute top-8 left-8">
                <Link to="/" className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Back to home
                </Link>
            </div>

            <Card className="max-w-md w-full animate-fade-up shadow-2xl shadow-black/40 border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <AnimatedLogo size="lg" />
                    </div>
                    <CardTitle className="text-heading-lg font-bold text-[var(--color-text-primary)] tracking-tight">Welcome Back</CardTitle>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                        Enter your credentials to access your account
                    </p>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-[rgba(var(--color-danger-rgb),0.1)] border border-[rgba(var(--color-danger-rgb),0.2)] text-[var(--color-danger)] px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <InputField
                            label="Email"
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="hack@example.com"
                            required
                        />

                        <div className="space-y-1">
                            <InputField
                                label="Password"
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                                required
                            />
                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" title="Feature coming soon" className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full justify-center shadow-lg shadow-[rgba(var(--color-primary-rgb),0.2)] mt-4 font-bold"
                        >
                            Log In
                        </Button>
                    </form>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[rgba(255,255,255,0.1)]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--color-bg-surface)] px-2 text-[var(--color-text-secondary)]">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex justify-center auth-google-wrapper">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    const success = await googleLogin(credentialResponse.credential);
                                    if (success) {
                                        const params = new URLSearchParams(window.location.search);
                                        const returnTo = params.get('returnTo');
                                        navigate(returnTo || '/dashboard');
                                    }
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center text-sm">
                        <p className="text-[var(--color-text-secondary)]">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <style jsx>{`
                .auth-google-wrapper > div {
                    width: 100% !important;
                }
            `}</style>
        </div>
    );
}
