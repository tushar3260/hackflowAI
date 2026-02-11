
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Linking, TouchableOpacity } from 'react-native';
import api, { SERVER_URL } from '../api/config';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, typography, spacing, borderRadius } from '../theme';
import { ExternalLink, Github, Youtube, FileText } from 'lucide-react-native';

const JudgingScreen = ({ route, navigation }) => {
    const { submissionId, roundId } = route.params;
    const [submission, setSubmission] = useState(null);
    const [round, setRound] = useState(null);
    const [scores, setScores] = useState({});
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch submission details and round criteria
            // In MVP backend, we might need separate calls or a specific judging endpoint
            // Assuming GET /judging/submission/:id returns details + criteria
            const res = await api.get(`/judging/submission/${submissionId}?roundId=${roundId}`);
            setSubmission(res.data.submission);
            setRound(res.data.round);

            // Initialize scores
            const initialScores = {};
            res.data.round.criteria.forEach(c => {
                initialScores[c._id] = '';
            });
            setScores(initialScores);

        } catch (e) {
            console.log('Error fetching judging data', e);
            Alert.alert('Error', 'Failed to load data');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (criteriaId, value) => {
        // Validate max score
        const criterion = round.criteria.find(c => c._id === criteriaId);
        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= criterion.maxMarks)) {
            setScores(prev => ({ ...prev, [criteriaId]: value }));
        }
    };

    const submitEvaluation = async () => {
        setSubmitting(true);
        try {
            // Prepare payload
            const marks = Object.entries(scores).map(([criteriaId, score]) => ({
                criteriaId,
                score: parseFloat(score) || 0
            }));

            await api.post('/judging/submit', {
                submissionId,
                roundId,
                marks,
                feedback
            });

            Alert.alert('Success', 'Evaluation submitted!');
            navigation.goBack();

        } catch (e) {
            console.log('Error submitting evaluation', e);
            Alert.alert('Error', 'Failed to submit evaluation');
        } finally {
            setSubmitting(false);
        }
    };

    const openLink = (url) => {
        if (url) Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };


    if (loading) return <Layout><Text>Loading...</Text></Layout>;
    if (!submission || !round) return <Layout><Text>Error loading data</Text></Layout>;

    return (
        <Layout scrollable>
            <View style={styles.header}>
                <Text style={styles.title}>Evaluate Submission</Text>
                <Text style={styles.subtitle}>{submission.team?.name}</Text>
            </View>

            {/* Submission Details */}
            <Card style={styles.card}>
                <CardContent>
                    <Text style={styles.sectionTitle}>Submission Links</Text>
                    <View style={styles.linksContainer}>
                        {submission.githubUrl ? (
                            <TouchableOpacity onPress={() => openLink(submission.githubUrl)} style={styles.linkButton}>
                                <Github size={16} color={colors.primary} />
                                <Text style={styles.linkText}>GitHub Repo</Text>
                            </TouchableOpacity>
                        ) : null}
                        {submission.demoVideoUrl ? (
                            <TouchableOpacity onPress={() => openLink(submission.demoVideoUrl)} style={styles.linkButton}>
                                <Youtube size={16} color={colors.danger} />
                                <Text style={styles.linkText}>Demo Video</Text>
                            </TouchableOpacity>
                        ) : null}
                        {submission.pptUrl ? (
                            <TouchableOpacity onPress={() => openLink(SERVER_URL + submission.pptUrl)} style={styles.linkButton}>
                                <FileText size={16} color={colors.warning} />
                                <Text style={styles.linkText}>Presentation</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {submission.notesText ? (
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.label}>Notes</Text>
                            <Text style={styles.text}>{submission.notesText}</Text>
                        </View>
                    ) : null}

                    {/* Dynamic Fields Display */}
                    {round.submissionSchema?.map(field => {
                        const val = submission.submissionData?.[field.fieldKey];
                        if (!val) return null;

                        return (
                            <View key={field.fieldKey} style={{ marginTop: 12 }}>
                                <Text style={styles.label}>{field.label}</Text>
                                {field.type === 'file' || field.type === 'ppt' ? (
                                    <TouchableOpacity onPress={() => openLink(SERVER_URL + val)}>
                                        <Text style={[styles.text, { color: colors.primary }]}>View File</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.text}>{val}</Text>
                                )}
                            </View>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Scoring Form */}
            <Card style={styles.card}>
                <CardContent>
                    <Text style={styles.sectionTitle}>Scoring</Text>

                    {round.criteria.map(c => (
                        <View key={c._id} style={styles.criteriaContainer}>
                            <View style={styles.criteriaHeader}>
                                <Text style={styles.criteriaTitle}>{c.title}</Text>
                                <Text style={styles.criteriaMax}>(Max: {c.maxMarks})</Text>
                            </View>
                            <Input
                                placeholder="Score"
                                keyboardType="numeric"
                                value={scores[c._id]?.toString()}
                                onChangeText={text => handleScoreChange(c._id, text)}
                            />
                        </View>
                    ))}

                    <Input
                        label="Feedback (Optional)"
                        placeholder="Constructive feedback for the team..."
                        multiline
                        value={feedback}
                        onChangeText={setFeedback}
                        style={styles.feedbackInput}
                    />

                    <Button
                        title="Submit Evaluation"
                        onPress={submitEvaluation}
                        isLoading={submitting}
                        style={{ marginTop: 16 }}
                    />
                </CardContent>
            </Card>

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
        color: colors.textSecondary,
    },
    card: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    linksContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
    },
    linkText: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontWeight: '500',
    },
    label: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    text: {
        fontSize: typography.size.md,
        color: colors.textPrimary,
    },
    criteriaContainer: {
        marginBottom: spacing.md,
    },
    criteriaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    criteriaTitle: {
        fontSize: typography.size.md,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    criteriaMax: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    feedbackInput: {
        height: 80,
        textAlignVertical: 'top',
    }
});

export default JudgingScreen;
