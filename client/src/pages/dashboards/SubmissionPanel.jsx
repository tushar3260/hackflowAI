import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api, { SERVER_URL } from '../../api/config';
import AuthContext from '../../context/AuthContext';
import Card, { CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import TextareaField from '../../components/ui/TextareaField';
import SelectField from '../../components/ui/SelectField';
import FileField from '../../components/ui/FileField';
import AIFeedbackPanel from '../../components/AIFeedbackPanel';
import Badge from '../../components/ui/Badge';
import { AlertCircle, CheckCircle, ExternalLink, Github, Youtube, FileText, Lock } from 'lucide-react';
import { Container } from '../../components/ui/Layout';

// Helper for effective status
const resolveEffectiveRoundStatus = (round) => {
    if (round.autoTimeControlEnabled === false) return round.status;
    const manualOverrides = ['draft', 'judging', 'published'];
    if (manualOverrides.includes(round.status)) return round.status;
    if (!round.startTime || !round.endTime) return round.status;

    const now = new Date();
    const start = new Date(round.startTime);
    const end = new Date(round.endTime);

    if (now < start) return 'scheduled'; // Client-side specific 'scheduled' to show upcoming
    if (now >= start && now <= end) return 'open';
    return 'submission_closed';
};

const CountDown = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Expired');
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [targetDate]);

    return <span className="font-mono text-xs">{timeLeft}</span>;
};

const WaitWrapper = ({ target, label }) => (
    <div className="flex items-center gap-2">
        <span className="opacity-80 text-xs font-semibold">{label}</span>
        <CountDown targetDate={target} />
    </div>
);

