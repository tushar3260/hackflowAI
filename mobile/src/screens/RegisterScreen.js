
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../theme';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('participant');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        const success = await register(name, email, password, role);
        setLoading(false);
        if (!success) {
            setError('Registration failed. Please try again.');
        }
    };

    const RoleOption = ({ value, label }) => (
        <TouchableOpacity
            style={[styles.roleOption, role === value && styles.roleOptionActive]}
            onPress={() => setRole(value)}
        >
            <Text style={[styles.roleText, role === value && styles.roleTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <Layout scrollable>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the hackathon community</Text>
                </View>

                <View style={styles.form}>
                    <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
                    <Input
                        label="Email Address"
                        placeholder="john@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input
                        label="Password"
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Text style={styles.label}>I am a...</Text>
                    <View style={styles.roleContainer}>
                        <RoleOption value="participant" label="Participant" />
                        <RoleOption value="organizer" label="Organizer" />
                        <RoleOption value="judge" label="Judge" />
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title="Sign Up"
                        onPress={handleRegister}
                        isLoading={loading}
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.xl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.size.display,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.size.md,
        color: colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: typography.weight.medium,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        padding: spacing.xs,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    roleOption: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    roleOptionActive: {
        backgroundColor: colors.primary,
    },
    roleText: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontWeight: typography.weight.medium,
    },
    roleTextActive: {
        color: colors.surface,
        fontWeight: typography.weight.bold,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    button: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        color: colors.textSecondary,
    },
    link: {
        color: colors.primary,
        fontWeight: typography.weight.bold,
    }
});

export default RegisterScreen;
