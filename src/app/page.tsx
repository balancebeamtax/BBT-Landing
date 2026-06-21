import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrackedCTA } from "@/components/landing/TrackedCTA";

/**
 * Homepage = problem-first, multi-funnel routing hub.
 * New funnels drop in as additional FUNNEL_CARDS entries — no redesign.
 * Per-card accent classes are written as full literal strings so Tailwind's
 * JIT picks them up (the Books Rescue teal #017B82 is the funnel's real
 * se-primary, used here for true message-match into the cover).
 */
type FunnelCard = {
  slug: string;
  href: string;
  headline: string;
  subcopy: string;
  ctaLabel: string;
  accentBar: string;
  accentIcon: string;
  Icon: () => JSX.Element;
};

const FUNNEL_CARDS: FunnelCard[] = [
  {
    slug: "extension-cleanup-review",
    href: "/extension-cleanup-review",
    headline: "Filed an extension because your books weren't ready?",
    subcopy:
      "The extension bought time to file — not clean books. Start with a review that finds what needs fixing before the deadline.",
    ctaLabel: "Start an Extension Cleanup Review →",
    accentBar: "bg-accent-copper",
    accentIcon: "bg-warning-background text-accent-copper",
    Icon: CalendarChecklistIcon,
  },
  {
    slug: "books-rescue-diagnostic",
    href: "/books-rescue-diagnostic",
    headline: "Not sure your books can be trusted?",
    subcopy:
      "A 2-minute, 7-question diagnostic that scores where your bookkeeping stands and names the fastest next move. Private, no account needed.",
    ctaLabel: "Take the Books Rescue Diagnostic →",
    accentBar: "bg-[#017B82]",
    accentIcon: "bg-[#017B82]/10 text-[#017B82]",
    Icon: HealthGaugeIcon,
  },
];

const TRUST_SIGNALS = [
  "Credentialed CPA & EA team",
  "Secure intake",
  "Private — no account needed",
  "Based in Pasadena, CA",
];

export default function HomePage() {
  return (
    <>
      <SiteHeader ctaHref="#start" ctaLabel="Find your starting point" />
      <main className="bg-background">
        {/* Hero / router */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-container px-6 py-20 md:py-28">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-copper">
              Bookkeeping cleanup &amp; tax-readiness diagnostics
            </p>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-text-primary max-w-3xl">
              Choose the fastest path to clean, tax-ready books.
            </h1>
            <p className="mt-6 text-lg text-text-muted max-w-prose">
              Filed an extension or behind on your books? Start with the path
              that fits your situation.
            </p>
          </div>
        </section>

        {/* Card grid — header CTA scrolls here */}
        <section
          id="start"
          className="scroll-mt-20 border-b border-border bg-surface-alt"
        >
          <div className="mx-auto max-w-container px-6 py-16 md:py-20">
            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {FUNNEL_CARDS.map((card) => (
                <div
                  key={card.slug}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-8 shadow-sm"
                >
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-1.5 ${card.accentBar}`}
                  />
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.accentIcon}`}
                  >
                    <card.Icon />
                  </div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold text-text-primary">
                    {card.headline}
                  </h2>
                  <p className="mt-3 flex-1 text-text-muted leading-relaxed">
                    {card.subcopy}
                  </p>
                  <div className="mt-8">
                    <TrackedCTA
                      href={card.href}
                      label={card.ctaLabel}
                      variant="primary"
                      eventName="homepage_card_click"
                      eventParams={{
                        destination: card.slug,
                        location: "homepage_hub",
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-text-muted">
              Not sure which fits?{" "}
              <a
                href="mailto:admin@balancebeamteam.com"
                className="font-semibold text-cta-primary hover:underline"
              >
                Tell us about your situation
              </a>
            </p>
          </div>
        </section>

        {/* Thin trust band — kept compact so a card stays within ~one scroll */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-container px-6 py-8">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-text-muted">
              {TRUST_SIGNALS.map((signal) => (
                <li key={signal} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-cta-primary"
                  />
                  {signal}
                </li>
              ))}
            </ul>
            {/* TODO: real testimonial — do not fabricate */}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/* ---------- Icons (accent color inherited via currentColor) ---------- */
function CalendarChecklistIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect
        x="3"
        y="4.5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 9h18M8 3v3M16 3v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.5 14.5l2 2 4-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HealthGaugeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M3 12h3l2-5 3 10 2.5-6 1.5 3h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
