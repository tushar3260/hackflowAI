
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, Image, TouchableOpacity } from 'react-native';
import api, { SERVER_URL } from '../api/config';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../theme';
import { ListChecks, Calendar, ExternalLink } from 'lucide-react-native';

const JudgeDashboardScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, statsRes] = await Promise.all([
                api.get('/judging/assigned'),
                api.get('/hackathons/stats/judge')
            ]);
            setTasks(tasksRes.data);
            setStats(statsRes.data);
        } catch (e) {
            console.log('Error fetching judge data', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    return (
        <Layout
            scrollable
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Judge Dashboard</Text>
                <Text style={styles.subtitle}>Evaluations Pending: {tasks.length}</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Assigned Submissions</Text>
            </View>

            {tasks.length > 0 ? (
                tasks.map(item => (
                    <Card key={item._id} style={styles.card}>
                        <CardContent>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.projectTitle}>{item.submission?.team?.name || 'Unknown Team'}</Text>
                                    <Text style={styles.projectRound}>{item.round?.name}</Text>
                                </View>
                                <ListChecks size={24} color={colors.primary} />
                            </View>

                            <View style={styles.actionContainer}>
                                <Button
                                    title="Evaluate"
                                    size="sm"
                                    onPress={() => navigation.navigate('JudgingScreen', { submissionId: item.submission._id, roundId: item.round._id })}
                                />
                            </View>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Text style={styles.emptyText}>No pending evaluations.</Text>
            )}

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
    sectionHeader: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    card: {
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: spacing.md,
    },
    projectTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    projectRound: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: 20,
    }
});

export default JudgeDashboardScreen;
