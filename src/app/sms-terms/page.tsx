import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Lead } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "SMS / Text Messaging Terms",
  description:
    "Terms for Balance Beam's text-messaging program: consent, frequency, rates, and how to opt out.",
  alternates: { canonical: "/sms-terms" },
  robots: { index: true, follow: true },
};

const linkClass = "text-cta-primary hover:underline";

export default function SmsTermsPage() {
  return (
    <LegalPage title="SMS / Text Messaging Terms">
      <p>
        <Lead>Program.</Lead> When you provide your mobile number and opt in on
        one of our forms, Balance Beam Corporation may send you text messages
        related to your inquiry and to our bookkeeping, tax preparation, and
        tax-resolution services (for example, follow-ups, scheduling, and
        updates).
      </p>

      <p>
        <Lead>Consent.</Lead> By checking the SMS consent box and submitting the
        form, you agree to receive recurring automated text messages at the
        number provided. Consent is not a condition of purchasing any product or
        service.
      </p>

      <p>
        <Lead>Frequency &amp; cost.</Lead> Message frequency varies. Message and
        data rates may apply per your mobile plan.
      </p>

      <p>
        <Lead>Opt out / help.</Lead> Reply STOP at any time to unsubscribe; you
        will receive a confirmation and no further messages. Reply HELP for help,
        or contact{" "}
        <a href="mailto:admin@balancebeamteam.com" className={linkClass}>
          admin@balancebeamteam.com
        </a>{" "}
        /{" "}
        <a href="tel:+18883435908" className={linkClass}>
          888-343-5908
        </a>
        .
      </p>

      <p>
        <Lead>Carriers.</Lead> Carriers are not liable for delayed or undelivered
        messages. Supported carriers may change without notice.
      </p>

      <p>
        <Lead>Privacy.</Lead> Your mobile information is handled per our Privacy
        Policy and is not sold. See{" "}
        <Link href="/privacy" className={linkClass}>
          /privacy
        </Link>
        .
      </p>
    </LegalPage>
  );
}
