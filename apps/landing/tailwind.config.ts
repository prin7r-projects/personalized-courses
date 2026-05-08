import type { Config } from "tailwindcss";

/**
 * [READING_LIST_TAILWIND] Locked tokens for the personalized-courses landing.
 *
 * Aesthetic: a private tutor's notebook on milky stone — a lifted Anthropic
 * palette (ivory neutrals + dark feature cards + word-level underline
 * emphasis) with the canvas swapped to milky `#FAFAF8` per the no-beige rule.
 * Reading List anchors retained: walnut/oak/sepia ink chain, gilt + marginalia
 * accents, Caveat margin notes.
 *
 * Refresh 2026-05-08 — vellum hex was beige `#EADFC2` and is now milky-ivory
 * `#F0EEE6` (Anthropic paper-2). Source of truth lives in /DESIGN.md §4-6.
 */

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", md: "2.5rem" }
    },
    extend: {
      colors: {
        // Anthropic-derived neutrals (canvas swapped to milky #FAFAF8)
        parchment: "#FAFAF8",       // page itself
        vellum: "#F0EEE6",          // secondary surface — was beige #EADFC2; now milky-ivory
        "paper-3": "#E8E6DC",       // ivory-dark
        "oat-surface": "#E3DACC",   // tertiary surface
        "cloud-light": "#D1CFC5",
        "cloud-medium": "#B0AEA5",
        "cloud-dark": "#87867F",
        "slate-light": "#5E5D59",
        "slate-medium": "#3D3D3A",
        "slate-dark": "#141413",
        // Reading List ink chain (kept)
        walnut: "#3A2A1A",
        oak: "#5C4327",
        sepia: "#8A6E45",
        // Reading List accents
        gilt: "#A87E2C",
        marginalia: "#A4321F",
        scholar: "#3F5A3F",
        // Anthropic accent reserve
        clay: "#D97757"
      },
      fontFamily: {
        // Humanist serif (Anthropic Serif analog) — display + body for long-form
        display: ["EB Garamond", "Garamond", "Georgia", "serif"],
        // Clean grotesque for UI labels (Anthropic Sans analog)
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Handwritten margin notes (Reading List signature)
        margin: ['"Caveat"', "Georgia", "serif"],
        // Mono for kickers / dates (Anthropic Mono analog)
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"]
      },
      maxWidth: {
        prose: "1140px",
        text: "640px"
      },
      borderRadius: {
        none: "0",
        sm: "1px",
        md: "8px",      // Anthropic release-card 8px radius
        lg: "16px",
        "2xl": "24px",  // Anthropic dark feature card radius
        full: "9999px"
      },
      boxShadow: {
        page: "0 1px 0 0 rgba(20,20,19,.06)",
        plate: "0 8px 24px -16px rgba(20,20,19,.18)"
      },
      letterSpacing: {
        tightest: "-0.012em",
        ledger: "0.18em"
      },
      fontSize: {
        // Display rebalanced toward Anthropic 91px / 1.1
        display: ["clamp(60px, 9vw, 96px)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        masthead: ["clamp(40px, 6vw, 61px)", { lineHeight: "1.1", letterSpacing: "-0.012em" }]
      },
      keyframes: {
        underline: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" }
        },
        ink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".55" }
        }
      },
      animation: {
        underline: "underline .35s ease-out forwards",
        ink: "ink 1.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
