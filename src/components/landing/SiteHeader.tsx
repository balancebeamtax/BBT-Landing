import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-40">
      <div className="mx-auto max-w-container px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-semibold text-text-primary tracking-tight"
        >
          Balance Beam
          <span className="text-text-muted font-sans text-sm font-normal ml-2 hidden sm:inline">
            Bookkeeping &amp; Tax
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href="mailto:admin@balancebeamteam.com"
            className="text-text-muted hover:text-cta-primary transition-colors hidden sm:inline"
          >
            admin@balancebeamteam.com
          </a>
          <a
            href="#intake"
            className="inline-flex items-center justify-center rounded-md bg-cta-primary px-4 py-2 text-sm font-semibold text-white hover:bg-cta-hover transition-colors"
          >
            Request a review
          </a>
        </nav>
      </div>
    </header>
  );
}
