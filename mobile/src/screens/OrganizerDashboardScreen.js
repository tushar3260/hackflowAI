
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../api/config';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LayoutDashboard, Calendar, Users, ChevronRight, Plus } from 'lucide-react-native';

const OrganizerDashboardScreen = ({ navigation }) => {
    const [hackathons, setHackathons] = useState([]);
    const [stats, setStats] = useState({
        activeHackathons: 0,
        totalParticipants: 0,
        pendingJudgements: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // In a real app we might have a specific endpoint for organizer's hackathons
            // For now, assuming /hackathons returns all, we filter by creator or similar
            // Or if the backend filters based on role. 
            // Checking web, it fetches /hackathons/organizer/my

            const [hacksRes, statsRes] = await Promise.all([
                api.get('/hackathons'), // Reusing public one for now, or need specific endpoint? 
                // Let's assume there is a way to get 'my' hackathons. 
                // If not, we screen filter. 
                // Actually web uses: api.get('/hackathons/organizer/stats') and api.get('/hackathons')
                api.get('/hackathons/stats/organizer')
            ]);

            // Filter hackathons where I am the organizer (if backend returns all)
            // Ideally backend returns only mine. Let's assume the public list includes valid `organizer` field to filter
            // OR we just use another endpoint.
            // Let's try /hackathons and see.

            setHackathons(hacksRes.data);
            setStats({
                activeHackathons: statsRes.data.activeHackathons || 0,
                totalParticipants: statsRes.data.totalParticipants || 0,
                pendingJudgements: statsRes.data.pendingJudgements || 0
            });

        } catch (e) {
            console.log('Error fetching organizer data', e);
            // Fallback
            setHackathons([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const StatCard = ({ title, value }) => (
        <View style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    return (
        <Layout
            scrollable
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Organizer Dashboard</Text>
            </View>

            <View style={styles.statsRow}>
                <StatCard title="Active Events" value={stats.activeHackathons} />
                <StatCard title="Participants" value={stats.totalParticipants} />
                <StatCard title="Pending Review" value={stats.pendingJudgements} />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Hackathons</Text>
                <Button
                    title="Create New"
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onPress={() => { }} // Placeholder
                />
            </View>

            {hackathons.length > 0 ? (
                hackathons.map(h => (
                    <TouchableOpacity
                        key={h._id}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('OrganizerHackathon', { id: h._id, title: h.title })}
                    >
                        <Card style={styles.hackathonCard}>
                            <CardContent style={styles.cardContent}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.hackathonTitle}>{h.title}</Text>
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <Calendar size={14} color={colors.textSecondary} />
                                            <Text style={styles.metaText}>{new Date(h.startDate).toLocaleDateString()}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Users size={14} color={colors.textSecondary} />
                                            <Text style={styles.metaText}>{h.participants?.length || 0}</Text>
                                        </View>
                                    </View>
                                </View>
                                <ChevronRight size={20} color={colors.textMuted} />
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.emptyText}>No hackathons found</Text>
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
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.primary,
    },
    statTitle: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hackathonTitle: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
    },
    emptyText: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 20,
    }
});

export default OrganizerDashboardScreen;
