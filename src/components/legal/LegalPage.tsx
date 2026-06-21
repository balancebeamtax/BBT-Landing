import type { ReactNode } from "react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

/**
 * Shared shell for the static compliance pages (/privacy, /terms, /disclaimer,
 * /sms-terms, /contact). Renders the shared header/footer and a readable prose
 * column (max-w-prose, serif headings, sans body) using existing BBT tokens.
 * The header CTA points at the home router (/#start) so it never lands on a
 * dead in-page anchor.
 */
export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader ctaHref="/#start" ctaLabel="Find your starting point" ctaLabelShort="Start here" />
      <main className="bg-background">
        <article className="mx-auto max-w-prose px-6 py-16 md:py-20">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight text-text-primary">
            {title}
          </h1>
          {effectiveDate && (
            <p className="mt-4 text-sm text-text-muted">
              Effective date: {effectiveDate}
            </p>
          )}
          <div className="mt-8 space-y-6 text-text-muted leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

/** Run-in section label (bold lead-in) used inside legal paragraphs. */
export function Lead({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-text-primary">{children}</strong>
  );
}
