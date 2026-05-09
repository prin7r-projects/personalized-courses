import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", md: "2.5rem" },
    },
    extend: {
      colors: {
        parchment: "#FAFAF8",
        vellum: "#F5F3F1",
        "paper-3": "#EDEBE4",
        "oat-surface": "#E5E2D8",
        "cloud-light": "#D1CFC5",
        "cloud-medium": "#B0AEA5",
        "cloud-dark": "#87867F",
        "slate-light": "#5E5D59",
        "slate-medium": "#3D3D3A",
        "slate-dark": "#141413",
        walnut: "#3A2A1A",
        oak: "#5C4327",
        sepia: "#8A6E45",
        gilt: "#A87E2C",
        marginalia: "#A4321F",
        scholar: "#3F5A3F",
        clay: "#D97757",
      },
      fontFamily: {
        display: ["EB Garamond", "Garamond", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        margin: ['"Caveat"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "1140px",
        text: "640px",
      },
      borderRadius: {
        none: "0",
        sm: "1px",
        md: "8px",
        lg: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        page: "0 1px 0 0 rgba(20,20,19,.06)",
        plate: "0 8px 24px -16px rgba(20,20,19,.18)",
      },
      letterSpacing: {
        tightest: "-0.012em",
        ledger: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