export default function SubmissionPanel() {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const { id, roundIndex } = useParams();
    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [rounds, setRounds] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    // Form State
    const [activeRoundId, setActiveRoundId] = useState(null); // Keying off ID for UI stability
    const [formData, setFormData] = useState({
        notesText: '',
        githubUrl: '',
        demoVideoUrl: '',
        ppt: null,
        document: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHackathons();
        if (location.state?.initialHackathonId) {
            setSelectedHackathon(location.state.initialHackathonId);
        } else if (id) {
            setSelectedHackathon(id);
        }
    }, [location.state, id]);

    // Handle Round Selection from URL
    useEffect(() => {
        if (rounds.length > 0 && roundIndex && !activeRoundId) {
            const r = rounds.find(r => r.order === parseInt(roundIndex));
            if (r) setActiveRoundId(r._id);
        }
    }, [rounds, roundIndex]);

    useEffect(() => {
        if (selectedHackathon) {
            fetchHackathonDetails();
            fetchMyTeam();
            fetchMySubmissions();
        }
    }, [selectedHackathon]);

    const fetchHackathons = async () => {
        try {
            const res = await api.get('/hackathons');
            const data = res.data.data || res.data;
            setHackathons(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const fetchHackathonDetails = async () => {
        try {
            // First check if we already have it in local list
            const existing = hackathons.find(h => h._id === selectedHackathon);
            if (existing && existing.rounds) {
                setRounds(existing.rounds);
                return;
            }

            // Otherwise fetch full details
            const res = await api.get(`/hackathons/${selectedHackathon}`);
            if (res.data && res.data.rounds) {
                setRounds(res.data.rounds);
            }
        } catch (err) { console.error(err); }
    };

    const fetchMyTeam = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.get(`/teams/my?hackathonId=${selectedHackathon}`, config);
            // API returns array, find the one for this hackathon
            const team = res.data.find(t => t.hackathon._id === selectedHackathon || t.hackathon === selectedHackathon);
            setMyTeam(team);
        } catch (err) { console.error(err); }
    };

    const fetchMySubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.get('/submissions/my', config);

            // Robust filtering
            const filtered = res.data.filter(s => {
                const hId = s.hackathon?._id || s.hackathon;
                return hId === selectedHackathon;
            });
            setSubmissions(filtered);
        } catch (err) { console.error(err); }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isLeader = () => {
        if (!myTeam || !user) return false;
        const leaderId = myTeam.leader?._id || myTeam.leader?.id || myTeam.leader;
        const userId = user._id || user.id;
        return leaderId?.toString() === userId?.toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Find Round Order from ID
        const currentRound = rounds.find(r => r._id === activeRoundId);
        if (!currentRound) {
            setError('Invalid Round Selected');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-material' // axios handles Boundary
                }
            };

            const data = new FormData();
            data.append('hackathonId', selectedHackathon);
            data.append('roundIndex', currentRound.order);

            if (currentRound.submissionSchema && currentRound.submissionSchema.length > 0) {
                // Dynamic Schema
                currentRound.submissionSchema.forEach(field => {
                    if (formData[field.fieldKey]) {
                        data.append(field.fieldKey, formData[field.fieldKey]);
                    }
                });
            } else {
                // Legacy Fallback
                data.append('notesText', formData.notesText || '');
                data.append('githubUrl', formData.githubUrl || '');
                data.append('demoVideoUrl', formData.demoVideoUrl || '');
                if (formData.ppt) data.append('ppt', formData.ppt);
                if (formData.document) data.append('document', formData.document);
            }

            await api.post('/submissions/submit', data, config);
            setMessage('Submission successful!');
            fetchMySubmissions();
            setFormData({}); // Clear
            setActiveRoundId(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionForRound = (index) => {
        // Fallback: if order is missing, try to match by name or return undefined
        return submissions.find(s => s.roundIndex === index);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container>
                <header className="mb-8 pt-8">
                    <h1 className="text-display-md text-[var(--color-text-primary)] mb-6">Project Submissions</h1>

                    {/* Hackathon Selector - Hide if coming from specific hackathon route */}
                    {!id && (
                        <div className="max-w-xl">
                            <SelectField
                                label="Select Event in Progress"
                                value={selectedHackathon}
                                onChange={(e) => setSelectedHackathon(e.target.value)}
                            >
                                <option value="">-- Select Hackathon --</option>
                                {hackathons.map(h => (
                                    <option key={h._id} value={h._id}>{h.title}</option>
                                ))}
                            </SelectField>
                        </div>
                    )}
                </header>


                {selectedHackathon && !myTeam && (
                    <div className="p-4 bg-[var(--color-warning-bg)] text-[var(--color-warning)] rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 flex items-center gap-2">
                        <AlertCircle size={20} />
                        You are not in a team for this hackathon. Please create or join a team first.
                    </div>
                )}

                {selectedHackathon && myTeam && (
                    <div className="space-y-6">
                        {rounds.map((round) => {
                            const sub = getSubmissionForRound(round.order); // Assuming round.order lines up
                            const isExpanded = activeRoundId === round._id;
                            const effectiveStatus = resolveEffectiveRoundStatus(round);
                            const isOpen = effectiveStatus === 'open';
                            const isScheduled = effectiveStatus === 'scheduled';
                            const isClosed = effectiveStatus === 'submission_closed' || effectiveStatus === 'judging' || effectiveStatus === 'published';

                            return (
                                <Card key={round._id} className={`overflow-hidden transition-all ${sub ? 'border-[var(--color-success)]/50' : ''} ${isExpanded ? 'ring-2 ring-[var(--color-primary)]/20 shadow-lg' : ''}`}>
                                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-[var(--color-bg-surface)]">
                                        <div className="mb-4 md:mb-0">
                                            <h3 className="text-heading-md text-[var(--color-text-primary)] mb-1">{round.name}</h3>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-body-sm text-[var(--color-text-secondary)]">Max Score: {round.maxScore}</p>
                                                {round.startTime && round.endTime && (
                                                    <div className="text-xs text-[var(--color-text-muted)] flex gap-4">
                                                        <span>Start: {new Date(round.startTime).toLocaleString()}</span>
                                                        <span>End: {new Date(round.endTime).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col md:flex-row items-end md:items-center gap-4">
                                            {sub ? (
                                                <div className="flex gap-2">
                                                    <Badge variant="success" className="px-3 py-1 text-sm flex items-center gap-1">
                                                        <CheckCircle size={14} /> Submitted (v{sub.version})
                                                    </Badge>
                                                    {sub.isLocked && <Badge variant="warning" className="px-2 py-1"><Lock size={12} /> Locked</Badge>}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <Badge variant={isOpen ? "primary" : (isScheduled ? "secondary" : "danger")} className="px-3 py-1 text-sm flex items-center gap-1">
                                                        {isOpen ? <WaitWrapper target={round.endTime} label="Closes in:" /> :
                                                            isScheduled ? <WaitWrapper target={round.startTime} label="Opens in:" /> :
                                                                <span className="flex items-center gap-1"><Lock size={12} /> Closed</span>}
                                                    </Badge>
                                                </div>
                                            )}
                                            {isLeader() && (
                                                <Button
                                                    variant={isExpanded ? "secondary" : (sub ? "outline" : "primary")}
                                                    size="sm"
                                                    disabled={!isOpen && !sub}
                                                    onClick={() => setActiveRoundId(isExpanded ? null : round._id)}
                                                    className="w-full md:w-auto"
                                                >
                                                    {isExpanded ? 'Close Form' : (sub ? `Update Submission (v${sub.version + 1})` : 'Submit Work')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submission Form area */}
                                    {isExpanded && (
                                        <div className="p-6 bg-[var(--color-bg-muted)]/30 border-t border-[var(--color-border-default)]">
                                            <CardContent>
                                                {/* Round Details */}
                                                <div className="mb-6 p-4 bg-[var(--color-bg-surface)] rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
                                                    <h4 className="text-[var(--color-primary)] font-bold mb-2 flex items-center gap-2">
                                                        <FileText size={18} /> Round Instructions
                                                    </h4>
                                                    {round.description && <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">{round.description}</p>}

                                                    {/* Lock Warning */}
                                                    {sub && sub.isLocked && (
                                                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded flex items-center gap-2">
                                                            <Lock size={16} />
                                                            <strong>Submission Locked.</strong> This round is closed for editing.
                                                        </div>
                                                    )}

                                                    {round.criteria && round.criteria.length > 0 && (
                                                        <div>
                                                            <h5 className="text-xs uppercase text-[var(--color-text-muted)] font-bold mb-2 tracking-wider">Assessment Criteria</h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {round.criteria.map((c, idx) => (
                                                                    <span key={idx} className="bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] text-xs px-2 py-1 rounded border border-[var(--color-border-default)]">
                                                                        {c.title} <span className="font-semibold text-[var(--color-primary)]">({c.maxMarks} pts)</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {message && <div className="mb-4 p-3 bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-[var(--radius-md)] border border-[var(--color-success)]/20">{message}</div>}
                                                {error && <div className="mb-4 p-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded-[var(--radius-md)] border border-[var(--color-danger)]/20">{error}</div>}

                                                <form onSubmit={handleSubmit} className="space-y-6">
                                                    {(round.submissionSchema && round.submissionSchema.length > 0) ? (
                                                        <div className="space-y-6">
                                                            {round.submissionSchema.map((field) => (
                                                                <div key={field.fieldKey}>
                                                                    {field.type === 'textarea' ? (
                                                                        <TextareaField
                                                                            label={field.label}
                                                                            name={field.fieldKey}
                                                                            value={formData[field.fieldKey] || ''}
                                                                            onChange={handleInputChange}
                                                                            placeholder={field.placeholder}
                                                                            required={field.required}
                                                                            helperText={field.helpText}
                                                                            className="h-32"
                                                                        />
                                                                    ) : field.type === 'file' || field.type === 'ppt' ? (
                                                                        <FileField
                                                                            label={field.label}
                                                                            name={field.fieldKey}
                                                                            onChange={handleFileChange}
                                                                            required={field.required && !sub?.submissionData?.[field.fieldKey]}
                                                                            helperText={formData[field.fieldKey] ? `Selected: ${formData[field.fieldKey].name}` : (field.helpText || "Upload file")}
                                                                        />
                                                                    ) : (
                                                                        <InputField
                                                                            label={field.label}
                                                                            type={field.type === 'video' || field.type === 'github' || field.type === 'url' ? 'url' : 'text'}
                                                                            name={field.fieldKey}
                                                                            value={formData[field.fieldKey] || ''}
                                                                            onChange={handleInputChange}
                                                                            placeholder={field.placeholder}
                                                                            required={field.required}
                                                                            helperText={field.helpText}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        // Legacy Fallback Form
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <InputField
                                                                    label="GitHub Repository URL"
                                                                    placeholder="https://github.com/..."
                                                                    name="githubUrl"
                                                                    value={formData.githubUrl || ''}
                                                                    onChange={handleInputChange}
                                                                    icon={Github}
                                                                />
                                                                <InputField
                                                                    label="Demo Video URL"
                                                                    placeholder="https://youtube.com/..."
                                                                    name="demoVideoUrl"
                                                                    value={formData.demoVideoUrl || ''}
                                                                    onChange={handleInputChange}
                                                                    icon={Youtube}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <FileField
                                                                    label="Presentation (PPT/PDF)"
                                                                    name="ppt"
                                                                    accept=".ppt,.pptx,.pdf"
                                                                    onChange={handleFileChange}
                                                                    helperText={formData.ppt ? `Selected: ${formData.ppt.name}` : "Upload your pitch deck"}
                                                                />
                                                                <FileField
                                                                    label="Additional Document"
                                                                    name="document"
                                                                    accept=".pdf,.doc,.docx,.zip"
                                                                    onChange={handleFileChange}
                                                                    helperText={formData.document ? `Selected: ${formData.document.name}` : "Upload documentation or report"}
                                                                />
                                                            </div>

                                                            <TextareaField
                                                                label="Submission Notes"
                                                                value={formData.notesText || ''}
                                                                name="notesText"
                                                                onChange={handleInputChange}
                                                                className="h-32"
                                                                placeholder="Describe your submission..."
                                                            />
                                                        </div>
                                                    )}

                                                    <Button
                                                        type="submit"
                                                        isLoading={loading}
                                                        disabled={sub?.isLocked}
                                                        className={`w-full font-bold py-3 rounded-[var(--radius-md)] shadow-lg 
                                                                ${sub?.isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-indigo-500/20 text-white'}`}
                                                        variant="primary"
                                                    >
                                                        {sub ? (sub.isLocked ? 'Locked' : 'Update Submission') : 'Submit Project'}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </div>
                                    )}

                                    {/* View Existing Submission */}
                                    {sub && !isExpanded && (
                                        <div className="p-6 border-t border-[var(--color-border-default)] bg-[var(--color-bg-muted)]/20">
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {round.submissionSchema && round.submissionSchema.length > 0 ? (
                                                    // Dynamic Rendering from Schema
                                                    round.submissionSchema.map((field) => {
                                                        const val = sub.submissionData?.[field.fieldKey];
                                                        if (!val) return null;

                                                        const isUrl = field.type === 'url' || field.type === 'github' || field.type === 'video';
                                                        const isFile = field.type === 'file' || field.type === 'ppt';

                                                        return (
                                                            <div key={field.fieldKey} className="flex items-center gap-2 mr-4 mb-2">
                                                                <span className="font-bold text-[var(--color-text-secondary)]">{field.label}:</span>
                                                                {isUrl ? (
                                                                    <a href={val} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                                                                        {field.type === 'github' ? <Github size={14} /> : field.type === 'video' ? <Youtube size={14} /> : <ExternalLink size={14} />}
                                                                        {val.length > 30 ? val.substring(0, 30) + '...' : val}
                                                                    </a>
                                                                ) : isFile ? (
                                                                    <a href={`${SERVER_URL}${val}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                                                                        <FileText size={14} /> View File
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-[var(--color-text-primary)]">{val}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    // Legacy Fallback View
                                                    <>
                                                        {sub.githubUrl && (
                                                            <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium">
                                                                <Github size={14} /> GitHub Repo
                                                            </a>
                                                        )}
                                                        {sub.demoVideoUrl && (
                                                            <a href={sub.demoVideoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium">
                                                                <Youtube size={14} /> Demo Video
                                                            </a>
                                                        )}
                                                        {sub.pptUrl && (
                                                            <a href={`${SERVER_URL}${sub.pptUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium">
                                                                <FileText size={14} /> View PPT
                                                            </a>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* AI Feedback */}
                                            {sub.aiScore && (
                                                <div className="mt-6 border-t border-[var(--color-border-default)] pt-6">
                                                    <AIFeedbackPanel aiScore={sub.aiScore} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Container>
        </div>
    );
}
