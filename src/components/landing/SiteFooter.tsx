import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/sms-terms", label: "SMS Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface-alt mt-24">
      <div className="mx-auto max-w-container px-6 py-12 grid gap-10 md:grid-cols-3 text-sm">
        <div>
          <p className="font-serif text-lg font-semibold text-text-primary">
            Balance Beam Bookkeeping &amp; Tax
          </p>
          <p className="text-text-muted mt-2 max-w-xs">
            Diagnostic-led bookkeeping cleanup and tax-readiness reviews for
            small-business owners.
          </p>
        </div>

        <div>
          <p className="font-semibold text-text-primary">Contact</p>
          <ul className="mt-3 space-y-2 text-text-muted">
            <li>
              General:{" "}
              <a
                className="text-cta-primary hover:underline"
                href="mailto:admin@balancebeamteam.com"
              >
                admin@balancebeamteam.com
              </a>
            </li>
            <li>
              Appointments:{" "}
              <a
                className="text-cta-primary hover:underline"
                href="mailto:dave.rios@balancebeamteam.com"
              >
                dave.rios@balancebeamteam.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-text-primary">Important</p>
          <p className="text-text-muted mt-3 max-w-xs">
            This site is general information, not advice for your specific
            situation. If you want to talk through how this applies to your
            business, reach out.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-container px-6 py-4 text-xs text-text-muted flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p>© {year} Balance Beam Bookkeeping &amp; Tax. All rights reserved.</p>
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {LEGAL_LINKS.map((link, i) => (
                <span key={link.href} className="inline-flex items-center gap-x-2">
                  {i > 0 && <span aria-hidden="true">·</span>}
                  <Link href={link.href} className="text-cta-primary hover:underline">
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
          <p>Based in Pasadena, California.</p>
        </div>
      </div>
    </footer>
  );
}
