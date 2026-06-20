import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { BooksRescueFunnel } from "./BooksRescueFunnel";

// Slate Ember typography, scoped to this page via next/font CSS variables.
// Applied on the wrapper below so the `font-display` / `font-jakarta` Tailwind
// tokens resolve here without loading these fonts on other routes.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Books Rescue Diagnostic — How healthy are your books?",
  description:
    "A short diagnostic that scores how healthy your bookkeeping is and tells you the fastest next move. Private, no account needed.",
  alternates: {
    canonical: "/books-rescue-diagnostic",
  },
  openGraph: {
    title: "Books Rescue Diagnostic — How healthy are your books?",
    description:
      "Score where your bookkeeping actually stands and the fastest next move. Free, a couple of minutes.",
    type: "website",
    url: "/books-rescue-diagnostic",
  },
  // Funnel/quiz pages are not indexed (mirrors the prototype's robots:noindex).
  robots: { index: false, follow: false },
};

export default function BooksRescueDiagnosticPage() {
  return (
    <div
      className={`${instrumentSerif.variable} ${plusJakarta.variable} se-theme min-h-[100dvh] bg-se-bg font-jakarta text-se-text`}
    >
      <BooksRescueFunnel />
    </div>
  );
}
