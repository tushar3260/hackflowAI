
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, typography, spacing, borderRadius } from '../theme';
import { User, Mail, LogOut, Edit2 } from 'lucide-react-native';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [editing, setEditing] = useState(false);

    // Placeholder for edit logic
    const [name, setName] = useState(user?.name || '');

    const handleSave = () => {
        // Implement update profile API call here
        setEditing(false);
    };

    return (
        <Layout scrollable>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.role}>{user?.role}</Text>
            </View>

            <Card>
                <CardContent>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <TouchableOpacity onPress={() => setEditing(!editing)}>
                            <Edit2 size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Mail size={18} color={colors.textSecondary} />
                        <View>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <User size={18} color={colors.textSecondary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Full Name</Text>
                            {editing ? (
                                <Input
                                    value={name}
                                    onChangeText={setName}
                                    containerStyle={{ marginBottom: 0 }}
                                />
                            ) : (
                                <Text style={styles.value}>{user?.name}</Text>
                            )}
                        </View>
                    </View>

                    {editing && (
                        <Button title="Save Changes" onPress={handleSave} style={{ marginTop: spacing.md }} />
                    )}

                </CardContent>
            </Card>

            <Button
                title="Sign Out"
                variant="danger-outline"
                icon={LogOut}
                onPress={logout}
                style={{ marginTop: spacing.xl }}
            />

        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.surface,
    },
    name: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    role: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    infoRow: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
    },
    label: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    value: {
        fontSize: typography.size.md,
        color: colors.textPrimary,
        fontWeight: '500',
    }
});

export default ProfileScreen;
