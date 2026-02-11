
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'md', // sm, md, lg
    disabled = false,
    isLoading = false,
    style,
    textStyle
}) => {

    const getBackgroundColor = () => {
        if (disabled) return colors.textMuted;
        if (variant === 'primary') return colors.primary;
        if (variant === 'secondary') return colors.secondary;
        if (variant === 'danger') return colors.danger;
        return 'transparent';
    };

    const getTextColor = () => {
        if (variant === 'outline' || variant === 'ghost') return colors.primary;
        if (variant === 'danger-outline') return colors.danger;
        return colors.surface;
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 1, borderColor: colors.primary };
        if (variant === 'danger-outline') return { borderWidth: 1, borderColor: colors.danger };
        return {};
    };

    const getHeight = () => {
        if (size === 'sm') return 36;
        if (size === 'lg') return 56;
        return 48; // md
    };

    const containerStyle = {
        backgroundColor: getBackgroundColor(),
        height: getHeight(),
        borderRadius: borderRadius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        opacity: disabled ? 0.7 : 1,
        ...getBorder(),
        ...style,
    };

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.surface} />
            ) : (
                <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? 14 : 16 }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    text: {
        fontWeight: typography.weight.bold,
        textAlign: 'center',
    }
});

export default Button;
