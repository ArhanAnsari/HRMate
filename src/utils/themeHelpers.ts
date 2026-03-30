/**
 * 🛠️ UTILITY HELPERS - Premium UI Development Kit
 * Helper functions to speed up component development
 */

import * as Haptics from "expo-haptics";
import { useColorScheme } from "react-native";
import { THEME } from "../theme";

/**
 * Get theme based on color scheme
 */
export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return {
    isDark,
    theme: isDark ? THEME.dark : THEME.light,
    colors: THEME.colors,
    light: THEME.light,
    dark: THEME.dark,
  };
};

/**
 * Create consistent gradient colors
 */
export const getGradientColors = (
  type: "primary" | "success" | "warning" | "danger" = "primary",
) => {
  return THEME.colors.gradients[type];
};

/**
 * Get background color based on theme
 */
export const getBackgroundColor = (
  isDark: boolean,
  variant: "main" | "alt" | "tertiary" = "main",
) => {
  if (isDark) {
    if (variant === "alt") return THEME.dark.background.alt;
    if (variant === "tertiary") return THEME.dark.background.tertiary;
    return THEME.dark.background.main;
  }
  if (variant === "alt") return THEME.light.background.alt;
  if (variant === "tertiary") return THEME.light.background.tertiary;
  return THEME.light.background.main;
};

/**
 * Get text color based on theme and priority
 */
export const getTextColor = (
  isDark: boolean,
  priority: "primary" | "secondary" | "tertiary" = "primary",
) => {
  if (isDark) {
    if (priority === "secondary") return THEME.dark.text.secondary;
    if (priority === "tertiary") return THEME.dark.text.tertiary;
    return THEME.dark.text.primary;
  }
  if (priority === "secondary") return THEME.light.text.secondary;
  if (priority === "tertiary") return THEME.light.text.tertiary;
  return THEME.light.text.primary;
};

/**
 * Get status color
 */
export const getStatusColor = (
  status: "success" | "warning" | "danger" | "info",
) => {
  const statusMap = {
    success: THEME.colors.success,
    warning: THEME.colors.warning,
    danger: THEME.colors.danger,
    info: THEME.colors.info,
  };
  return statusMap[status];
};

/**
 * Get status badge colors (light + dark)
 */
export const getStatusBadgeColors = (
  status: "success" | "warning" | "danger" | "info",
) => {
  const colorMap = {
    success: {
      background: THEME.colors.successLight,
      text: THEME.colors.success,
    },
    warning: {
      background: THEME.colors.warningLight,
      text: THEME.colors.warning,
    },
    danger: { background: THEME.colors.dangerLight, text: THEME.colors.danger },
    info: { background: THEME.colors.infoLight, text: THEME.colors.info },
  };
  return colorMap[status];
};

/**
 * Trigger haptic feedback
 */
export const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

/**
 * Create responsive font size
 */
export const getResponsiveFontSize = (
  baseSize: number,
  screenWidth: number,
) => {
  const SCREEN_WIDTH_BREAKPOINT = 375; // iPhone SE width
  const scale = screenWidth / SCREEN_WIDTH_BREAKPOINT;
  return baseSize * scale;
};

/**
 * Create consistent border radius
 */
export const getBorderRadius = (
  size: "sm" | "md" | "lg" | "xl" | "full" = "md",
) => {
  return THEME.borderRadius[size];
};

/**
 * Get shadow style
 */
export const getShadow = (size: "xs" | "sm" | "md" | "lg" | "xl" = "md") => {
  return THEME.shadows[size];
};

/**
 * Create consistent spacing
 */
export const getSpacing = (multiplier: number = 1) => {
  return THEME.spacing.md * multiplier;
};

/**
 * Merge styles (for complex style objects)
 */
export const mergeStyles = (baseStyle: any, overrideStyle: any) => {
  if (!overrideStyle) return baseStyle;
  return Array.isArray(baseStyle)
    ? [...baseStyle, overrideStyle]
    : [baseStyle, overrideStyle];
};

/**
 * Create consistent component preset styles
 */
