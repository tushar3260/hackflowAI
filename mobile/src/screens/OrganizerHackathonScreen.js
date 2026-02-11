
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Calendar, Users, Gavel, Settings, ArrowRight } from 'lucide-react-native';

const OrganizerHackathonScreen = ({ route, navigation }) => {
    const { id, title } = route.params;

    const MenuOption = ({ icon: Icon, title, subtitle, onPress, color = colors.primary }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Card style={styles.optionCard}>
                <CardContent style={styles.optionContent}>
                    <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                        <Icon size={24} color={color} />
                    </View>
                    <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>{title}</Text>
                        <Text style={styles.optionSubtitle}>{subtitle}</Text>
                    </View>
                    <ArrowRight size={20} color={colors.textMuted} />
                </CardContent>
            </Card>
        </TouchableOpacity>
    );

    return (
        <Layout scrollable>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Management Console</Text>
            </View>

            <View style={styles.menu}>
                <MenuOption
                    icon={Calendar}
                    title="Manage Rounds"
                    subtitle="Configure timeline & criteria"
                    onPress={() => navigation.navigate('OrganizerRounds', { hackathonId: id })}
                />
                <MenuOption
                    icon={Gavel}
                    title="Manage Judges"
                    subtitle="Invite & assign judges"
                    color={colors.warning}
                    onPress={() => navigation.navigate('OrganizerJudges', { hackathonId: id })}
                />
                <MenuOption
                    icon={Users}
                    title="Participants"
                    subtitle="View teams & submissions"
                    color={colors.success}
                    onPress={() => { }} // Placeholder
                />
                <MenuOption
                    icon={Settings}
                    title="Settings"
                    subtitle="Edit hackathon details"
                    color={colors.textSecondary}
                    onPress={() => { }} // Placeholder
                />
            </View>

        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    menu: {
        gap: spacing.md,
    },
    optionCard: {
        marginBottom: 0,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    }
});

export default OrganizerHackathonScreen;
