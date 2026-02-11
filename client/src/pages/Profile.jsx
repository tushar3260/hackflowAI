
import React, { useState, useContext, useRef } from 'react';
import api, { SERVER_URL } from '../api/config';
import { Camera, Save, User, Mail, Lock, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import Card, { CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionTitle from '../components/ui/SectionTitle';
import InputField from '../components/ui/InputField';
import { Container } from '../components/ui/Layout';

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        collegeName: user?.collegeName || '',
        course: user?.course || '',
        yearOfStudy: user?.yearOfStudy || '',
        phone: user?.phone || '',
        skills: user?.skills ? (Array.isArray(user.skills) ? user.skills.join(', ') : user.skills) : '',
        githubUrl: user?.githubUrl || '',
        linkedinUrl: user?.linkedinUrl || ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar ? `${SERVER_URL}${user.avatar}` : null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (e.target.name === 'resume') {
                setResumeFile(file);
            } else {
                setAvatarFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('collegeName', formData.collegeName);
            data.append('course', formData.course);
            data.append('yearOfStudy', formData.yearOfStudy);
            data.append('phone', formData.phone);
            data.append('skills', formData.skills);
            data.append('githubUrl', formData.githubUrl);
            data.append('linkedinUrl', formData.linkedinUrl);
            if (formData.password) data.append('password', formData.password);
            if (avatarFile) data.append('avatar', avatarFile);
            if (resumeFile) data.append('resume', resumeFile);

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };

            const res = await api.put('/auth/profile', data, config);

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container className="py-24">
                <div className="max-w-2xl mx-auto">
                    <SectionTitle title="Edit Profile" subtitle="Update your personal information" center />

                    <Card>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-bg-surface)] ring-4 ring-[var(--color-bg-muted)] group-hover:ring-[var(--color-primary)] transition-all">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--color-bg-muted)] flex items-center justify-center">
                                                    <User size={48} className="text-[var(--color-text-muted)]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">Click to change avatar</p>
                                </div>

                                {/* Message */}
                                {message.text && (
                                    <div className={`p-4 rounded-[var(--radius-md)] flex items-center gap-2 ${message.type === 'error' ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/20' : 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/20'}`}>
                                        <AlertCircle size={20} />
                                        {message.text}
                                    </div>
                                )}

                                {/* Fields */}
                                <div className="space-y-4">
                                    <InputField
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        icon={User}
                                        placeholder="Enter your name"
                                    />

                                    <InputField
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        icon={Mail}
                                        placeholder="Enter your email"
                                    />

                                    <div className="pt-6 mt-6 border-t border-[var(--color-border-default)]">
                                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 italic text-[var(--color-primary)]">Participant Details (Auto-used for Hackathons)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="College / University"
                                                name="collegeName"
                                                value={formData.collegeName}
                                                onChange={handleChange}
                                                placeholder="e.g. Stanford University"
                                            />
                                            <InputField
                                                label="Course / Major"
                                                name="course"
                                                value={formData.course}
                                                onChange={handleChange}
                                                placeholder="e.g. Computer Science"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <InputField
                                                label="Year of Study"
                                                name="yearOfStudy"
                                                value={formData.yearOfStudy}
                                                onChange={handleChange}
                                                placeholder="e.g. 3rd Year"
                                            />
                                            <InputField
                                                label="Phone Number"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <InputField
                                                label="Skills (Comma separated)"
                                                name="skills"
                                                value={formData.skills}
                                                onChange={handleChange}
                                                placeholder="e.g. React, Node.js, Python"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <InputField
                                                label="GitHub URL"
                                                name="githubUrl"
                                                value={formData.githubUrl}
                                                onChange={handleChange}
                                                placeholder="https://github.com/..."
                                            />
                                            <InputField
                                                label="LinkedIn URL"
                                                name="linkedinUrl"
                                                value={formData.linkedinUrl}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Resume (PDF/Word)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    name="resume"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm text-[var(--color-text-muted)]
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)]
                                                        hover:file:bg-[var(--color-primary)]/20 cursor-pointer"
                                                />
                                                {user?.resumeUrl && (
                                                    <a href={`${SERVER_URL}${user.resumeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-primary)] hover:underline whitespace-nowrap">
                                                        View Current
                                                    </a>
                                                )}
                                            </div>
                                            {resumeFile && <p className="text-xs text-[var(--color-success)] mt-1">New file selected: {resumeFile.name}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-[var(--color-border-default)]">
                                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">Change Password (Optional)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="New Password"
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                icon={Lock}
                                                placeholder="New password"
                                            />
                                            <InputField
                                                label="Confirm Password"
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                icon={Lock}
                                                placeholder="Confirm password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end pt-6">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        isLoading={loading}
                                        className="shadow-lg shadow-indigo-500/20"
                                    >
                                        <Save size={18} className="mr-2" />
                                        Save Changes
                                    </Button>
                                </div>

                            </form>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
}
