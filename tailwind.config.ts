import type { Config } from "tailwindcss";

// The design tokens live in src/app/globals.css as CSS variables.
// Tailwind maps to them here so utilities (bg-surface, text-fg-soft, etc.) stay in sync.
// See docs/DESIGN_GUIDE.md for the full system.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        fg: "var(--fg)",
        "fg-soft": "var(--fg-soft)",
        "fg-faint": "var(--fg-faint)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        violet: "var(--violet)",
        "violet-soft": "var(--violet-soft)",
        good: "var(--good)",
        warn: "var(--warn)",
        crit: "var(--crit)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      borderRadius: {
        lg: "var(--r-lg)",
        md: "var(--r-md)",
        sm: "var(--r-sm)",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
