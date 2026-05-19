const path = require("path")

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
      borderRadius: {
        none: "0px",
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
        phone: "480px",
        xsmall: "512px",
        tablet: "768px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontSize: {
        "3xl": "2rem",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
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
        /** Idle motion for brands hero tiles (inner layer; outer stays on GSAP scroll transform) */
        "brand-tile-float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "25%": { transform: "translate3d(2px, -2.5px, 0) rotate(0.65deg)" },
          "50%": { transform: "translate3d(-1.5px, 2px, 0) rotate(-0.45deg)" },
          "75%": { transform: "translate3d(2.5px, 1.2px, 0) rotate(0.35deg)" },
        },
        "brand-tile-float-alt": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "25%": { transform: "translate3d(-2px, 2px, 0) rotate(-0.55deg)" },
          "50%": { transform: "translate3d(2px, -1.5px, 0) rotate(0.5deg)" },
          "75%": { transform: "translate3d(-1.5px, -2px, 0) rotate(-0.35deg)" },
        },
        /**
         * Product listing card: grow + wobble (rest → −1.75rem lift + scale 1.12, matches LISTING_CARD_POP).
         */
        "card-listing-enter": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          "14%": {
            transform:
              "translate3d(2.4px, -18px, 0) scale(1.078) rotate(0.55deg)",
          },
          "28%": {
            transform:
              "translate3d(-1.9px, calc(-1.75rem * 0.42), 0) scale(1.108) rotate(-0.45deg)",
          },
          "42%": {
            transform:
              "translate3d(2.3px, calc(-1.75rem * 0.72), 0) scale(1.12) rotate(0.68deg)",
          },
          "56%": {
            transform:
              "translate3d(-1.6px, calc(-1.75rem * 0.92), 0) scale(1.12) rotate(-0.42deg)",
          },
          "70%": {
            transform:
              "translate3d(1.2px, calc(-1.75rem * 0.98), 0) scale(1.12) rotate(0.28deg)",
          },
          "84%": {
            transform:
              "translate3d(-0.6px, calc(-1.75rem * 0.995), 0) scale(1.115) rotate(-0.12deg)",
          },
          "100%": {
            transform: "translate3d(0, -1.75rem, 0) scale(1.12) rotate(0deg)",
          },
        },
        /**
         * Shrink + wobble from expanded pose to rest. Uses `--listing-exit-bias-x` / `-y` (−1…1),
         * set on the element for overshoot opposite pointer exit velocity.
         */
        "card-listing-leave-dynamic": {
          "0%": {
            transform: "translate3d(0, -1.75rem, 0) scale(1.12) rotate(0deg)",
          },
          "14%": {
            transform:
              "translate3d(calc(var(--listing-exit-bias-x, 0) * 16px), calc(-1.75rem + var(--listing-exit-bias-y, 0) * 31px), 0) scale(1.052) rotate(calc(var(--listing-exit-bias-x, 0) * 0.85deg))",
          },
          "32%": {
            transform:
              "translate3d(calc(var(--listing-exit-bias-x, 0) * -8px - 2px), calc(-1.064rem + var(--listing-exit-bias-y, 0) * -15px), 0) scale(1.024) rotate(calc(var(--listing-exit-bias-x, 0) * -0.52deg))",
          },
          "50%": {
            transform:
              "translate3d(calc(1.3px + var(--listing-exit-bias-x, 0) * 4.5px), calc(-0.504rem + var(--listing-exit-bias-y, 0) * -8px), 0) scale(1.08) rotate(calc(var(--listing-exit-bias-x, 0) * 0.3deg))",
          },
          "68%": {
            transform:
              "translate3d(calc(-0.75px + var(--listing-exit-bias-x, 0) * 2px), calc(-0.168rem + var(--listing-exit-bias-y, 0) * -4px), 0) scale(1.044) rotate(calc(var(--listing-exit-bias-x, 0) * -0.16deg))",
          },
          "86%": {
            transform:
              "translate3d(calc(0.35px + var(--listing-exit-bias-x, 0) * 0.65px), -14px, 0) scale(1.028) rotate(calc(var(--listing-exit-bias-x, 0) * 0.07deg))",
          },
          "100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
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
        "brand-tile-float":
          "brand-tile-float var(--brand-float-duration, 6s) ease-in-out infinite",
        "brand-tile-float-alt":
          "brand-tile-float-alt var(--brand-float-duration, 6.5s) ease-in-out infinite",
        /** Product listing card pointer enter / leave (see `card-listing-enter` / `card-listing-leave-dynamic`) */
        "card-listing-enter":
          "card-listing-enter 0.68s cubic-bezier(0.36, 0.55, 0.19, 0.99) 1 forwards",
        "card-listing-leave":
          "card-listing-leave-dynamic 0.5s cubic-bezier(0.36, 0.55, 0.19, 0.99) 1 forwards",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
