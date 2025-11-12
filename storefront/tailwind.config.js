const path = require("path")

// Import theme colors and tokens
// Note: These are TypeScript files, so we'll define the values directly here
// In a production setup, you might want to compile these to JS or use a different approach
const themeColors = {
  primary: {
    base: "#519717",
    hover: "#468a0e",
    active: "#3d760e",
    disabled: "#9CA3AF",
    light: "#66ba20",
    dark: "#3d760e",
  },
  secondary: {
    base: "#FCC100",
    hover: "#FCC100",
    active: "#FCC100",
    disabled: "#E5E7EB",
    light: "#FCC100",
    dark: "#FCC100",
  },
  accent: {
    base: "#FCC100",
    hover: "#FCC100",
    light: "#FCC100",
    dark: "#FCC100",
  },
  interactive: {
    base: "#3B82F6",
    hover: "#2563EB",
    active: "#1D4ED8",
    disabled: "#637daa",
    light: "#60A5FA",
    dark: "#1D4ED8",
  },
  success: {
    base: "#10B981",
    hover: "#059669",
    light: "#D1FAE5",
    dark: "#047857",
  },
  error: {
    base: "#EF4444",
    hover: "#DC2626",
    light: "#FEE2E2",
    dark: "#B91C1C",
  },
  warning: {
    base: "#F59E0B",
    hover: "#D97706",
    light: "#FEF3C7",
    dark: "#B45309",
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    inverse: "#FFFFFF",
  },
  background: {
    base: "#FFFFFF",
    elevated: "#F9FAFB",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  border: {
    base: "#E5E7EB",
    hover: "#D1D5DB",
    focus: "#3B82F6",
  },
}

const designTokens = {
  typography: {
    fontFamily: {
      sans: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Ubuntu",
        "sans-serif",
      ],
      mono: [
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  borderRadius: {
    none: "0px",
    sm: "2px",
    base: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  transitions: {
    fast: "150ms ease-in-out",
    base: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
}

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        // Theme colors from centralized config
        primary: {
          DEFAULT: themeColors.primary.base,
          hover: themeColors.primary.hover,
          active: themeColors.primary.active,
          disabled: themeColors.primary.disabled,
          light: themeColors.primary.light,
          dark: themeColors.primary.dark,
        },
        secondary: {
          DEFAULT: themeColors.secondary.base,
          hover: themeColors.secondary.hover,
          active: themeColors.secondary.active,
          disabled: themeColors.secondary.disabled,
          light: themeColors.secondary.light,
          dark: themeColors.secondary.dark,
        },
        accent: {
          DEFAULT: themeColors.accent.base,
          hover: themeColors.accent.hover,
          light: themeColors.accent.light,
          dark: themeColors.accent.dark,
        },
        interactive: {
          DEFAULT: themeColors.interactive.base,
          hover: themeColors.interactive.hover,
          active: themeColors.interactive.active,
          disabled: themeColors.interactive.disabled,
          light: themeColors.interactive.light,
          dark: themeColors.interactive.dark,
        },
        success: {
          DEFAULT: themeColors.success.base,
          hover: themeColors.success.hover,
          light: themeColors.success.light,
          dark: themeColors.success.dark,
        },
        error: {
          DEFAULT: themeColors.error.base,
          hover: themeColors.error.hover,
          light: themeColors.error.light,
          dark: themeColors.error.dark,
        },
        warning: {
          DEFAULT: themeColors.warning.base,
          hover: themeColors.warning.hover,
          light: themeColors.warning.light,
          dark: themeColors.warning.dark,
        },
        text: {
          primary: themeColors.text.primary,
          secondary: themeColors.text.secondary,
          tertiary: themeColors.text.tertiary,
          inverse: themeColors.text.inverse,
        },
        background: {
          base: themeColors.background.base,
          elevated: themeColors.background.elevated,
          overlay: themeColors.background.overlay,
        },
        border: {
          DEFAULT: themeColors.border.base,
          hover: themeColors.border.hover,
          focus: themeColors.border.focus,
        },
        // Keep existing grey scale for backward compatibility
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: {
        xs: designTokens.typography.fontSize.xs,
        sm: designTokens.typography.fontSize.sm,
        base: designTokens.typography.fontSize.base,
        lg: designTokens.typography.fontSize.lg,
        xl: designTokens.typography.fontSize.xl,
        "2xl": designTokens.typography.fontSize["2xl"],
        "3xl": designTokens.typography.fontSize["3xl"],
        "4xl": designTokens.typography.fontSize["4xl"],
      },
      fontWeight: {
        normal: designTokens.typography.fontWeight.normal,
        medium: designTokens.typography.fontWeight.medium,
        semibold: designTokens.typography.fontWeight.semibold,
        bold: designTokens.typography.fontWeight.bold,
      },
      lineHeight: {
        tight: designTokens.typography.lineHeight.tight,
        normal: designTokens.typography.lineHeight.normal,
        relaxed: designTokens.typography.lineHeight.relaxed,
      },
      boxShadow: {
        sm: designTokens.shadows.sm,
        DEFAULT: designTokens.shadows.base,
        md: designTokens.shadows.md,
        lg: designTokens.shadows.lg,
        xl: designTokens.shadows.xl,
      },
      transitionDuration: {
        fast: designTokens.transitions.fast,
        DEFAULT: designTokens.transitions.base,
        slow: designTokens.transitions.slow,
      },
      zIndex: {
        dropdown: designTokens.zIndex.dropdown,
        sticky: designTokens.zIndex.sticky,
        fixed: designTokens.zIndex.fixed,
        modal: designTokens.zIndex.modal,
        popover: designTokens.zIndex.popover,
        tooltip: designTokens.zIndex.tooltip,
      },
      borderRadius: {
        none: designTokens.borderRadius.none,
        sm: designTokens.borderRadius.sm,
        DEFAULT: designTokens.borderRadius.base,
        md: designTokens.borderRadius.md,
        lg: designTokens.borderRadius.lg,
        xl: designTokens.borderRadius.xl,
        full: designTokens.borderRadius.full,
        // Keep existing for backward compatibility
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
