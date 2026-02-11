
import React, { useState, useEffect } from 'react';
import api from '../../api/config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Youtube, FileText, Save, Layout, Lock, Shield } from 'lucide-react';

import AIFeedbackPanel from '../../components/AIFeedbackPanel';
import ScoreSlider from '../../components/ui/ScoreSlider';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardTitle } from '../../components/ui/Card';
import TextareaField from '../../components/ui/TextareaField';
import Badge from '../../components/ui/Badge';
import { Container, Grid } from '../../components/ui/Layout';
import { useAuth } from '../../context/AuthContext';


export default function JudgeEvaluation() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Config Base URL for Assets
    const SERVER_URL = (api.defaults.baseURL || '').replace('/api', '');

    const [submission, setSubmission] = useState(null);
    const [hackathon, setHackathon] = useState(null);
    const [criteria, setCriteria] = useState([]);
    const [scores, setScores] = useState({}); // { criteriaId: { marks: 0, comment: '' } }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingEvaluation, setExistingEvaluation] = useState(null);

    useEffect(() => {
        fetchData();
    }, [submissionId]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

            // Fetch submission details (using a dedicated endpoint if available, but mirroring previous logic for robustness)
            // Ideally: GET /api/submissions/:id
            const subRes = await api.get(`/submissions/${submissionId}`, config);
            setSubmission(subRes.data);

            const hRes = await api.get(`/hackathons/${subRes.data.hackathon}`, config);
            setHackathon(hRes.data);

            const round = hRes.data.rounds.find(r => r.order === subRes.data.roundIndex);
            setCriteria(round ? round.criteria : []);

            // Initialize scores
            const initialScores = {};
            round?.criteria.forEach(c => {
                initialScores[c._id] = { marks: 0, comment: '' };
            });
            setScores(initialScores);

            // Check for existing evaluation
            const evalRes = await api.get(`/evaluations/submission/${submissionId}?hackathonId=${subRes.data.hackathon}`, config);
            if (evalRes.data) {
                setExistingEvaluation(evalRes.data);
                // Populate form
                const newScores = {};
                evalRes.data.scores.forEach(s => {
                    newScores[s.criteriaId] = { marks: s.givenMarks, comment: s.comment };
                });
                setScores(newScores);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (criteriaId, field, value) => {
        setScores(prev => ({
            ...prev,
            [criteriaId]: {
                ...prev[criteriaId],
                [field]: value
            }
        }));
    };

    const calculateTotal = () => {
        let total = 0;
        Object.values(scores).forEach(s => {
            total += Number(s.marks) || 0;
        });
        return total;
    };

    const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxMarks, 0);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const payload = {
                submissionId,
                hackathonId: hackathon._id, // Required for middleware guard
                scores: Object.entries(scores).map(([id, val]) => ({
                    criteriaId: id,
                    givenMarks: Number(val.marks),
                    comment: val.comment
                })),
                comments: 'Evaluated via Web'
            };

            await api.post('/evaluations/submit', payload, config);
            // alert('Evaluation saved!'); // Replace with better toast if available, or just navigate
            navigate(-1);
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving evaluation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-text-muted)] animate-pulse">Loading evaluation data...</div>
        </div>
    );
    if (!submission || !hackathon) return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
            <div className="text-[var(--color-danger)]">Error loading data.</div>
        </div>
    );

    // Guard: Check round status
    const round = hackathon.rounds.find(r => r.order === submission.roundIndex);
    if (round && round.status !== 'judging') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-display-sm text-[var(--color-text-primary)] mb-2">Round Not Open for Judging</h1>
                    <p className="text-body-md text-[var(--color-text-secondary)] mb-6">
                        This round is currently in <strong>{round.status}</strong> status. Evaluation is only allowed when status is <strong>judging</strong>.
                    </p>
                    <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    // Guard: Check Scoring Mode
    if (round && round.scoringMode === 'ai_only') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="bg-[var(--color-info-bg)] text-[var(--color-info)] p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🤖</span>
                    </div>
                    <h1 className="text-display-sm text-[var(--color-text-primary)] mb-2">AI-Only Evaluation</h1>
                    <p className="text-body-md text-[var(--color-text-secondary)] mb-6">
                        This round is evaluated exclusively by AI based on the submission criteria. Manual judging is not required.
                    </p>
                    <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    // Guard: Check Assignment (Frontend)
    // Handle both populated objects and ID strings
    const isAssigned = hackathon.judges.some(j => {
        const jId = typeof j === 'string' ? j : j._id;
        return jId === user?._id;
    });

    if (!isAssigned) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] p-8 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-display-sm text-[var(--color-text-primary)] mb-2">Access Denied</h1>
                    <p className="text-body-md text-[var(--color-text-secondary)] mb-6">
                        You are not an assigned judge for this hackathon. Please contact the organizer if you believe this is an error.
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/dashboard/judge')}>Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container className="pt-8 pb-32">
                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-[var(--color-bg-primary)]/80 backdrop-blur-md py-4 border-b border-[var(--color-border-default)]">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="pl-0">
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-hearing-md font-bold text-[var(--color-text-primary)] leading-tight flex items-center gap-2">
                                Evaluating: <span className="text-[var(--color-primary)]">{submission.team?.name}</span>
                            </h1>
                            <p className="text-xs text-[var(--color-text-secondary)]">{hackathon.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Score</div>
                            <div className="text-xl font-bold text-[var(--color-primary)]">
                                {calculateTotal()} <span className="text-[var(--color-text-muted)] text-sm">/ {maxTotalScore}</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            variant="primary"
                            className="shadow-lg shadow-indigo-500/20"
                            isLoading={submitting}
                        >
                            <Save size={18} className="mr-2" />
                            {existingEvaluation ? 'Update' : 'Submit'}
                        </Button>
                    </div>
                </header>

                <Grid cols={1} mdCols={2} className="gap-8">

                    {/* LEFT COLUMN: Assets & Context */}
                    <div className="space-y-8">
                        {/* Project Assets Card */}
                        <Card>
                            <CardContent>
                                <div className="mb-6">
                                    <h2 className="text-heading-md text-[var(--color-text-primary)]">Project Assets</h2>
                                    <p className="text-body-sm text-[var(--color-text-secondary)]">Review the submission materials below.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {submission.githubUrl && (
                                        <a href={submission.githubUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] transition-colors group">
                                            <Github size={24} className="text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]" />
                                            <div>
                                                <div className="font-semibold text-[var(--color-text-primary)]">GitHub Repo</div>
                                                <div className="text-xs text-[var(--color-text-muted)] font-mono mt-1 truncate max-w-[200px]">{submission.githubUrl}</div>
                                            </div>
                                            <ExternalLink size={16} className="ml-auto text-[var(--color-text-muted)]" />
                                        </a>
                                    )}
                                    {submission.demoVideoUrl && (
                                        <a href={submission.demoVideoUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-danger)] hover:bg-[var(--color-bg-muted)] transition-colors group">
                                            <Youtube size={24} className="text-[var(--color-danger)]" />
                                            <div>
                                                <div className="font-semibold text-[var(--color-text-primary)]">Demo Video</div>
                                                <div className="text-xs text-[var(--color-text-muted)] mt-1">Watch Walkthrough</div>
                                            </div>
                                            <ExternalLink size={16} className="ml-auto text-[var(--color-text-muted)]" />
                                        </a>
                                    )}
                                    {submission.pptUrl && (
                                        <a href={`${SERVER_URL}${submission.pptUrl}`} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-warning)] hover:bg-[var(--color-bg-muted)] transition-colors group">
                                            <Layout size={24} className="text-[var(--color-warning)]" />
                                            <div>
                                                <div className="font-semibold text-[var(--color-text-primary)]">Presentation</div>
                                                <div className="text-xs text-[var(--color-text-muted)] mt-1">View Slides</div>
                                            </div>
                                            <ExternalLink size={16} className="ml-auto text-[var(--color-text-muted)]" />
                                        </a>
                                    )}
                                    {submission.documentUrl && (
                                        <a href={`${SERVER_URL}${submission.documentUrl}`} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-info)] hover:bg-[var(--color-bg-muted)] transition-colors group">
                                            <FileText size={24} className="text-[var(--color-info)]" />
                                            <div>
                                                <div className="font-semibold text-[var(--color-text-primary)]">Document</div>
                                                <div className="text-xs text-[var(--color-text-muted)] mt-1">Read Report</div>
                                            </div>
                                            <ExternalLink size={16} className="ml-auto text-[var(--color-text-muted)]" />
                                        </a>
                                    )}
                                </div>

                                {/* Notes */}
                                {submission.notesText && (
                                    <div className="mt-6 p-4 bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-sm text-[var(--color-text-secondary)] italic">
                                        <strong className="block mb-1 text-[var(--color-text-primary)] font-semibold not-italic">Team Notes:</strong>
                                        {submission.notesText}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Feedback */}
                        {submission.aiScore && (
                            <Card className="overflow-hidden">
                                <div className="p-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)]/50">
                                    <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                        ✨ AI Analysis
                                    </h3>
                                </div>
                                <div className="p-0">
                                    <AIFeedbackPanel aiScore={submission.aiScore} />
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Scoring Form */}
                    <div className="space-y-6">
                        <Card className="sticky top-40 max-h-[calc(100vh-180px)] overflow-y-auto border-t-4 border-t-[var(--color-primary)]">
                            <CardContent>
                                <div className="mb-6">
                                    <h2 className="text-heading-md text-[var(--color-text-primary)]">Scoring Criteria</h2>
                                    <p className="text-body-sm text-[var(--color-text-secondary)]">Rate each criteria based on performance.</p>
                                </div>

                                <div className="space-y-8 pb-8">
                                    {criteria.map((c, index) => (
                                        <div key={c._id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <label className="font-bold text-[var(--color-text-primary)] text-lg">{c.title}</label>
                                                <Badge variant="outline" className="text-xs">Max: {c.maxMarks}</Badge>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-secondary)] mb-4 bg-[var(--color-bg-muted)]/50 p-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)]">{c.description}</p>

                                            <div className="mb-4">
                                                <ScoreSlider
                                                    value={scores[c._id]?.marks || 0}
                                                    max={c.maxMarks}
                                                    onChange={(val) => handleScoreChange(c._id, 'marks', val)}
                                                />
                                            </div>

                                            <TextareaField
                                                value={scores[c._id]?.comment}
                                                onChange={(e) => handleScoreChange(c._id, 'comment', e.target.value)}
                                                placeholder="Add specific feedback..."
                                                className="h-20 text-sm"
                                            />

                                            {index < criteria.length - 1 && <div className="w-full h-px bg-[var(--color-border-default)] mt-8" />}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </Grid>
            </Container>
        </div>
    );
}
