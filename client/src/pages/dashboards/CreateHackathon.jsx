
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/config';
import AuthContext from '../../context/AuthContext';
import { Trash2, AlertCircle, Plus, Edit3 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import TextareaField from '../../components/ui/TextareaField';
import SelectField from '../../components/ui/SelectField';
import Badge from '../../components/ui/Badge';
import { Grid, Section, Container } from '../../components/ui/Layout';

export default function CreateHackathon() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID for edit mode
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        theme: '',
        startDate: '',
        endDate: '',
    });

    const [rounds, setRounds] = useState([
        {
            name: 'Round 1',
            description: '',
            order: 1,
            weightagePercent: 100,
            maxScore: 100,
            startTime: '',
            endTime: '',
            autoTimeControlEnabled: true,
            criteria: [
                { title: 'Innovation', maxMarks: 50, description: '' },
                { title: 'Feasibility', maxMarks: 50, description: '' }
            ]
        }
    ]);

    // Fetch data if Edit Mode
    useEffect(() => {
        if (isEditMode) {
            const fetchHackathon = async () => {
                try {
                    const { data } = await api.get(`/hackathons/${id}`);

                    // Ownership check
                    if (data.createdBy?._id !== user?._id && data.createdBy !== user?._id) {
                        setError('You are not authorized to edit this hackathon. Only the creator can perform this action.');
                        setLoading(false);
                        return;
                    }

                    setFormData({
                        title: data.title,
                        description: data.description,
                        theme: data.theme,
                        // Format dates to YYYY-MM-DD
                        startDate: new Date(data.startDate).toISOString().split('T')[0],
                        endDate: new Date(data.endDate).toISOString().split('T')[0]
                    });
                    if (data.rounds && data.rounds.length > 0) {
                        setRounds(data.rounds);
                    }
                } catch (err) {
                    setError('Failed to fetch hackathon details');
                }
            };
            fetchHackathon();
        }
    }, [isEditMode, id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Round Management
    const addRound = () => {
        setRounds([
            ...rounds,
            {
                name: `Round ${rounds.length + 1}`,
                description: '',
                order: rounds.length + 1,
                weightagePercent: 0,
                maxScore: 100,
                startTime: '',
                endTime: '',
                autoTimeControlEnabled: true,
                criteria: [{ title: 'General', maxMarks: 100, description: '' }]
            }
        ]);
    };

    const updateRound = (index, field, value) => {
        const newRounds = [...rounds];
        newRounds[index][field] = value;
        setRounds(newRounds);
    };

    const removeRound = (index) => {
        if (rounds.length === 1) return;
        const newRounds = rounds.filter((_, i) => i !== index);
        setRounds(newRounds);
    };

    // Criteria Management
    const addCriteria = (roundIndex) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].criteria.push({ title: '', maxMarks: 0, description: '' });
        setRounds(newRounds);
    };

    const updateCriteria = (roundIndex, criteriaIndex, field, value) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].criteria[criteriaIndex][field] = value;

        // Auto-update maxScore based on criteria sum, if desired
        // For now, keeping them independent but could add logic here

        setRounds(newRounds);
    };

    const removeCriteria = (roundIndex, criteriaIndex) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].criteria = newRounds[roundIndex].criteria.filter((_, i) => i !== criteriaIndex);
        setRounds(newRounds);
    };

    // Submission Schema Management
    const addSchemaField = (roundIndex, type = 'text') => {
        const newRounds = [...rounds];
        if (!newRounds[roundIndex].submissionSchema) newRounds[roundIndex].submissionSchema = [];

        const presets = {
            ppt: { label: 'Presentation (PPT/PDF)', type: 'file', fieldKey: 'pptFile', helpText: 'Upload your pitch deck', required: true, allowedFileTypes: ['.ppt', '.pptx', '.pdf'] },
            github: { label: 'GitHub Repository', type: 'github', fieldKey: 'githubUrl', placeholder: 'https://github.com/...', required: true },
            video: { label: 'Demo Video', type: 'video', fieldKey: 'demoVideo', placeholder: 'https://youtube.com/...', helpText: 'Link to your project demo' },
            textarea: { label: 'Project Description', type: 'textarea', fieldKey: 'description', placeholder: 'Describe your project...', required: true },
            file: { label: 'Additional File', type: 'file', fieldKey: 'extraFile', helpText: 'Any other relevant files' }
        };

        const field = presets[type] || { fieldKey: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false };
        // Ensure fieldKey uniqueness within round
        if (newRounds[roundIndex].submissionSchema.some(f => f.fieldKey === field.fieldKey)) {
            field.fieldKey = `${field.fieldKey}_${Date.now()}`;
        }

        newRounds[roundIndex].submissionSchema.push(field);
        setRounds(newRounds);
    };

    const updateSchemaField = (roundIndex, fieldIndex, key, value) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].submissionSchema[fieldIndex][key] = value;
        setRounds(newRounds);
    };

    const removeSchemaField = (roundIndex, fieldIndex) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].submissionSchema = newRounds[roundIndex].submissionSchema.filter((_, i) => i !== fieldIndex);
        setRounds(newRounds);
    };

    // Calculations
    const totalWeightage = rounds.reduce((sum, r) => sum + Number(r.weightagePercent), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (totalWeightage !== 100) {
            setError(`Total weightage must be 100%. Current: ${totalWeightage}%`);
            return;
        }

        for (const round of rounds) {
            const criteriaSum = round.criteria.reduce((sum, c) => sum + Number(c.maxMarks), 0);
            if (criteriaSum !== Number(round.maxScore)) {
                setError(`Round "${round.name}" Max Score (${round.maxScore}) must equal sum of criteria marks (${criteriaSum})`);
                return;
            }
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };

            // Re-index rounds to ensure sequential, unique orders
            const sanitizedRounds = rounds.map((r, i) => ({
                ...r,
                order: i + 1
            }));

            const payload = {
                ...formData,
                rounds: sanitizedRounds
            };

            if (isEditMode) {
                await api.put(`/hackathons/${id}`, payload, config);
            } else {
                await api.post('/hackathons', payload, config);
            }

            navigate(isEditMode ? `/hackathon/${id}` : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save hackathon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] py-8">
            <Container>
                <header className="mb-8">
                    <h1 className="text-display-md text-[var(--color-text-primary)]">
                        {isEditMode ? 'Edit Hackathon' : 'Create New Hackathon'}
                    </h1>
                    <p className="text-body-md text-[var(--color-text-secondary)] mt-2">
                        {isEditMode ? 'Update event details and scoring.' : 'Design your event structure and scoring rubric.'}
                    </p>
                </header>

                {error && (
                    <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] px-4 py-3 rounded-[var(--radius-md)] mb-6 text-body-sm font-medium flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-heading-md text-[var(--color-text-primary)] flex items-center gap-2">
                                <Edit3 size={18} className="text-[var(--color-primary)]" /> Event Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <InputField
                                        label="Hackathon Title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. AI Innovation Challenge 2024"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <TextareaField
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="h-32"
                                        placeholder="Describe the event, goals, and expectations..."
                                        required
                                    />
                                </div>
                                <div>
                                    <InputField
                                        label="Theme"
                                        type="text"
                                        name="theme"
                                        value={formData.theme}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Sustainability, FinTech, Health"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Start Date"
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputField
                                        label="End Date"
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Rounds & Criteria */}
                    <Section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-heading-lg text-[var(--color-text-primary)]">Scoring Rounds</h2>
                            <Badge variant={totalWeightage === 100 ? 'success' : 'warning'}>
                                Total Weightage: {totalWeightage}%
                            </Badge>
                        </div>

                        {rounds.map((round, rIndex) => (
                            <Card key={rIndex} className="mb-6 border border-[var(--color-border-default)] hover:shadow-md transition-shadow">
                                <CardContent className="pt-6 relative">
                                    <Button
                                        variant="danger"
                                        size="xs"
                                        onClick={() => removeRound(rIndex)}
                                        className="absolute top-4 right-4"
                                        disabled={rounds.length === 1}
                                        type="button"
                                        title="Remove Round"
                                    >
                                        <Trash2 size={14} />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pr-8">
                                        <div className="col-span-1">
                                            <InputField
                                                label="Round Name"
                                                type="text"
                                                value={round.name}
                                                onChange={(e) => updateRound(rIndex, 'name', e.target.value)}
                                                placeholder="e.g. Round 1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <InputField
                                                label="Max Score"
                                                type="number"
                                                value={round.maxScore}
                                                onChange={(e) => updateRound(rIndex, 'maxScore', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <InputField
                                                label="Weightage (%)"
                                                type="number"
                                                value={round.weightagePercent}
                                                onChange={(e) => updateRound(rIndex, 'weightagePercent', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pr-8">
                                        <div className="col-span-1">
                                            <InputField
                                                label="Start Time"
                                                type="datetime-local"
                                                value={round.startTime ? new Date(round.startTime).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => updateRound(rIndex, 'startTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <InputField
                                                label="End Time"
                                                type="datetime-local"
                                                value={round.endTime ? new Date(round.endTime).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => updateRound(rIndex, 'endTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1 flex items-center pt-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={round.autoTimeControlEnabled !== false}
                                                    onChange={(e) => updateRound(rIndex, 'autoTimeControlEnabled', e.target.checked)}
                                                    className="w-4 h-4 text-[var(--color-primary)] rounded border-[var(--color-border-default)]"
                                                />
                                                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Auto-Open/Close</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Criteria List */}
                                    <div className="pl-4 border-l-2 border-[var(--color-border-default)] bg-[var(--color-bg-muted)]/30 rounded-r-lg p-4">
                                        <h4 className="text-body-sm font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider text-xs">Assessment Criteria</h4>
                                        {round.criteria.map((criteria, cIndex) => (
                                            <div key={cIndex} className="flex gap-4 mb-3 items-end">
                                                <div className="flex-grow">
                                                    <InputField
                                                        label={cIndex === 0 ? "Criteria Title" : ""}
                                                        type="text"
                                                        value={criteria.title}
                                                        onChange={(e) => updateCriteria(rIndex, cIndex, 'title', e.target.value)}
                                                        placeholder="e.g. Innovation"
                                                        className="bg-white"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <InputField
                                                        label={cIndex === 0 ? "Marks" : ""}
                                                        type="number"
                                                        value={criteria.maxMarks}
                                                        onChange={(e) => updateCriteria(rIndex, cIndex, 'maxMarks', e.target.value)}
                                                        className="bg-white"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCriteria(rIndex, cIndex)}
                                                    className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-2 mb-1 transition-colors"
                                                    title="Remove Criteria"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addCriteria(rIndex)}
                                            className="mt-2 text-[var(--color-primary)]"
                                            type="button"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Criteria
                                        </Button>

                                        {/* Round Validation Msg */}
                                        {round.maxScore != round.criteria.reduce((s, c) => s + Number(c.maxMarks), 0) && (
                                            <p className="text-caption text-[var(--color-warning)] mt-3 flex items-center gap-1 font-medium bg-[var(--color-warning)]/10 p-2 rounded">
                                                <AlertCircle size={14} />
                                                Sum of criteria marks ({round.criteria.reduce((s, c) => s + Number(c.maxMarks), 0)}) must match Round Max Score ({round.maxScore}).
                                            </p>
                                        )}

                                        {/* Scoring Configuration */}
                                        <div className="mt-6 pt-6 border-t border-[var(--color-border-default)]">
                                            <h4 className="text-body-sm font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider text-xs">Scoring Configuration</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <SelectField
                                                        label="Scoring Mode"
                                                        value={round.scoringMode || 'hybrid'}
                                                        onChange={(e) => updateRound(rIndex, 'scoringMode', e.target.value)}
                                                    >
                                                        <option value="hybrid">Hybrid (AI + Judge)</option>
                                                        <option value="judge_only">Judge Only</option>
                                                        <option value="ai_only">AI Only</option>
                                                    </SelectField>
                                                </div>

                                                {(round.scoringMode === 'hybrid' || !round.scoringMode) && (
                                                    <>
                                                        <div>
                                                            <InputField
                                                                label={`Judge Weight (${Math.round((round.judgeWeight || 0.7) * 100)}%)`}
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.1"
                                                                value={round.judgeWeight !== undefined ? round.judgeWeight : 0.7}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    updateRound(rIndex, 'judgeWeight', val);
                                                                    updateRound(rIndex, 'aiWeight', parseFloat((1 - val).toFixed(1)));
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <InputField
                                                                label={`AI Weight (${Math.round((round.aiWeight || 0.3) * 100)}%)`}
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.1"
                                                                value={round.aiWeight !== undefined ? round.aiWeight : 0.3}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    updateRound(rIndex, 'aiWeight', val);
                                                                    updateRound(rIndex, 'judgeWeight', parseFloat((1 - val).toFixed(1)));
                                                                }}
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {round.scoringMode === 'ai_only' && (
                                                    <div className="col-span-2 flex items-center text-sm text-[var(--color-text-secondary)] italic">
                                                        AI will determine 100% of the score based on criteria.
                                                    </div>
                                                )}

                                                {round.scoringMode === 'judge_only' && (
                                                    <div className="col-span-2 flex items-center text-sm text-[var(--color-text-secondary)] italic">
                                                        Judges will determine 100% of the score. AI insights may still be generated but won't affect the score.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submission Requirements Builder */}
                                    <div className="mt-8 pt-8 border-t border-[var(--color-border-default)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-body-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-xs">Submission Requirements</h4>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="xs" onClick={() => addSchemaField(rIndex, 'ppt')}>+ PPT</Button>
                                                <Button type="button" variant="outline" size="xs" onClick={() => addSchemaField(rIndex, 'github')}>+ GitHub</Button>
                                                <Button type="button" variant="outline" size="xs" onClick={() => addSchemaField(rIndex, 'video')}>+ Video</Button>
                                                <Button type="button" variant="outline" size="xs" onClick={() => addSchemaField(rIndex, 'textarea')}>+ Textarea</Button>
                                                <Button type="button" variant="outline" size="xs" onClick={() => addSchemaField(rIndex, 'file')}>+ File</Button>
                                            </div>
                                        </div>

                                        {(round.submissionSchema || []).length === 0 ? (
                                            <div className="bg-[var(--color-bg-muted)]/50 p-6 rounded-lg text-center border border-dashed border-[var(--color-border-default)]">
                                                <p className="text-body-sm text-[var(--color-text-muted)]">No submission fields defined. Defaulting to PPT and GitHub.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {(round.submissionSchema || []).map((field, fIndex) => (
                                                    <div key={fIndex} className="bg-white p-4 rounded-lg border border-[var(--color-border-default)] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                                        <div className="md:col-span-3">
                                                            <InputField
                                                                label="Field Label"
                                                                value={field.label}
                                                                onChange={(e) => updateSchemaField(rIndex, fIndex, 'label', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <SelectField
                                                                label="Type"
                                                                value={field.type}
                                                                onChange={(e) => updateSchemaField(rIndex, fIndex, 'type', e.target.value)}
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="textarea">Textarea</option>
                                                                <option value="file">File</option>
                                                                <option value="url">URL</option>
                                                                <option value="github">GitHub Repo</option>
                                                                <option value="video">Demo Video</option>
                                                            </SelectField>
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <InputField
                                                                label="Unique Key"
                                                                value={field.fieldKey}
                                                                onChange={(e) => updateSchemaField(rIndex, fIndex, 'fieldKey', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="md:col-span-1 flex items-center h-full pt-6">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.required}
                                                                    onChange={(e) => updateSchemaField(rIndex, fIndex, 'required', e.target.checked)}
                                                                    className="w-4 h-4 text-[var(--color-primary)] rounded border-[var(--color-border-default)]"
                                                                />
                                                                <span className="text-xs font-bold text-[var(--color-text-secondary)]">Required</span>
                                                            </label>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <InputField
                                                                label="Help Text"
                                                                value={field.helpText || ''}
                                                                onChange={(e) => updateSchemaField(rIndex, fIndex, 'helpText', e.target.value)}
                                                                placeholder="Guidance for users..."
                                                            />
                                                        </div>
                                                        <div className="md:col-span-1 flex justify-end">
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSchemaField(rIndex, fIndex)} className="text-red-500 hover:bg-red-50">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            variant="secondary"
                            onClick={addRound}
                            className="w-full py-3 border-dashed border-2 border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all justify-center"
                            type="button"
                        >
                            <Plus size={18} className="mr-2" /> Add Another Round
                        </Button>
                    </Section>

                    <div className="flex justify-end pt-6 border-t border-[var(--color-border-default)] gap-4 sticky bottom-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-md p-4 z-10">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={loading}
                            size="lg"
                            className="shadow-lg shadow-indigo-200"
                        >
                            {isEditMode ? 'Update Hackathon' : 'Create Hackathon'}
                        </Button>
                    </div>
                </form>
            </Container>
        </div>
    );
}
