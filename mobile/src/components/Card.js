
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../theme';

const Card = ({ children, style, variant = 'default' }) => {
    return (
        <View style={[styles.card, variant === 'glass' && styles.glass, style]}>
            {children}
        </View>
    );
};

export const CardContent = ({ children, style }) => (
    <View style={[styles.content, style]}>{children}</View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
        ...shadows.sm,
        overflow: 'hidden',
    },
    glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        padding: spacing.md,
    }
});

export default Card;
