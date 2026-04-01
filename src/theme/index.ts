/**
 * 🎨 PREMIUM THEME SYSTEM - HRMate v2
 * Color palette, typography, spacing, and shadow definitions
 */

import { Platform } from "react-native";

// ==================== COLORS ====================
export const COLORS = {
  // Primary Colors (Blue Professional Gradient)
  primary: "#2563EB",
  primaryDark: "#1E40AF",
  primaryLight: "#DBEAFE",

  // Status Colors
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  info: "#06B6D4",
  infoLight: "#CFFAFE",

  // Neutral Text
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    tertiary: "#94A3B8",
  },

  // Backgrounds
  background: {
    main: "#FFFFFF",
    alt: "#F8FAFC",
    tertiary: "#EFF6FF",
  },

  // Borders & Dividers
  border: "#E2E8F0",
  divider: "#F1F5F9",

  // Shadows
  shadow: "rgba(15, 23, 42, 0.08)",
  shadowDark: "rgba(15, 23, 42, 0.12)",

  // Dark Mode
  dark: {
    background: "#0F172A",
    backgroundAlt: "#1E293B",
    backgroundTertiary: "#334155",
    text: "#F1F5F9",
    textSecondary: "#CBD5E1",
    textTertiary: "#94A3B8",
    border: "#334155",
    shadow: "rgba(0, 0, 0, 0.3)",
  },

  // Gradients
  gradients: {
    primary: ["#2563EB", "#1E40AF"],
    success: ["#10B981", "#059669"],
    warning: ["#F59E0B", "#D97706"],
    danger: ["#EF4444", "#DC2626"],
  },
};

// ==================== TYPOGRAPHY ====================
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  h6: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  bodyXs: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
};

// ==================== SPACING (8pt Grid System) ====================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  "2xl": 48,
  "3xl": 64,
};

// ==================== SHADOWS ====================
export const SHADOWS = {
  xs: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ==================== BORDER RADIUS ====================
export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ==================== COMPONENT SIZES ====================
export const COMPONENT_SIZES = {
  // Button sizes
  button: {
    sm: { height: 36, paddingHorizontal: SPACING.md },
    md: { height: 44, paddingHorizontal: SPACING.lg },
    lg: { height: 52, paddingHorizontal: SPACING.xl },
  },

  // Input sizes
  input: {
    height: 44,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // FAB (Floating Action Button)
  fab: {
    size: 56,
    icon: 24,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },

  // Bottom tab height
  tabBar: 64,
};

// ==================== ANIMATION TIMINGS ====================
export const ANIMATION_TIMINGS = {
  quick: 100,
  standard: 200,
  slow: 300,
  entrance: 400,
  exit: 200,
  hold: 3000,
};

// ==================== FONT FAMILY (Platform-Specific) ====================
export const FONT_FAMILY = Platform.select({
  ios: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },
  android: {
    regular: "Roboto",
    medium: "Roboto_500",
    semibold: "Roboto_600",
    bold: "Roboto_700",
  },
  default: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },
});

// ==================== THEME OBJECT (For Context) ====================
export const LIGHT_THEME = {
  background: {
    main: COLORS.background.main,
    alt: COLORS.background.alt,
    tertiary: COLORS.background.tertiary,
  },
  text: COLORS.text,
  border: COLORS.border,
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  primaryLight: COLORS.primaryLight,
  success: COLORS.success,
  warning: COLORS.warning,
  danger: COLORS.danger,
  info: COLORS.info,
};

export const DARK_THEME = {
  background: {
    main: COLORS.dark.background,
    alt: COLORS.dark.backgroundAlt,
    tertiary: COLORS.dark.backgroundTertiary,
  },
  text: {
    primary: COLORS.dark.text,
    secondary: COLORS.dark.textSecondary,
    tertiary: COLORS.dark.textTertiary,
  },
  border: COLORS.dark.border,
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  primaryLight: COLORS.primaryLight,
  success: COLORS.success,
  warning: COLORS.warning,
  danger: COLORS.danger,
  info: COLORS.info,
};

// ==================== EXPORT ALL ====================
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
  borderRadius: BORDER_RADIUS,
  componentSizes: COMPONENT_SIZES,
  animationTimings: ANIMATION_TIMINGS,
  fontFamily: FONT_FAMILY,
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export default THEME;
