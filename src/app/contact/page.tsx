import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Balance Beam Bookkeeping & Tax.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

const linkClass = "text-cta-primary hover:underline";

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        Balance Beam Corporation (doing business as Balance Beam Bookkeeping
        &amp; Tax)
        <br />
        301 N. Lake Ave., Suite 600, Pasadena, CA 91101
      </p>

      <p>
        General:{" "}
        <a href="mailto:admin@balancebeamteam.com" className={linkClass}>
          admin@balancebeamteam.com
        </a>
        <br />
        Appointments:{" "}
        <a href="mailto:dave.rios@balancebeamteam.com" className={linkClass}>
          dave.rios@balancebeamteam.com
        </a>
        <br />
        Phone:{" "}
        <a href="tel:+18883435908" className={linkClass}>
          888-343-5908
        </a>
      </p>

      <p>Based in Pasadena, California.</p>
    </LegalPage>
  );
}
