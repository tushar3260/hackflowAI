
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Users, Copy, LogOut, Plus, UserPlus } from 'lucide-react-native';

const TabButton = ({ title, active, onPress }) => (
    <TouchableOpacity
        style={[styles.tabButton, active && styles.activeTabButton]}
        onPress={onPress}
    >
        <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
);

const TeamScreen = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('myTeams');
    const [myTeams, setMyTeams] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Forms
    const [createName, setCreateName] = useState('');
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsRes, hacksRes] = await Promise.all([
                api.get('/teams/my'),
                api.get('/hackathons')
            ]);
            setMyTeams(teamsRes.data);
            setHackathons(Array.isArray(hacksRes.data) ? hacksRes.data : (hacksRes.data.data || []));

            if (hacksRes.data.length > 0 && !selectedHackathon) {
                setSelectedHackathon(hacksRes.data[0]._id);
            }
        } catch (e) {
            console.log('Error fetching team data', e);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleCreate = async () => {
        if (!createName || !selectedHackathon) {
            setError('Please fill all fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/teams/create', { name: createName, hackathonId: selectedHackathon });
            setSuccess('Team created!');
            setCreateName('');
            fetchData();
            setActiveTab('myTeams');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode) {
            setError('Please enter code');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/teams/join', { teamCode: joinCode });
            setSuccess('Joined team!');
            setJoinCode('');
            fetchData();
            setActiveTab('myTeams');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to join team');
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async (teamId) => {
        try {
            await api.post('/teams/leave', { teamId });
            fetchData();
        } catch (e) {
            console.log('Error leaving team', e);
        }
    };

    return (
        <Layout
            scrollable
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Team Management</Text>
            </View>

            <View style={styles.tabs}>
                <TabButton title="My Teams" active={activeTab === 'myTeams'} onPress={() => setActiveTab('myTeams')} />
                <TabButton title="Create" active={activeTab === 'create'} onPress={() => setActiveTab('create')} />
                <TabButton title="Join" active={activeTab === 'join'} onPress={() => setActiveTab('join')} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            <View style={styles.content}>
                {activeTab === 'myTeams' && (
                    <View>
                        {myTeams.length === 0 ? (
                            <Text style={styles.emptyText}>You are not in any teams.</Text>
                        ) : (
                            myTeams.map(team => (
                                <Card key={team._id} style={styles.teamCard}>
                                    <CardContent>
                                        <View style={styles.teamHeader}>
                                            <View>
                                                <Text style={styles.teamName}>{team.name}</Text>
                                                <Text style={styles.hackathonName}>{team.hackathon?.title}</Text>
                                            </View>
                                            {team.leader._id === user._id && (
                                                <View style={styles.leaderBadge}>
                                                    <Text style={styles.leaderText}>Leader</Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.codeContainer}>
                                            <Text style={styles.codeLabel}>Code:</Text>
                                            <Text style={styles.codeValue}>{team.teamCode}</Text>
                                        </View>

                                        <View style={styles.membersList}>
                                            {team.members.map(m => (
                                                <View key={m._id} style={styles.memberItem}>
                                                    <View style={styles.avatar}>
                                                        <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
                                                    </View>
                                                    <Text style={styles.memberName}>{m.name}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <Button
                                            title="Leave Team"
                                            variant="danger-outline"
                                            size="sm"
                                            onPress={() => handleLeave(team._id)}
                                            style={{ marginTop: spacing.md }}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </View>
                )}

                {activeTab === 'create' && (
                    <Card>
                        <CardContent>
                            <Input
                                label="Team Name"
                                placeholder="E.g. Code Wizards"
                                value={createName}
                                onChangeText={setCreateName}
                            />
                            {/* Hackathon Select - Simplified as list of buttons or simple text for MVP if specific ID needed */}
                            {/* For MVP, let's just pick the first available or show a text input if UI is too complex */}
                            <Text style={styles.label}>Select Hackathon (First available selected)</Text>
                            {/* In a real app we'd use a Modal or Dropdown. For simplicity, we just prompt to create for the first one.*/}
                            {hackathons.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{hackathons.find(h => h._id === selectedHackathon)?.title || 'None'}</Text>
                                </View>
                            )}

                            <Button
                                title="Create Team"
                                onPress={handleCreate}
                                isLoading={loading}
                            />
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'join' && (
                    <Card>
                        <CardContent>
                            <Input
                                label="Team Code"
                                placeholder="Enter 6-digit code"
                                value={joinCode}
                                onChangeText={text => setJoinCode(text.toUpperCase())}
                                maxLength={6}
                            />
                            <Button
                                title="Join Team"
                                onPress={handleJoin}
                                isLoading={loading}
                            />
                        </CardContent>
                    </Card>
                )}
            </View>

        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        padding: 4,
        borderRadius: borderRadius.md,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    activeTabButton: {
        backgroundColor: colors.primary,
    },
    tabText: {
        color: colors.textSecondary,
        fontWeight: typography.weight.medium,
    },
    activeTabText: {
        color: colors.surface,
        fontWeight: typography.weight.bold,
    },
    content: {
        flex: 1,
    },
    teamCard: {
        marginBottom: spacing.lg,
    },
    teamHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: spacing.md,
    },
    teamName: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    hackathonName: {
        fontSize: typography.size.sm,
        color: colors.primary,
    },
    leaderBadge: {
        backgroundColor: colors.warning + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    leaderText: {
        color: colors.warning,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    codeContainer: {
        backgroundColor: colors.background,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    codeLabel: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
    },
    codeValue: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: typography.size.md,
    },
    membersList: {
        gap: spacing.sm,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
    },
    memberName: {
        fontSize: typography.size.sm,
        color: colors.textPrimary,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: 20,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
        marginBottom: 8,
    },
    successText: {
        color: colors.success,
        textAlign: 'center',
        marginBottom: 8,
    },
    label: {
        marginBottom: 4,
        color: colors.textSecondary,
        fontSize: typography.size.sm,
    }
});

export default TeamScreen;
