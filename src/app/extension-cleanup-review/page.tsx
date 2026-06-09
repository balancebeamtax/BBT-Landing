import type { Metadata } from "next";
import { ExtensionCleanupForm } from "@/components/landing/ExtensionCleanupForm";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrackedCTA } from "@/components/landing/TrackedCTA";
import { PageViewTracker } from "@/components/landing/PageViewTracker";

export const metadata: Metadata = {
  title: "Extension Cleanup Review for Small Business Books",
  description:
    "Filed a tax extension because your books were not ready? Balance Beam helps Schedule C filers, partnerships, and S Corps clean up books before extended filing deadlines.",
  alternates: {
    canonical: "/extension-cleanup-review",
  },
  openGraph: {
    title: "Extension Cleanup Review | Balance Beam",
    description:
      "An extension gives you more time to file. It does not clean up the books. Start with a review.",
    type: "website",
    url: "/extension-cleanup-review",
  },
};

export default function ExtensionCleanupReviewPage() {
  return (
    <>
      <PageViewTracker eventName="extension_cleanup_page_view" />
      <SiteHeader />
      <main id="top" className="bg-background">
        <Hero />
        <Problem />
        <DeadlineUrgency />
        <Benefits />
        <WhatWeReview />
        <WhoFor />
        <WhoNotFor />
        <Process />
        <Differentiators />
        <Objections />
        <MidCTA />
        <IntakeFormSection />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

/* ---------- Section: Hero ---------- */
function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-24 grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-copper">
            For small-business owners on extension
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-text-primary">
            Filed an extension because your books were not ready?
          </h1>
          <p className="mt-6 text-lg text-text-muted max-w-prose">
            An extension gives you more time to file. It does not clean up the
            books. Balance Beam helps small-business owners review, organize,
            and clean up the bookkeeping issues that delay tax preparation.
          </p>
          <p className="mt-4 text-base text-text-muted max-w-prose">
            If your 2025 tax return was extended because the books were behind,
            unreconciled, or unclear, the deadline is still coming. The right
            next step is not to wait until September or October. It is to find
            out what needs to be fixed before the return can be prepared.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <TrackedCTA
              href="#intake"
              label="Request an Extension Cleanup Review"
              variant="primary"
              eventName="extension_cleanup_primary_cta_click"
              eventParams={{ location: "hero" }}
            />
            <TrackedCTA
              href="#what-we-review"
              label="See what we review"
              variant="secondary"
              eventName="extension_cleanup_secondary_cta_click"
              eventParams={{ location: "hero" }}
            />
          </div>

          <p className="mt-6 text-sm text-text-muted max-w-prose">
            For Schedule C filers, single-member LLCs, partnerships, S
            corporations, and small-business owners who need tax-ready books
            before filing.
          </p>
        </div>

        <div className="hidden md:block">
          <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
            <p className="font-serif text-2xl text-text-primary">
              The extension solved the filing deadline.
            </p>
            <p className="mt-3 text-text-muted">
              It did not solve the bookkeeping problem.
            </p>
            <div className="mt-6 h-px bg-border" />
            <ul className="mt-6 space-y-3 text-sm text-text-primary">
              <li>• Behind on reconciliations</li>
              <li>• QuickBooks does not match bank balances</li>
              <li>• Personal and business activity mixed</li>
              <li>• Preparer asked for cleaner reports</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section: Problem ---------- */
function Problem() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary max-w-3xl">
          The extension solved the filing deadline. It did not solve the
          bookkeeping problem.
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-prose-wide">
          <p className="text-text-muted text-lg leading-relaxed">
            Many small-business owners file extensions because the tax return
            cannot be prepared from the information available in March or
            April. The issue is often not the tax form itself. The issue is
            that the books are behind, accounts are not reconciled,
            transactions are unclear, or the reports cannot be trusted yet.
          </p>
          <p className="text-text-muted text-lg leading-relaxed">
            That is fixable, but it needs a process. Waiting until the extended
            deadline gets closer usually creates the same problem again, only
            with less time to clean it up.
          </p>
        </div>
        <div className="mt-10 rounded-lg border-l-4 border-accent-copper bg-warning-background px-6 py-5 max-w-3xl">
          <p className="text-text-deadline font-semibold">
            If the books were not ready by the original deadline, they need
            attention before the extended deadline.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section: Deadline Urgency ---------- */
function DeadlineUrgency() {
  const cards = [
    {
      title: "Schedule C filers and single-member LLCs",
      deadline: "October 15, 2026",
      body: "If you report business income on Schedule C with your individual Form 1040 and filed a valid extension, your extended federal filing deadline is generally October 15, 2026.",
      cta: "Start my October 15 cleanup review",
    },
    {
      title: "Partnerships and multi-member LLCs",
      deadline: "September 15, 2026",
      body: "If your calendar-year partnership filed an extension for Form 1065, your extended federal filing deadline is generally September 15, 2026.",
      cta: "Start my September 15 cleanup review",
    },
    {
      title: "S corporations",
      deadline: "September 15, 2026",
      body: "If your calendar-year S corporation filed an extension for Form 1120-S, your extended federal filing deadline is generally September 15, 2026.",
      cta: "Start my September 15 cleanup review",
    },
  ];

  return (
    <section id="deadlines" className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          Know the deadline you are working toward.
        </h2>
        <p className="mt-4 text-text-muted text-lg max-w-3xl">
          Different business types have different extended federal filing
          deadlines. Your entity type matters, and cleanup should start early
          enough to leave time for tax preparation after the books are ready.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl bg-warning-background border border-accent-copper/30 p-6 flex flex-col"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-copper">
                Extended deadline
              </p>
              <p className="mt-2 font-serif text-2xl font-semibold text-text-deadline">
                {card.deadline}
              </p>
              <h3 className="mt-4 font-serif text-xl text-text-primary">
                {card.title}
              </h3>
              <p className="mt-3 text-text-muted text-base leading-relaxed flex-1">
                {card.body}
              </p>
              <div className="mt-6">
                <TrackedCTA
                  href="#intake"
                  label={card.cta}
                  variant="primary"
                  eventName="extension_cleanup_primary_cta_click"
                  eventParams={{
                    location: "deadline_card",
                    deadline: card.deadline,
                  }}
                  className="w-full text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-text-muted max-w-3xl">
          An extension is generally an extension of time to file, not an
          extension of time to pay. If you are unsure what applies to your
          situation, talk with your tax professional.
        </p>
      </div>
    </section>
  );
}

/* ---------- Section: Benefits ---------- */
function Benefits() {
  const bullets = [
    "Identify whether your books are ready for tax preparation.",
    "Find unreconciled bank and credit card accounts.",
    "Spot owner draws, transfers, and personal expenses that need review.",
    "Determine whether QuickBooks cleanup is needed before filing.",
    "Separate bookkeeping cleanup from tax preparation scope.",
    "Create a document request list so missing records are easier to track.",
    "Build a clear path from extension to filing.",
    "Decide whether monthly bookkeeping should begin after the cleanup is complete.",
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          What an Extension Cleanup Review helps you clarify
        </h2>
        <ul className="mt-10 grid gap-x-8 gap-y-4 md:grid-cols-2 max-w-4xl">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-text-primary">
              <CheckIcon />
              <span className="text-base leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Section: What We Review ---------- */
function WhatWeReview() {
  const items = [
    "Bank and credit card reconciliation status",
    "Missing or incomplete statements",
    "Uncategorized transactions",
    "Misclassified income or expenses",
    "Owner draws, distributions, transfers, and reimbursements",
    "Personal expenses paid from business accounts",
    "Duplicate income or missing deposits",
    "Payroll or contractor payment issues that affect the books",
    "QuickBooks chart of accounts issues",
    "Year-end reports needed for tax preparation",
    "Whether prior months need catch-up bookkeeping",
  ];

  return (
    <section id="what-we-review" className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          What Balance Beam looks at
        </h2>
        <p className="mt-4 text-text-muted text-lg max-w-3xl">
          The review is designed to identify the bookkeeping issues that may
          prevent your tax return from being prepared accurately and
          efficiently. It is not a shortcut around cleanup. It is the first
          step in understanding what cleanup is actually required.
        </p>
        <ul className="mt-10 grid gap-x-8 gap-y-4 md:grid-cols-2 max-w-4xl">
          {items.map((b) => (
            <li key={b} className="flex gap-3 text-text-primary">
              <CheckIcon />
              <span className="text-base leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Section: Who For ---------- */
function WhoFor() {
  const bullets = [
    "You filed an extension because your books were not ready.",
    "Your tax preparer asked for cleaner reports.",
    "You are behind on bookkeeping for 2025.",
    "Your QuickBooks file does not match your bank balances.",
    "You are not sure whether your profit and loss report is accurate.",
    "You have business and personal activity mixed together.",
    "You need cleanup before tax preparation can move forward.",
    "You want to avoid repeating the same extension cycle next year.",
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          This is for you if:
        </h2>
        <ul className="mt-10 grid gap-x-8 gap-y-4 md:grid-cols-2 max-w-4xl">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-text-primary">
              <CheckIcon />
              <span className="text-base leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Section: Who Not For ---------- */
function WhoNotFor() {
  const bullets = [
    "Your books are already reconciled and tax-ready.",
    "You only need someone to e-file a completed return.",
    "You are looking for a no-records estimate.",
    "You do not want to provide statements, reports, or accounting access.",
    "You are only looking for the cheapest possible bookkeeping option.",
  ];
  return (
    <section className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          This is probably not the right fit if:
        </h2>
        <ul className="mt-10 grid gap-x-8 gap-y-4 md:grid-cols-2 max-w-4xl">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-text-muted">
              <DashIcon />
              <span className="text-base leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Section: Process ---------- */
function Process() {
  const steps = [
    {
      title: "Complete the intake",
      body: "Tell us your entity type, deadline, bookkeeping status, accounting software, and what is blocking tax preparation.",
    },
    {
      title: "Schedule a consultation",
      body: "We review your intake and talk through whether you need cleanup, catch-up bookkeeping, tax preparation support, or monthly bookkeeping after filing.",
    },
    {
      title: "Identify what is missing",
      body: "We help clarify which statements, reports, accounts, and records are needed before the books can support tax preparation.",
    },
    {
      title: "Get a recommended path",
      body: "You receive a clear next step: cleanup, monthly bookkeeping, tax prep plus books review, back-filing support, or another path if Balance Beam is not the right fit.",
    },
    {
      title: "Move into a structured workflow",
      body: "If we work together, the engagement moves through a secure, organized workflow with document requests, task status, and next steps clearly tracked.",
    },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          How the Extension Cleanup Review works
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {steps.map((step, idx) => (
            <li key={step.title} className="flex gap-5">
              <div
                aria-hidden
                className="flex-shrink-0 w-10 h-10 rounded-full bg-cta-primary text-white font-serif text-lg font-semibold flex items-center justify-center"
              >
                {idx + 1}
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-text-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Section: Differentiators ---------- */
function Differentiators() {
  const bullets = [
    "Secure document collection",
    "Clear intake questions",
    "Defined cleanup scope",
    "Tax-ready bookkeeping focus",
    "Founder-led review and communication",
    "Year-round bookkeeping path after filing",
    "Portal-driven workflow instead of loose email threads",
  ];
  return (
    <section className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary max-w-3xl">
          Bookkeeping cleanup should not live in scattered emails.
        </h2>
        <p className="mt-4 text-text-muted text-lg max-w-3xl">
          Balance Beam uses a structured client workflow to reduce the
          back-and-forth that often slows down cleanup and tax preparation. The
          goal is simple: know what is missing, know what is being reviewed,
          and know what happens next.
        </p>
        <ul className="mt-10 grid gap-x-8 gap-y-4 md:grid-cols-2 max-w-4xl">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-text-primary">
              <CheckIcon />
              <span className="text-base leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Section: Objections ---------- */
function Objections() {
  const items = [
    {
      q: "“I already filed an extension, so I have time.”",
      a: "You have more time to file, but the books still need to be reviewed and cleaned up before the return can be prepared. The longer cleanup waits, the less time remains for tax preparation.",
    },
    {
      q: "“I just need someone to do my taxes.”",
      a: "If the books are clean, tax preparation may be straightforward. If the books are not ready, the tax return depends on cleanup first. Balance Beam can help determine which situation you are in.",
    },
    {
      q: "“My books are in QuickBooks, so they should be fine.”",
      a: "QuickBooks is a tool. The file still needs reconciled accounts, accurate categories, and properly handled owner transactions. A report from QuickBooks is only useful if the activity behind it has been reviewed.",
    },
    {
      q: "“I do not know how far behind I am.”",
      a: "That is exactly why the review exists. The first step is identifying what months, accounts, and records need attention.",
    },
    {
      q: "“Can you just give me a monthly bookkeeping price?”",
      a: "Monthly bookkeeping pricing depends on whether the books are current or need cleanup first. If prior activity is unreliable, cleanup should be scoped separately before monthly service begins.",
    },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          Common questions and concerns
        </h2>
        <div className="mt-10 grid gap-6 max-w-4xl">
          {items.map((item) => (
            <div
              key={item.q}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-text-primary">
                {item.q}
              </h3>
              <p className="mt-2 text-text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section: Mid CTA ---------- */
function MidCTA() {
  return (
    <section className="border-b border-border bg-cta-primary text-white">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold max-w-3xl mx-auto">
          Do not wait until the extended deadline to find out your books still
          are not ready.
        </h2>
        <p className="mt-4 text-base md:text-lg text-white/90 max-w-2xl mx-auto">
          Start with a review. We will help you understand what needs cleanup,
          what records are missing, and what path makes sense before filing.
        </p>
        <div className="mt-8 flex justify-center">
          <TrackedCTA
            href="#intake"
            label="Request an Extension Cleanup Review"
            variant="secondary"
            eventName="extension_cleanup_primary_cta_click"
            eventParams={{ location: "mid_cta" }}
            className="bg-white text-cta-primary border-white hover:bg-warning-background hover:text-cta-primary"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Section: Intake Form ---------- */
function IntakeFormSection() {
  return (
    <section id="intake" className="border-b border-border scroll-mt-20">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          Request an Extension Cleanup Review
        </h2>
        <p className="mt-4 text-text-muted text-lg">
          Complete this short intake so we can understand your entity type,
          filing deadline, bookkeeping status, and what is holding up tax
          preparation.
        </p>
        <div className="mt-10">
          <ExtensionCleanupForm />
        </div>
      </div>
    </section>
  );
}

/* ---------- Section: FAQ ---------- */
function FAQ() {
  const items = [
    {
      q: "Does filing an extension mean I have more time to pay?",
      a: "Generally, no. An extension gives more time to file the return, not more time to pay tax that was due by the original deadline. If you are unsure whether you paid enough with your extension, talk with your tax professional.",
    },
    {
      q: "What if I do not know whether I am a Schedule C filer, partnership, or S corporation?",
      a: "That is common. The intake form includes an “I’m not sure” option. We can help identify the filing path based on your business structure and prior-year return, but formal advice requires an engagement.",
    },
    {
      q: "Can you prepare the tax return too?",
      a: "Balance Beam provides tax preparation and bookkeeping services. If your books need cleanup before the return can be prepared, we will separate the cleanup scope from the tax preparation scope so the work is clear.",
    },
    {
      q: "What if my tax preparer already filed the extension?",
      a: "That is fine. The review focuses on the bookkeeping issues that may still need to be resolved before the return can be prepared. If another preparer is filing the return, the goal may be to provide cleaner reports and records for that preparer.",
    },
    {
      q: "What if I use QuickBooks?",
      a: "QuickBooks helps organize the records, but it does not guarantee the books are accurate. Accounts still need to be reconciled, transactions reviewed, and owner activity handled correctly.",
    },
    {
      q: "Do I need cleanup or monthly bookkeeping?",
      a: "It depends on whether the books are current and reliable. If prior activity is incomplete or inaccurate, cleanup usually comes first. Monthly bookkeeping can begin after the file is stable.",
    },
    {
      q: "How fast can cleanup be completed?",
      a: "Timing depends on the number of months, accounts, missing records, and complexity of the business. The review helps determine the likely scope and next steps.",
    },
    {
      q: "Is this only for California businesses?",
      a: "Balance Beam is based in California and works heavily with California small-business compliance, but the review may be relevant to business owners outside California as well. State-specific requirements should be confirmed during the consultation.",
    },
    {
      q: "Is this tax advice?",
      a: "This page is general information, not advice for your specific situation. If you want to talk through how this applies to your business, reach out.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary">
          Frequently asked questions
        </h2>
        <div className="mt-10 divide-y divide-border rounded-lg border border-border bg-surface">
          {items.map((item) => (
            <details key={item.q} className="group p-6">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-serif text-lg font-semibold text-text-primary">
                <span>{item.q}</span>
                <span
                  aria-hidden
                  className="mt-1 text-cta-primary transition-transform group-open:rotate-45 text-2xl leading-none"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-text-muted leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section: Final CTA ---------- */
function FinalCTA() {
  return (
    <section className="">
      <div className="mx-auto max-w-container px-6 py-20 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary max-w-3xl mx-auto">
          Your extended deadline is closer than it feels.
        </h2>
        <p className="mt-4 text-text-muted text-lg max-w-2xl mx-auto">
          If your return was extended because the books were not ready, now is
          the time to review the file, identify what is missing, and build a
          path to filing.
        </p>
        <div className="mt-8 flex justify-center">
          <TrackedCTA
            href="#intake"
            label="Start the Extension Cleanup Review"
            variant="primary"
            eventName="extension_cleanup_primary_cta_click"
            eventParams={{ location: "final_cta" }}
          />
        </div>
        <p className="mt-6 text-sm text-text-muted max-w-2xl mx-auto">
          Balance Beam will help you determine whether you need cleanup,
          catch-up bookkeeping, tax preparation support, or a monthly
          bookkeeping process after filing.
        </p>
      </div>
    </section>
  );
}

/* ---------- Icons ---------- */
function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="mt-1 h-5 w-5 flex-shrink-0 text-cta-primary"
    >
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="mt-1 h-5 w-5 flex-shrink-0 text-text-muted"
    >
      <path
        d="M5 10h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
