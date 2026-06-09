import Link from "next/link";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <section className="mx-auto max-w-container px-6 py-24 md:py-32">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-copper">
            Balance Beam Bookkeeping &amp; Tax
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl font-semibold text-text-primary max-w-3xl">
            Small-business bookkeeping and tax preparation, built for a
            year-round relationship.
          </h1>
          <p className="mt-6 text-text-muted text-lg max-w-prose">
            We help Schedule C filers, single-member LLCs, partnerships, and S
            corporations stay compliant, organized, and proactive across tax
            preparation, bookkeeping, and tax resolution.
          </p>

          <div className="mt-10 grid gap-4 max-w-xl">
            <Link
              href="/extension-cleanup-review"
              className="rounded-lg border border-border bg-surface p-6 hover:border-cta-primary transition-colors"
            >
              <p className="font-serif text-xl text-text-primary">
                Filed an extension because your books were not ready?
              </p>
              <p className="mt-2 text-text-muted">
                Request an Extension Cleanup Review →
              </p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