export const componentPresets = {
  // Card presets
  card: {
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.md,
  },
  cardInteractive: {
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.sm,
  },

  // Button presets
  buttonLarge: {
    height: THEME.componentSizes.button.lg.height,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.xl,
  },
  buttonMedium: {
    height: THEME.componentSizes.button.md.height,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.lg,
  },
  buttonSmall: {
    height: THEME.componentSizes.button.sm.height,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
  },

  // Input presets
  input: {
    height: THEME.componentSizes.input.height,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.sm,
  },

  // Avatar presets
  avatarLarge: {
    width: THEME.componentSizes.avatar.lg,
    height: THEME.componentSizes.avatar.lg,
    borderRadius: THEME.componentSizes.avatar.lg / 2,
  },
  avatarMedium: {
    width: THEME.componentSizes.avatar.md,
    height: THEME.componentSizes.avatar.md,
    borderRadius: THEME.componentSizes.avatar.md / 2,
  },
  avatarSmall: {
    width: THEME.componentSizes.avatar.sm,
    height: THEME.componentSizes.avatar.sm,
    borderRadius: THEME.componentSizes.avatar.sm / 2,
  },

  // Icon presets
  iconLarge: THEME.componentSizes.icon.lg,
  iconMedium: THEME.componentSizes.icon.md,
  iconSmall: THEME.componentSizes.icon.sm,

  // Section spacing
  sectionSpacing: {
    marginVertical: THEME.spacing.xl,
  },
  componentSpacing: {
    marginVertical: THEME.spacing.md,
  },
};

/**
 * Create consistent container styles
 */
export const containerStyles = {
  screen: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
  card: {
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
  },
};

/**
 * Number formatting utilities
 */
export const formatters = {
  currency: (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      notation: "compact",
    }).format(value);
  },

  percent: (value: number) => {
    return `${value.toFixed(1)}%`;
  },

  number: (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  },

  trend: (direction: "up" | "down", percentage: number) => {
    const symbol = direction === "up" ? "↑" : "↓";
    return `${symbol} ${percentage}%`;
  },
};

/**
 * Status label with appropriate styling
 */
export const getStatusLabel = (
  status: string,
): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: THEME.colors.success },
    inactive: { label: "Inactive", color: THEME.colors.danger },
    pending: { label: "Pending", color: THEME.colors.warning },
    approved: { label: "Approved", color: THEME.colors.success },
    rejected: { label: "Rejected", color: THEME.colors.danger },
    onleave: { label: "On Leave", color: THEME.colors.warning },
    default: { label: "Unknown", color: THEME.colors.info },
  };
  return statusMap[status] || statusMap.default;
};

/**
 * Get first letters for avatar text
 */
export const getAvatarText = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format date consistently
 */
export const formatDate = (
  date: Date | string,
  format: "short" | "long" | "relative" = "short",
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (format === "long") {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // relative (e.g., "2 hours ago")
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, "short");
};

/**
 * Generate random avatar background color
 */
export const getAvatarBgColor = (seed: string): string => {
  const colors = [
    THEME.colors.primary,
    THEME.colors.success,
    THEME.colors.warning,
    THEME.colors.danger,
    THEME.colors.info,
  ];
  const hash = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Create consistent screen padding
 */
export const getScreenPadding = (
  variant: "default" | "compact" | "spacious" = "default",
) => {
  switch (variant) {
    case "compact":
      return THEME.spacing.md;
    case "spacious":
      return THEME.spacing.xl;
    default:
      return THEME.spacing.lg;
  }
};

/**
 * Debug helper - log theme colors
 */
export const debugTheme = () => {
  console.log("=== THEME SYSTEM ===");
  console.log("Colors:", THEME.colors);
  console.log("Typography:", THEME.typography);
  console.log("Spacing:", THEME.spacing);
  console.log("Shadows:", THEME.shadows);
  console.log("Border Radius:", THEME.borderRadius);
  console.log("Component Sizes:", THEME.componentSizes);
};

export default {
  useTheme,
  getGradientColors,
  getBackgroundColor,
  getTextColor,
  getStatusColor,
  getStatusBadgeColors,
  hapticFeedback,
  getResponsiveFontSize,
  getBorderRadius,
  getShadow,
  getSpacing,
  mergeStyles,
  componentPresets,
  containerStyles,
  formatters,
  getStatusLabel,
  getAvatarText,
  isValidEmail,
  truncateText,
  formatDate,
  getAvatarBgColor,
  getScreenPadding,
  debugTheme,
};
