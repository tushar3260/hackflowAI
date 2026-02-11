
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, typography, spacing, borderRadius } from '../theme';
import { FileText, Youtube, Github, Link, Upload, CheckCircle, Lock, Clock } from 'lucide-react-native';

const SubmissionScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const { hackathonId } = route.params || {};

    const [hackathon, setHackathon] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [activeRoundId, setActiveRoundId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({});
    const [formFiles, setFormFiles] = useState({});

    useEffect(() => {
        if (hackathonId) {
            loadData();
        }
    }, [hackathonId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [hackRes, teamRes, subRes] = await Promise.all([
                api.get(`/hackathons/${hackathonId}`),
                api.get(`/teams/my?hackathonId=${hackathonId}`),
                api.get('/submissions/my')
            ]);

            setHackathon(hackRes.data);
            setRounds(hackRes.data.rounds || []);

            const team = teamRes.data.find(t => t.hackathon._id === hackathonId || t.hackathon === hackathonId);
            setMyTeam(team);

            const subs = subRes.data.filter(s => {
                const hId = s.hackathon?._id || s.hackathon;
                return hId === hackathonId;
            });
            setSubmissions(subs);

            // Auto expand first open round or first round
            if (hackRes.data.rounds?.length > 0) {
                const openRound = hackRes.data.rounds.find(r => resolveStatus(r) === 'open');
                setActiveRoundId(openRound ? openRound._id : hackRes.data.rounds[0]._id);
            }

        } catch (e) {
            console.log('Error loading submission data', e);
            Alert.alert('Error', 'Failed to load submission data');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const resolveStatus = (round) => {
        // Simplistic status resolution matching web logic roughly
        if (round.autoTimeControlEnabled === false) return round.status;
        const now = new Date();
        if (new Date(round.startTime) > now) return 'scheduled';
        if (new Date(round.endTime) < now) return 'closed';
        return 'open';
    };

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFilePick = async (key) => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all types for now, restrict if needed
                copyToCacheDirectory: true
            });

            if (!res.canceled && res.assets && res.assets.length > 0) {
                const file = res.assets[0];
                setFormFiles(prev => ({ ...prev, [key]: file }));
            }
        } catch (e) {
            console.log('File pick error', e);
        }
    };

    const getEffectiveSubmission = (roundOrder) => {
        return submissions.find(s => s.roundIndex === roundOrder);
    };

    const handleSubmit = async (round) => {
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('hackathonId', hackathonId);
            data.append('roundIndex', round.order.toString());

            // Dynamic Schema
            if (round.submissionSchema && round.submissionSchema.length > 0) {
                round.submissionSchema.forEach(field => {
                    if (field.type === 'file' || field.type === 'ppt') {
                        const file = formFiles[field.fieldKey];
                        if (file) {
                            data.append(field.fieldKey, {
                                uri: file.uri,
                                name: file.name,
                                type: file.mimeType || 'application/octet-stream'
                            });
                        }
                    } else {
                        if (formData[field.fieldKey]) {
                            data.append(field.fieldKey, formData[field.fieldKey]);
                        }
                    }
                });
            } else {
                // Legacy Fallback
                if (formData.notesText) data.append('notesText', formData.notesText);
                if (formData.githubUrl) data.append('githubUrl', formData.githubUrl);
                if (formData.demoVideoUrl) data.append('demoVideoUrl', formData.demoVideoUrl);

                if (formFiles.ppt) {
                    const f = formFiles.ppt;
                    data.append('ppt', { uri: f.uri, name: f.name, type: f.mimeType });
                }
                if (formFiles.document) {
                    const f = formFiles.document;
                    data.append('document', { uri: f.uri, name: f.name, type: f.mimeType });
                }
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };

            await api.post('/submissions/submit', data, config);
            Alert.alert('Success', 'Submission uploaded successfully!');
            setFormData({});
            setFormFiles({});
            loadData(); // Refresh

        } catch (e) {
            console.log('Submit error', e);
            Alert.alert('Error', e.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Layout><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} /></Layout>;
    }

    if (!myTeam) {
        return (
            <Layout>
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>You must be part of a team to submit.</Text>
                    <Button title="Go to Teams" onPress={() => navigation.navigate('MyTeams')} style={{ marginTop: 16 }} />
                </View>
            </Layout>
        );
    }

    return (
        <Layout scrollable>
            <View style={styles.header}>
                <Text style={styles.title}>Submissions</Text>
                <Text style={styles.subtitle}>{hackathon?.title}</Text>
            </View>

            <View style={styles.roundsContainer}>
                {rounds.map(round => {
                    const status = resolveStatus(round);
                    const isOpen = status === 'open';
                    const isExpanded = activeRoundId === round._id;
                    const sub = getEffectiveSubmission(round.order);

                    return (
                        <Card key={round._id} style={[styles.roundCard, isExpanded && styles.activeRoundCard]}>
                            <TouchableOpacity
                                style={styles.roundHeader}
                                onPress={() => setActiveRoundId(isExpanded ? null : round._id)}
                            >
                                <View>
                                    <Text style={styles.roundTitle}>{round.name}</Text>
                                    <Text style={styles.roundStatus}>
                                        {status.toUpperCase()} • Max Score: {round.maxScore}
                                    </Text>
                                </View>
                                <View>
                                    {sub ? (
                                        <CheckCircle size={20} color={colors.success} />
                                    ) : (
                                        isOpen ? <Upload size={20} color={colors.primary} /> : <Lock size={20} color={colors.textMuted} />
                                    )}
                                </View>
                            </TouchableOpacity>

                            {isExpanded && (
                                <CardContent style={styles.roundContent}>
                                    {round.description ? <Text style={styles.description}>{round.description}</Text> : null}

                                    {sub && (
                                        <View style={styles.submittedBadge}>
                                            <Text style={styles.submittedText}>
                                                Submitted (v{sub.version})
                                                {sub.isLocked && ' • Locked'}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Form */}
                                    {isOpen && (!sub?.isLocked) && (
                                        <View style={styles.formContainer}>
                                            {round.submissionSchema && round.submissionSchema.length > 0 ? (
                                                // Dynamic
                                                round.submissionSchema.map((field, idx) => (
                                                    <View key={idx} style={styles.fieldContainer}>
                                                        {field.type === 'file' || field.type === 'ppt' ? (
                                                            <View>
                                                                <Text style={styles.label}>{field.label}</Text>
                                                                <TouchableOpacity
                                                                    style={styles.fileButton}
                                                                    onPress={() => handleFilePick(field.fieldKey)}
                                                                >
                                                                    <FileText size={20} color={colors.textSecondary} />
                                                                    <Text style={styles.fileButtonText}>
                                                                        {formFiles[field.fieldKey]?.name || 'Select File'}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            <Input
                                                                label={field.label}
                                                                placeholder={field.placeholder}
                                                                value={formData[field.fieldKey] || ''}
                                                                onChangeText={text => handleInputChange(field.fieldKey, text)}
                                                            />
                                                        )}
                                                    </View>
                                                ))
                                            ) : (
                                                // Legacy
                                                <View>
                                                    <Input
                                                        label="GitHub URL"
                                                        placeholder="https://github.com/..."
                                                        value={formData.githubUrl}
                                                        onChangeText={text => handleInputChange('githubUrl', text)}
                                                    />
                                                    <Input
                                                        label="Demo Video URL"
                                                        placeholder="https://youtube.com/..."
                                                        value={formData.demoVideoUrl}
                                                        onChangeText={text => handleInputChange('demoVideoUrl', text)}
                                                    />
                                                    <Input
                                                        label="Notes"
                                                        placeholder="Describe your project..."
                                                        value={formData.notesText}
                                                        onChangeText={text => handleInputChange('notesText', text)}
                                                        multiline
                                                    />
                                                </View>
                                            )}

                                            <Button
                                                title={sub ? "Update Submission" : "Submit"}
                                                onPress={() => handleSubmit(round)}
                                                isLoading={submitting}
                                                style={styles.submitButton}
                                            />
                                        </View>
                                    )}

                                    {!isOpen && !sub && (
                                        <Text style={styles.closedText}>Submissions are closed for this round.</Text>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.size.md,
        color: colors.primary,
    },
    roundsContainer: {
        gap: spacing.md,
    },
    roundCard: {
        marginBottom: 0,
    },
    activeRoundCard: {
        borderColor: colors.primary,
        borderWidth: 1,
    },
    roundHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    roundTitle: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    roundStatus: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    roundContent: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    description: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    submittedBadge: {
        backgroundColor: colors.success + '20',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.md,
    },
    submittedText: {
        color: colors.success,
        fontWeight: 'bold',
        fontSize: typography.size.sm,
    },
    formContainer: {
        gap: spacing.md,
    },
    fieldContainer: {
        marginBottom: spacing.sm,
    },
    label: {
        marginBottom: 6,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
    },
    fileButtonText: {
        color: colors.textPrimary,
    },
    submitButton: {
        marginTop: spacing.sm,
    },
    closedText: {
        color: colors.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: spacing.md,
    },
    warningContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    warningText: {
        fontSize: typography.size.lg,
        color: colors.warning,
        marginBottom: spacing.md,
        textAlign: 'center',
    }

});

export default SubmissionScreen;
