import type { Metadata } from "next";
import { LegalPage, Lead } from "@/components/legal/LegalPage";
import { EFFECTIVE_DATE } from "@/lib/effective-date";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that govern your use of balancebeamteam.com.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const linkClass = "text-cta-primary hover:underline";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" effectiveDate={EFFECTIVE_DATE}>
      <p>
        By accessing balancebeamteam.com (the “Site”), you agree to these Terms.
        If you do not agree, please do not use the Site.
      </p>

      <p>
        <Lead>Informational purpose only; no professional relationship.</Lead>{" "}
        The Site — including all pages, blog posts, tools, downloads, diagnostic
        results, and ad or landing-page content — is provided for general
        informational and educational purposes. It does not constitute tax,
        legal, accounting, or financial advice, and using the Site, submitting a
        form, or receiving a diagnostic result does not create a client,
        advisory, or professional engagement. A professional relationship is
        formed only through a separate, signed service agreement.
      </p>

      <p>
        <Lead>Acceptable use.</Lead> You agree not to misuse the Site, interfere
        with its operation, attempt unauthorized access, or submit false
        information or another person’s information without authorization.
      </p>

      <p>
        <Lead>Intellectual property.</Lead> The Site’s content, branding, and
        design are owned by us or our licensors and may not be copied or reused
        without permission.
      </p>

      <p>
        <Lead>Third-party services.</Lead> The Site links to or embeds
        third-party services (such as Calendly). We are not responsible for their
        content, availability, or practices; their terms and privacy policies
        govern your use of them.
      </p>

      <p>
        <Lead>Disclaimer of warranties.</Lead> The Site is provided “as is” and
        “as available,” without warranties of any kind, express or implied,
        including accuracy, fitness for a particular purpose, or uninterrupted
        availability.
      </p>

      <p>
        <Lead>Limitation of liability.</Lead> To the fullest extent permitted by
        law, Balance Beam Corporation is not liable for any indirect, incidental,
        consequential, or punitive damages, or any loss arising from your use of,
        or reliance on, the Site or its content.
      </p>

      <p>
        <Lead>Changes.</Lead> We may update these Terms and will revise the
        effective date above.
      </p>

      <p>
        <Lead>Governing law.</Lead> These Terms are governed by the laws of the
        State of California, without regard to conflict-of-laws rules.
      </p>

      <p>
        <Lead>Contact.</Lead>{" "}
        <a href="mailto:admin@balancebeamteam.com" className={linkClass}>
          admin@balancebeamteam.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
