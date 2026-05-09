import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Curriculum7 · your course, built for one",
  description:
    "A personalized-course studio for self-directed adult learners. One goal, one syllabus, weekly drips, graded work.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment text-walnut antialiased">
        <a
          href="#main-content"
          className="skip-link absolute left-[-9999px] top-2 z-50 bg-walnut text-parchment px-3 py-2 font-mono text-[11px] uppercase tracking-ledger focus:left-2"
        >
          Skip to content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
