import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Lead } from "@/components/legal/LegalPage";
import { EFFECTIVE_DATE } from "@/lib/effective-date";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Balance Beam Bookkeeping & Tax collects, uses, and shares information when you use balancebeamteam.com.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const linkClass = "text-cta-primary hover:underline";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        This Privacy Policy explains how Balance Beam Corporation, a California
        corporation doing business as Balance Beam Bookkeeping &amp; Tax
        (“Balance Beam,” “we,” “us”), collects, uses, and shares information when
        you visit balancebeamteam.com (the “Site”) or submit a form, request a
        review, or schedule time with us.
      </p>

      <p>
        <Lead>Information you provide.</Lead> When you complete a form or
        booking, we collect the information you submit, which may include: your
        name, email address, phone number, business name and website, and
        details about your business and bookkeeping situation (such as entity
        type, state, industry, accounting software, revenue range, filing
        status, and the issues you describe), along with any notes you choose to
        add.
      </p>

      <p>
        <Lead>Information collected automatically.</Lead> When you use the Site
        we may collect device and usage information (such as IP address, browser
        type, pages viewed, and referring URLs) through cookies and similar
        technologies. We use Google Analytics 4 and Google Tag Manager to
        understand Site usage and measure the performance of our marketing. We
        also capture marketing attribution identifiers — including UTM
        parameters and advertising click identifiers such as Google’s gclid and
        Meta’s fbclid — when you arrive from an ad or campaign link, and we store
        them with your inquiry.
      </p>

      <p>
        <Lead>Online advertising.</Lead> We use Google services for analytics and
        advertising measurement. Third-party vendors, including Google, may use
        cookies or device identifiers based on your past visits to the Site to
        help us measure and serve advertising across the internet. You can
        control personalized advertising through your Google Ads Settings (
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          adssettings.google.com
        </a>
        ) and through industry opt-out tools at{" "}
        <a
          href="https://optout.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          optout.aboutads.info
        </a>{" "}
        and{" "}
        <a
          href="https://youronlinechoices.eu"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          youronlinechoices.eu
        </a>
        . We do not currently run an in-browser Meta Pixel or Google Ads
        conversion tag, but we do receive and store ad-click identifiers as
        described above.
      </p>

      <p>
        <Lead>How we use information.</Lead> To respond to your inquiry; provide
        and follow up on bookkeeping, tax preparation, and tax-resolution
        services; communicate with you by email, phone, and — where you have
        opted in — text message; schedule appointments; operate, secure, and
        improve the Site; measure and improve our marketing; and comply with
        legal obligations.
      </p>

      <p>
        <Lead>How we share information.</Lead> We do not sell your personal
        information. We share it with service providers who process it on our
        behalf, including: GoHighLevel (LeadConnector) — our CRM and email/SMS
        follow-up platform; n8n — workflow automation that routes diagnostic
        submissions to our CRM; Calendly — appointment scheduling (receives the
        name, email, phone, and time you provide when booking); Cloudflare
        (Turnstile) — bot/abuse protection on our forms, when enabled; Upstash —
        server-side rate limiting (processes IP address to prevent abuse); and
        Google (Analytics / Tag Manager) — Site analytics and advertising
        measurement. We may also disclose information to comply with law, enforce
        our terms, or protect our rights, and in connection with a business
        transfer.
      </p>

      <p>
        <Lead>Text messaging.</Lead> If you opt in, we send text messages related
        to your inquiry and our services. Consent to texts is not a condition of
        any purchase. Message frequency varies; message and data rates may apply;
        reply STOP to opt out or HELP for help. See our{" "}
        <Link href="/sms-terms" className={linkClass}>
          SMS Terms
        </Link>
        .
      </p>

      <p>
        <Lead>Email.</Lead> Our marketing emails include an unsubscribe link; you
        can opt out at any time. Transactional messages about an active request
        may still be sent.
      </p>

      <p>
        <Lead>Cookies &amp; choices.</Lead> Most browsers let you refuse or
        delete cookies; doing so may affect Site functionality. Analytics and
        advertising cookies load only when the corresponding Google tools are
        enabled.
      </p>

      <p>
        <Lead>Data retention &amp; security.</Lead> We keep information for as
        long as needed to provide services and meet legal, accounting, and
        reporting requirements, and we use reasonable safeguards to protect it.
        No method of transmission or storage is completely secure.
      </p>

      <p>
        <Lead>Your rights.</Lead> Depending on where you live (including under the
        California Consumer Privacy Act), you may have rights to access, correct,
        or delete your information, or to opt out of certain processing. To
        exercise these, contact us at{" "}
        <a href="mailto:admin@balancebeamteam.com" className={linkClass}>
          admin@balancebeamteam.com
        </a>
        .
      </p>

      <p>
        <Lead>Children.</Lead> The Site is not directed to children under 13, and
        we do not knowingly collect their information.
      </p>

      <p>
        <Lead>Changes.</Lead> We may update this Policy and will revise the
        effective date above.
      </p>

      <p>
        <Lead>Contact.</Lead> Balance Beam Corporation, 301 N. Lake Ave., Suite
        600, Pasadena, CA 91101 ·{" "}
        <a href="mailto:admin@balancebeamteam.com" className={linkClass}>
          admin@balancebeamteam.com
        </a>{" "}
        ·{" "}
        <a href="tel:+18883435908" className={linkClass}>
          888-343-5908
        </a>
        .
      </p>
    </LegalPage>
  );
}
