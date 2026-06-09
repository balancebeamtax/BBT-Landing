import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // BBT design system tokens (from extension-cleanup-review.xml designSystem)
        background: "#F7F5EF",
        surface: "#FFFFFF",
        "surface-alt": "#EEF4F1",
        "text-primary": "#17211F",
        "text-muted": "#5D6863",
        "cta-primary": "#0F5F5C",
        "cta-hover": "#0A4543",
        "accent-copper": "#B87333",
        "text-deadline": "#8A4B1F",
        "warning-background": "#FFF4E6",
        border: "#D9D6CC",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Source Sans 3'", "Arial", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Body default 18px per design system
        base: ["1.125rem", { lineHeight: "1.6" }],
        // Helper/fine-print min 14px
        xs: ["0.875rem", { lineHeight: "1.5" }],
      },
      maxWidth: {
        prose: "70ch",
        container: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
