import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import SelectField from '../components/ui/SelectField';
import AnimatedLogo from '../components/ui/AnimatedLogo';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'participant'
    });
    const { register, googleLogin, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const result = await register(name, email, password, role);
        if (result.success) {
            if (result.message === 'OTP_SENT') {
                navigate('/verify-email', { state: { email } });
            } else {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 relative py-12">
            <div className="absolute top-8 left-8 hidden sm:block">
                <Link to="/" className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Back to home
                </Link>
            </div>

            <Card className="max-w-md w-full animate-fade-up shadow-2xl shadow-black/40 border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <AnimatedLogo size="lg" />
                    </div>
                    <CardTitle className="text-heading-lg font-bold text-[var(--color-text-primary)] tracking-tight">Create Account</CardTitle>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                        Join the community and start building
                    </p>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-[rgba(var(--color-danger-rgb),0.1)] border border-[rgba(var(--color-danger-rgb),0.2)] text-[var(--color-danger)] px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center flex items-center justify-center gap-2 font-medium">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <InputField
                            label="Full Name"
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="John Doe"
                            required
                        />

                        <InputField
                            label="Email Address"
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="hack@example.com"
                            required
                        />

                        <InputField
                            label="Password"
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="••••••••"
                            required
                            minLength="6"
                            helperText="Must be at least 6 characters"
                        />

                        <SelectField
                            label="Role"
                            id="role"
                            name="role"
                            value={role}
                            onChange={onChange}
                        >
                            <option value="participant">Participant</option>
                            <option value="judge">Judge</option>
                            <option value="organizer">Organizer</option>
                        </SelectField>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full justify-center shadow-lg shadow-[rgba(var(--color-primary-rgb),0.2)] mt-6 font-bold"
                        >
                            Sign Up
                        </Button>
                    </form>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[rgba(255,255,255,0.1)]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--color-bg-surface)] px-2 text-[var(--color-text-secondary)]">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex justify-center auth-google-wrapper">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    const success = await googleLogin(credentialResponse.credential);
                                    if (success) {
                                        navigate('/dashboard');
                                    }
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                                text="signup_with"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center text-sm">
                        <p className="text-[var(--color-text-secondary)]">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors">
                                Log In
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
