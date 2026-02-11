
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import SelectField from '../components/ui/SelectField';
import Logo from '../components/ui/Logo';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'participant'
    });
    const { register, error } = useContext(AuthContext);
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
        const success = await register(name, email, password, role);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <Card className="max-w-md w-full animate-fade-up shadow-xl border border-[var(--color-border-default)]">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <Logo size="md" />
                    </div>
                    <CardTitle className="text-display-sm text-[var(--color-text-primary)]">Create Account</CardTitle>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                        Join the community and start building
                    </p>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm text-center flex items-center justify-center gap-2 font-medium">
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
                            className="w-full justify-center shadow-lg shadow-indigo-500/20 mt-4"
                        >
                            Sign Up
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--color-border-default)] text-center text-sm">
                        <p className="text-[var(--color-text-secondary)]">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors">
                                Log In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
