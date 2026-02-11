
import React, { useState, useEffect, useContext } from 'react';
import api, { SERVER_URL } from '../../api/config';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import PlatformTable from '../../components/ui/PlatformTable';
import Button from '../../components/ui/Button';
import SelectField from '../../components/ui/SelectField';
import Card, { CardTitle } from '../../components/ui/Card';
import { Container } from '../../components/ui/Layout';
import { ArrowLeft, Github, Youtube, FileText, ExternalLink } from 'lucide-react';
import Badge from '../../components/ui/Badge';

export default function SubmissionReview() {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState(hackathonId || '');
    const [rounds, setRounds] = useState([]);
    const [selectedRound, setSelectedRound] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHackathons();
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            // Find hackathon object to get rounds
            const h = hackathons.find(x => x._id === selectedHackathon);
            if (h) {
                setRounds(h.rounds || []);
                if (h.rounds.length > 0) setSelectedRound(h.rounds[0].order);
            }
        }
    }, [selectedHackathon, hackathons]);

    useEffect(() => {
        if (selectedHackathon && selectedRound !== '') {
            fetchSubmissions();
        }
    }, [selectedHackathon, selectedRound]);

    const fetchHackathons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            // If judge, fetch only assigned. If organizer, fetch all (or createdBy which getHackathons might not default to without params, but getHackathons is public currently? No, it's public.
            // Organizer dashboard usually lists THEIR hackathons. 
            // SubmissionReview was fetching ALL public hackathons.
            // Improve: Fetch based on role.
            let url = '/hackathons';
            if (user?.role === 'judge') {
                url = '/hackathons/judge/my';
            } else if (user?.role === 'organizer') {
                // Ideally fetching organizer's own events, but public list is okay if they filter.
                // Assuming standard list for now.
            }

            const res = await api.get(url, config);
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setHackathons(data);

            // If ID in param, select it. Else select first.
            if (hackathonId) {
                setSelectedHackathon(hackathonId);
            } else if (!selectedHackathon && data.length > 0) {
                setSelectedHackathon(data[0]._id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await api.get(`/submissions/hackathon/${selectedHackathon}/round/${selectedRound}`, config);
            setSubmissions(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Container className="pt-8 pb-32">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="pl-0 mb-2">
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Button>
                        <h1 className="text-display-md text-[var(--color-text-primary)]">Submission Review</h1>
                    </div>
                </header>

                {/* Filters */}
                <Card className="mb-8">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField
                            label="Hackathon"
                            value={selectedHackathon}
                            onChange={(e) => setSelectedHackathon(e.target.value)}
                        >
                            {hackathons.map(h => <option key={h._id} value={h._id}>{h.title}</option>)}
                        </SelectField>
                        <SelectField
                            label="Round"
                            value={selectedRound}
                            onChange={(e) => setSelectedRound(e.target.value)}
                        >
                            {rounds.map(r => <option key={r.order} value={r.order}>{r.name}</option>)}
                        </SelectField>
                    </div>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden">
                    <PlatformTable
                        headers={[
                            { label: 'Team', key: 'team.name', sortable: true },
                            { label: 'Submitted By', key: 'submittedBy.name' },
                            { label: 'Time', key: 'submittedAt', sortable: true },
                            { label: 'Submission Content', key: 'content' },
                            { label: 'Actions', key: 'actions' }
                        ]}
                        data={submissions}
                        renderRow={(sub) => (
                            <tr key={sub._id} className="hover:bg-[var(--color-bg-muted)]/50 transition-colors border-b border-[var(--color-border-default)] last:border-0 text-sm">
                                <td className="p-4">
                                    <div className="font-bold text-[var(--color-text-primary)]">{sub.team?.name}</div>
                                    <div className="text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-1 py-0.5 rounded inline-block mt-1">{sub.team?.teamCode}</div>
                                </td>
                                <td className="p-4 text-[var(--color-text-secondary)]">{sub.submittedBy?.name}</td>
                                <td className="p-4 text-[var(--color-text-muted)]">{new Date(sub.submittedAt).toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {rounds.find(r => r.order === selectedRound)?.submissionSchema?.length > 0 ? (
                                            rounds.find(r => r.order === selectedRound).submissionSchema.map(field => {
                                                const val = sub.submissionData?.[field.fieldKey];
                                                if (!val) return null;
                                                const isUrl = field.type === 'url' || field.type === 'github' || field.type === 'video';

                                                return isUrl ? (
                                                    <a key={field.fieldKey} href={val} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline text-xs flex items-center gap-1" title={field.label}>
                                                        {field.type === 'github' ? <Github size={14} /> : field.type === 'video' ? <Youtube size={14} /> : <ExternalLink size={14} />} {field.label}
                                                    </a>
                                                ) : field.type === 'file' || field.type === 'ppt' ? (
                                                    <a key={field.fieldKey} href={`${SERVER_URL}${val}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-[var(--color-bg-muted)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-primary)] px-2 py-1 rounded border border-[var(--color-border-default)] transition-colors">
                                                        <FileText size={12} /> {field.label}
                                                    </a>
                                                ) : (
                                                    <span key={field.fieldKey} className="text-xs bg-gray-100 px-1 rounded" title={field.label}>{field.label}: {val}</span>
                                                );
                                            })
                                        ) : (
                                            // Legacy Fallback
                                            <>
                                                {sub.githubUrl && <a href={sub.githubUrl} target="_blank" rel="noreferrer"><Github size={16} /></a>}
                                                {sub.demoVideoUrl && <a href={sub.demoVideoUrl} target="_blank" rel="noreferrer"><Youtube size={16} /></a>}
                                                {sub.pptUrl && <a href={`${SERVER_URL}${sub.pptUrl}`} target="_blank" rel="noreferrer" className="text-xs"><FileText size={14} /> PPT</a>}
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => { /* Detail View Logic */ }} className="text-xs h-8">View</Button>
                                        {user?.role === 'judge' && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => navigate(`/dashboard/judge/evaluate/${sub._id}`)}
                                                className="text-xs h-8"
                                            >
                                                Evaluate
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    />
                </Card>
            </Container>
        </div>
    );
}
