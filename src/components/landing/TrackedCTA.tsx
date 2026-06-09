"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type TrackedCTAProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  eventName: string;
  eventParams?: Record<string, string | number | boolean>;
  className?: string;
};

/**
 * Smooth-scrolling anchor CTA that also fires a GA4/GTM dataLayer event.
 * Use for hero, mid-page, deadline-card, and final CTAs that link to #intake.
 */
export function TrackedCTA({
  href,
  label,
  variant = "primary",
  eventName,
  eventParams,
  className,
}: TrackedCTAProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("cta_click", {
      cta_label: label,
      cta_target: href,
      ...eventParams,
    });
    track(eventName, { cta_label: label, cta_target: href, ...eventParams });

    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", href);
      }
    }
  };

  const base =
    "inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-cta-primary text-white hover:bg-cta-hover"
      : "border border-cta-primary text-cta-primary hover:bg-cta-primary hover:text-white";

  return (
    <a href={href} onClick={handleClick} className={cn(base, styles, className)}>
      {label}
    </a>
  );
}
