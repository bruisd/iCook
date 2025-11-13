// Theme configuration inspired by Wolt's design system

export const colors = {
  primary: '#FF7A59', // Warm Orange - new brand color
  primaryDark: '#E65A3A',
  primaryLight: '#FF9A7F',
  secondary: '#4CAF50', // Earthy Green
  secondaryLight: '#6FBF73',

  background: '#FFFFFF',
  backgroundLight: '#F7F7F7', // Off-White
  backgroundDark: '#1a1a1a', // Dark charcoal for dark mode

  text: '#333333', // Dark Charcoal
  textDark: '#F7F7F7', // Light text for dark backgrounds
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',

  success: '#4CAF50',
  warning: '#FFB020',
  error: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',

  border: '#DEE2E6',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Category colors
  dairy: '#FFF3BF',
  vegetables: '#C7EFCF',
  meat: '#FFB3BA',
  fish: '#BAE1FF',
  fruits: '#FFD6A5',
  grains: '#D4A574',
  spices: '#FFABAB',
  condiments: '#FFC6FF',
  other: '#E0E0E0',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: 48,
    color: colors.text,
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 40,
    color: colors.text,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: 32,
    color: colors.text,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 24,
    color: colors.text,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: 16,
    color: colors.textLight,
  },
};

export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};
