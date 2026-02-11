
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import AuthContext from '../context/AuthContext';
import { Container, Section } from '../components/ui/Layout';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import FileField from '../components/ui/FileField';
import { UserCheck } from 'lucide-react';

export default function ParticipantProfileForm() {
    const { id } = useParams(); // Hackathon ID
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        collegeName: user?.collegeName || '',
        course: user?.course || '',
        yearOfStudy: user?.yearOfStudy || '',
        phone: user?.phone || '',
        skills: user?.skills ? (Array.isArray(user.skills) ? user.skills.join(', ') : user.skills) : '',
        githubUrl: user?.githubUrl || '',
        linkedinUrl: user?.linkedinUrl || ''
    });
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                // We don't have a direct "latest" endpoint, but we can try to fetch for any hackathon 
                // or just let the lazy creation handle the redirect. 
                // However, if the user manually navigates here, we want to help them.
                const res = await api.get(`/participation/${id}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.profile) {
                    const p = res.data.profile;
                    setFormData({
                        fullName: p.fullName || user?.name || '',
                        collegeName: p.collegeName || '',
                        course: p.course || '',
                        yearOfStudy: p.yearOfStudy || '',
                        phone: p.phone || '',
                        skills: p.skills ? (Array.isArray(p.skills) ? p.skills.join(', ') : p.skills) : '',
                        githubUrl: p.githubUrl || '',
                        linkedinUrl: p.linkedinUrl || ''
                    });
                }
            } catch (err) {
                // Ignore errors here - if it fails it fails
            }
        };
        fetchLatestProfile();
    }, [id, user]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (resume) {
                data.append('resume', resume);
            }

            // Also update global profile in User model
            await api.put('/auth/profile', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Then create hackathon-specific profile
            await api.post(`/participant-profile/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Redirect to participation dashboard on success
            navigate(`/hackathon/${id}/participation`);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-12 pb-24">
            <Container>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                            <UserCheck size={24} />
                        </div>
                        <CardTitle>Participant Details</CardTitle>
                        <p className="text-sm text-[var(--color-text-secondary)]">Additional details required for this hackathon</p>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm p-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        <form onSubmit={onSubmit} className="space-y-4">
                            <InputField
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={onChange}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="College / University"
                                    name="collegeName"
                                    value={formData.collegeName}
                                    onChange={onChange}
                                    placeholder="e.g. Stanford University"
                                    required
                                />
                                <InputField
                                    label="Year of Study"
                                    name="yearOfStudy"
                                    value={formData.yearOfStudy}
                                    onChange={onChange}
                                    placeholder="e.g. 3rd Year"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Course / Major"
                                    name="course"
                                    value={formData.course}
                                    onChange={onChange}
                                    placeholder="e.g. Computer Science"
                                />
                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={onChange}
                                    placeholder="+1 234 567 8900"
                                    required
                                />
                            </div>

                            <InputField
                                label="Skills (Comma separated)"
                                name="skills"
                                value={formData.skills}
                                onChange={onChange}
                                placeholder="e.g. React, Node.js, Python"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="GitHub URL"
                                    name="githubUrl"
                                    value={formData.githubUrl}
                                    onChange={onChange}
                                    placeholder="https://github.com/username"
                                />
                                <InputField
                                    label="LinkedIn URL"
                                    name="linkedinUrl"
                                    value={formData.linkedinUrl}
                                    onChange={onChange}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>

                            <FileField
                                label="Resume (Optional)"
                                name="resume"
                                onChange={onFileChange}
                                accept=".pdf,.doc,.docx"
                                helperText="Upload PDF or Word document (Max 10MB)"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full justify-center mt-6"
                                isLoading={loading}
                            >
                                Complete Registration
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
}
