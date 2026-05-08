import type { Config } from "tailwindcss";

/**
 * [READING_LIST_TAILWIND] Locked tokens for the personalized-courses landing.
 *
 * Aesthetic: a private tutor's notebook — warm parchment paper, walnut ink,
 * gilt accents, marginalia-red for editorial flourish. The palette is
 * explicitly anti-edtech (no blue/orange) and anti-AI (no purple gradient).
 *
 * Source of truth for the Reading List palette + type pair. Mirrored in
 * `app/globals.css` and documented in /DESIGN.md sections 4-6.
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
        // Library-shelf neutrals
        parchment: "#FAFAF8",  // warm aged paper, the page itself
        vellum: "#EADFC2",     // a lighter alternate page (cards on parchment)
        walnut: "#3A2A1A",     // the ink — heaviest text
        oak: "#5C4327",        // body text in long passages
        sepia: "#8A6E45",      // muted captions, kickers
        // Accents
        gilt: "#A87E2C",       // a single gold line, like a foil-stamped letter
        marginalia: "#A4321F", // editor's red pen — used sparingly
        scholar: "#3F5A3F"     // an alternate marker for "completed" / "passed"
      },
      fontFamily: {
        // Humanist serif — display + body for long-form
        display: ["EB Garamond", "Garamond", "Georgia", "serif"],
        // Clean grotesque for UI labels
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Handwritten margin notes
        margin: ['"Caveat"', "Georgia", "serif"],
        // Mono for kickers / dates
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"]
      },
      maxWidth: {
        prose: "1140px",
        text: "640px"
      },
      borderRadius: {
        none: "0",
        sm: "1px",
        md: "2px",
        full: "9999px"
      },
      boxShadow: {
        page: "0 1px 0 0 rgba(58,42,26,.06)",
        plate: "0 8px 24px -16px rgba(58,42,26,.32)"
      },
      letterSpacing: {
        tightest: "-0.012em",
        ledger: "0.18em"
      },
      fontSize: {
        display: ["112px", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        masthead: ["56px", { lineHeight: "1.04", letterSpacing: "-0.012em" }]
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
