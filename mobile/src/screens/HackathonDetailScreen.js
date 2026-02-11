
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import api, { SERVER_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Calendar, Users, Trophy } from 'lucide-react-native';

const HackathonDetailScreen = ({ route, navigation }) => {
    const { id } = route.params; // Get hackathon ID from navigation
    const { user } = useAuth();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchHackathonDetails();
    }, [id]);

    const fetchHackathonDetails = async () => {
        try {
            const res = await api.get(`/hackathons/${id}`);
            setHackathon(res.data);
        } catch (e) {
            console.log('Error fetching details', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            navigation.navigate('Auth', { screen: 'Login' });
            return;
        }

        // In web flow, this navigates to a participation form/team step
        // For mobile MVP, let's assume we navigate to a Team Formation screen or direct register if allowed
        // For now, let's just show a "Coming Soon" or navigate to placeholder
        // If the user flow is browse -> detail -> login -> team -> ...

        // Check if we need to join/create team
        navigation.navigate('ParticipantApp', { screen: 'MyTeams' });
    };

    if (loading) {
        return (
            <Layout>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            </Layout>
        );
    }

    if (!hackathon) {
        return (
            <Layout>
                <Text style={styles.errorText}>Hackathon not found</Text>
            </Layout>
        );
    }

    return (
        <Layout scrollable>
            {/* Banner */}
            <View style={styles.bannerContainer}>
                {hackathon.banner ? (
                    <Image
                        source={{ uri: `${SERVER_URL}${hackathon.banner}` }}
                        style={styles.banner}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.banner, styles.placeholderBanner]}>
                        <Text style={styles.placeholderText}>{hackathon.title?.charAt(0)}</Text>
                    </View>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    title="Back"
                    style={styles.backButton}
                    textStyle={{ color: colors.surface }}
                    onPress={() => navigation.goBack()}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{hackathon.title}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{hackathon.status}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Calendar size={16} color={colors.textSecondary} />
                        <Text style={styles.metaText}>
                            {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <Button
                        title={user ? "Register Now" : "Login to Register"}
                        onPress={handleRegister}
                        style={styles.registerButton}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>{hackathon.description}</Text>
                </View>

                {/* Prizes or other details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Users size={24} color={colors.primary} />
                            <Text style={styles.statValue}>{hackathon.maxParticipants || 'Unlimited'}</Text>
                            <Text style={styles.statLabel}>Max Participants</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Trophy size={24} color={colors.warning} />
                            <Text style={styles.statValue}>{hackathon.maxTeamSize}</Text>
                            <Text style={styles.statLabel}>Max Team Size</Text>
                        </View>
                    </View>
                </View>

            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    placeholderBanner: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 64,
        color: colors.surface,
        fontWeight: typography.weight.bold,
    },
    backButton: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        height: 32,
    },
    content: {
        padding: spacing.md,
    },
    title: {
        fontSize: typography.size.display,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    badge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        color: colors.surface,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.bold,
        textTransform: 'uppercase',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
    },
    actionContainer: {
        marginBottom: spacing.xl,
    },
    registerButton: {
        width: '100%',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: typography.size.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        color: colors.danger,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
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
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
    },
});

export default HackathonDetailScreen;
