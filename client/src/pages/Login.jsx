
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Logo from '../components/ui/Logo';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { login, error } = useContext(AuthContext);
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
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <Card className="max-w-md w-full animate-fade-up shadow-xl border border-[var(--color-border-default)]">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <Logo size="md" />
                    </div>
                    <CardTitle className="text-display-sm text-[var(--color-text-primary)]">Welcome Back</CardTitle>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                        Enter your credentials to access your account
                    </p>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center font-medium">
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
                            <div className="flex justify-end">
                                <Link to="#" className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full justify-center shadow-lg shadow-indigo-500/20 mt-2"
                        >
                            Log In
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--color-border-default)] text-center text-sm">
                        <p className="text-[var(--color-text-secondary)]">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
