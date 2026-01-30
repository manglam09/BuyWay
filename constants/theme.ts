// Design System based on Figma - Mobile E-commerce Clothing Store
// Font: Encode (we'll use system fonts with similar weight)

export const Colors = {
    // Primary Colors from Figma
    primary: '#292526',      // Dark charcoal - primary buttons/text
    secondary: '#797676',    // Medium gray - secondary text
    tertiary: '#A3A1A2',     // Light gray - placeholders/disabled
    background: '#F2F2F2',   // Off-white - card backgrounds
    black: '#121111',        // Pure black - strong accents

    // Extended palette
    white: '#FFFFFF',
    lavender: '#E8E8F0',     // Light lavender - main background
    lavenderLight: '#F0F0F8',

    // Semantic colors
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FFC107',

    // Transparency
    overlay: 'rgba(18, 17, 17, 0.5)',
    cardShadow: 'rgba(41, 37, 38, 0.08)',
};

export const Typography = {
    // Font family - Encode is the design font
    // We'll use system fonts that are similar
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
        bold: 'System',
    },

    // Font sizes
    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        '2xl': 20,
        '3xl': 24,
        '4xl': 28,
        '5xl': 32,
        '6xl': 40,
    },

    // Font weights
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semiBold: '600' as const,
        bold: '700' as const,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 999,
};

export const Shadows = {
    sm: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
};

export default {
    Colors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
};
