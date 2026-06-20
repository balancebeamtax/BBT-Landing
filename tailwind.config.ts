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

        // Slate Ember palette (IMP-233 Books Rescue funnel only). Values resolve
        // from CSS variables scoped to the `.se-theme` wrapper in globals.css, so
        // they flip light/dark via prefers-color-scheme without touching the
        // shared design-system tokens above or the Extension Cleanup page. Stored
        // as RGB channel triplets so Tailwind opacity modifiers (e.g. /12) work.
        "se-bg": "rgb(var(--se-bg) / <alpha-value>)",
        "se-surface": "rgb(var(--se-surface) / <alpha-value>)",
        "se-surface-2": "rgb(var(--se-surface-2) / <alpha-value>)",
        "se-surface-offset": "rgb(var(--se-surface-offset) / <alpha-value>)",
        "se-border": "rgb(var(--se-border) / <alpha-value>)",
        "se-text": "rgb(var(--se-text) / <alpha-value>)",
        "se-muted": "rgb(var(--se-muted) / <alpha-value>)",
        "se-inverse": "rgb(var(--se-inverse) / <alpha-value>)",
        "se-primary": "rgb(var(--se-primary) / <alpha-value>)",
        "se-primary-hover": "rgb(var(--se-primary-hover) / <alpha-value>)",
        "se-accent": "rgb(var(--se-accent) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Source Sans 3'", "Arial", "system-ui", "sans-serif"],
        // Books Rescue (Slate Ember) — scoped via next/font variables on the page.
        display: ["var(--font-instrument-serif)", "Georgia", "serif"],
        jakarta: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
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
