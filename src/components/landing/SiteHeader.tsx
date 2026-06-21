import Link from "next/link";

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  ctaHref = "#intake",
  ctaLabel = "Request a review",
}: SiteHeaderProps = {}) {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-40">
      <div className="mx-auto max-w-container px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <img src="/balance-beam-lockup.svg" alt="Balance Beam Bookkeeping & Tax" className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href="mailto:admin@balancebeamteam.com"
            className="text-text-muted hover:text-cta-primary transition-colors hidden sm:inline"
          >
            admin@balancebeamteam.com
          </a>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-md bg-cta-primary px-4 py-2 text-sm font-semibold text-white hover:bg-cta-hover transition-colors"
          >
            {ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  );
}
