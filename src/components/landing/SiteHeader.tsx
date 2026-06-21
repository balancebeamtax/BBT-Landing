import Link from "next/link";

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
  /** Optional shorter CTA label shown on narrow (mobile) viewports; the full
   *  ctaLabel is restored at sm: and up. Falls back to ctaLabel when omitted. */
  ctaLabelShort?: string;
};

export function SiteHeader({
  ctaHref = "#intake",
  ctaLabel = "Request a review",
  ctaLabelShort,
}: SiteHeaderProps = {}) {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-40">
      <div className="mx-auto max-w-container px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0">
          <img src="/balance-beam-lockup.svg" alt="Balance Beam Bookkeeping & Tax" className="h-8 w-auto sm:h-10" />
        </Link>
        <nav className="flex min-w-0 items-center gap-4 text-sm sm:gap-6">
          <a
            href="mailto:admin@balancebeamteam.com"
            className="text-text-muted hover:text-cta-primary transition-colors hidden sm:inline"
          >
            admin@balancebeamteam.com
          </a>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-cta-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-cta-hover transition-colors sm:px-4 sm:py-2 sm:text-sm"
          >
            {ctaLabelShort ? (
              <>
                <span className="sm:hidden">{ctaLabelShort}</span>
                <span className="hidden sm:inline">{ctaLabel}</span>
              </>
            ) : (
              ctaLabel
            )}
          </a>
        </nav>
      </div>
    </header>
  );
}
