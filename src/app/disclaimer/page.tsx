import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "balancebeamteam.com is for general educational purposes only and is not professional advice.",
  alternates: { canonical: "/disclaimer" },
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        Information on this website is for general educational purposes only and
        does not constitute tax, legal, accounting, or financial advice tailored
        to your situation.
      </p>

      <p>
        Reading this Site, using any calculator or diagnostic, downloading any
        resource, or submitting a form does not create a client or professional
        relationship. Bookkeeping and tax outcomes depend on facts unique to each
        business, and results described or implied are not guarantees. For advice
        about your specific circumstances, consult a qualified professional. A
        professional engagement with Balance Beam Corporation begins only upon a
        separate, signed service agreement.
      </p>
    </LegalPage>
  );
}
