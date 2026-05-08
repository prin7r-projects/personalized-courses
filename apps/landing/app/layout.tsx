import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Curriculum7 — Personalized courses on demand · Custom syllabus, dripped weekly",
  description:
    "Tell Curriculum7 your goal and your current level. Get back a personalized syllabus — videos, readings, exercises, evaluations — generated for you and dripped at a sustainable pace. $149 single course, $39/mo subscription, $299/mo coach-augmented. Crypto checkout, no edtech bloat.",
  metadataBase: new URL("https://curriculum7.com"),
  openGraph: {
    title: "Curriculum7 — Personalized courses on demand",
    description:
      "A private syllabus-of-one. Declare your goal, get a course built around it, and learn it on a schedule that respects how adults actually study.",
    url: "https://curriculum7.com",
    siteName: "Curriculum7",
    type: "website"
  },
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#hero" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
