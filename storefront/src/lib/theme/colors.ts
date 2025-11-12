/**
 * Centralized color definitions for easy client customization
 * All colors are defined here and can be easily changed for different clients
 */

export interface ColorPalette {
  base: string
  hover?: string
  active?: string
  disabled?: string
  light?: string
  dark?: string
}

export interface ThemeColors {
  primary: ColorPalette
  secondary: ColorPalette
  accent: ColorPalette
  success: ColorPalette
  error: ColorPalette
  warning: ColorPalette
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  background: {
    base: string
    elevated: string
    overlay: string
  }
  border: {
    base: string
    hover: string
    focus: string
  }
}

/**
 * Default theme colors based on Figma design
 * Dark blue for headers/footers, white backgrounds, yellow accents
 */
export const defaultThemeColors: ThemeColors = {
  primary: {
    base: "#1F2937", // Dark blue/gray for headers, footers, CTAs
    hover: "#111827", // Darker on hover
    active: "#0F172A", // Even darker when active
    disabled: "#9CA3AF", // Gray when disabled
    light: "#374151", // Lighter variant
    dark: "#111827", // Darker variant
  },
  secondary: {
    base: "#FFFFFF", // White for backgrounds
    hover: "#F9FAFB", // Slightly off-white on hover
    active: "#F3F4F6", // More off-white when active
    disabled: "#E5E7EB", // Light gray when disabled
    light: "#FFFFFF",
    dark: "#F9FAFB",
  },
  accent: {
    base: "#FCD34D", // Yellow for category icons and highlights
    hover: "#FBBF24", // Darker yellow on hover
    light: "#FEF3C7", // Light yellow
    dark: "#F59E0B", // Dark yellow
  },
  success: {
    base: "#10B981", // Green for success states
    hover: "#059669",
    light: "#D1FAE5",
    dark: "#047857",
  },
  error: {
    base: "#EF4444", // Red for error states
    hover: "#DC2626",
    light: "#FEE2E2",
    dark: "#B91C1C",
  },
  warning: {
    base: "#F59E0B", // Orange for warnings
    hover: "#D97706",
    light: "#FEF3C7",
    dark: "#B45309",
  },
  text: {
    primary: "#111827", // Dark gray/black for primary text
    secondary: "#6B7280", // Medium gray for secondary text
    tertiary: "#9CA3AF", // Light gray for tertiary text
    inverse: "#FFFFFF", // White for text on dark backgrounds
  },
  background: {
    base: "#FFFFFF", // White base background
    elevated: "#F9FAFB", // Slightly off-white for elevated surfaces
    overlay: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  border: {
    base: "#E5E7EB", // Light gray for borders
    hover: "#D1D5DB", // Slightly darker on hover
    focus: "#1F2937", // Dark blue/gray for focus states
  },
}

/**
 * Export theme colors (can be replaced with client-specific colors)
 */
export const themeColors = defaultThemeColors

