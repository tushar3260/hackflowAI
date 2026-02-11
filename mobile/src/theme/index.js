
export const colors = {
    primary: '#4f46e5', // Indigo-600
    secondary: '#64748b', // Slate-500
    success: '#10b981', // Emerald-500
    warning: '#f59e0b', // Amber-500
    danger: '#ef4444', // Red-500
    info: '#3b82f6', // Blue-500
    background: '#f8fafc', // Slate-50
    surface: '#ffffff',
    textPrimary: '#1e293b', // Slate-800
    textSecondary: '#475569', // Slate-600
    textMuted: '#94a3b8', // Slate-400
    border: '#e2e8f0', // Slate-200
};

export const typography = {
    fontFamily: {
        regular: 'System', // Use system font for now, can add custom fonts later
        bold: 'System',
    },
    size: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        display: 32,
    },
    weight: {
        regular: '400',
        medium: '500',
        bold: '700',
    }
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
};
