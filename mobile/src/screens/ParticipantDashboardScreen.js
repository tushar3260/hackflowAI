
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../api/config';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Trophy, Activity, Zap, Target, Upload } from 'lucide-react-native';

const MetricCard = ({ title, value, icon: Icon, color }) => (
    <Card style={styles.metricCard}>
        <CardContent style={styles.metricContent}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon size={24} color={color} />
            </View>
            <View>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricTitle}>{title}</Text>
            </View>
        </CardContent>
    </Card>
);

const ParticipantDashboardScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        activeHackathons: 0,
        submissionsCount: 0,
        avgScore: 0,
        totalWins: 0
    });
    const [myHackathons, setMyHackathons] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, teamsRes] = await Promise.all([
                api.get('/hackathons/stats/participant'),
                api.get('/teams/my')
            ]);

            setStats({
                activeHackathons: statsRes.data.activeHackathons || 0,
                submissionsCount: statsRes.data.submissionsCount || 0,
                avgScore: statsRes.data.avgScore || 0,
                totalWins: statsRes.data.totalWins || 0
            });

            // Process teams to get unique hackathons
            const teams = teamsRes.data;
            const hacks = teams.map(team => ({
                ...team.hackathon,
                teamId: team._id,
                teamName: team.name
            })).filter((h, index, self) =>
                index === self.findIndex((t) => t._id === h._id)
            );
            setMyHackathons(hacks);

        } catch (e) {
            console.log('Error fetching dashboard data', e);
        } finally {
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
                <Text style={styles.greeting}>Dashboard</Text>
                <Text style={styles.subGreeting}>Your activity overview</Text>
            </View>

            <View style={styles.statsGrid}>
                <MetricCard
                    title="Active"
                    value={stats.activeHackathons}
                    icon={Zap}
                    color={colors.warning}
                />
                <MetricCard
                    title="Wins"
                    value={stats.totalWins}
                    icon={Trophy}
                    color={colors.success}
                />
                <MetricCard
                    title="Avg Score"
                    value={stats.avgScore}
                    icon={Target}
                    color={colors.info}
                />
                <MetricCard
                    title="Submissions"
                    value={stats.submissionsCount}
                    icon={Activity}
                    color={colors.primary}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Hackathons</Text>
            </View>

            {myHackathons.length > 0 ? (
                myHackathons.map(h => (
                    <Card key={h._id} style={styles.hackathonCard}>
                        <CardContent>
                            <Text style={styles.hackathonTitle}>{h.title}</Text>
                            <Text style={styles.hackathonTeam}>Team: {h.teamName}</Text>

                            <View style={styles.actionRow}>
                                <Button
                                    title="View Details"
                                    size="sm"
                                    variant="secondary"
                                    onPress={() => navigation.navigate('HackathonDetail', { id: h._id })}
                                />
                                <Button
                                    title="Submit"
                                    size="sm"
                                    variant="primary"
                                    onPress={() => navigation.navigate('SubmissionScreen', { hackathonId: h._id })} // We need to create this route
                                />
                            </View>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No active hackathons</Text>
                    <Button
                        title="Browse Events"
                        variant="outline"
                        style={{ marginTop: spacing.md }}
                        onPress={() => navigation.navigate('MyTeams')} // temporary redirect
                    />
                </View>
            )}

        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    subGreeting: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    metricCard: {
        width: '47%', // roughly half minus gap
        marginBottom: 0,
    },
    metricContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconContainer: {
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    metricValue: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    metricTitle: {
        fontSize: typography.size.xs,
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
    hackathonCard: {
        marginBottom: spacing.md,
    },
    hackathonTitle: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    hackathonTeam: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: colors.textSecondary,
    }
});

export default ParticipantDashboardScreen;
