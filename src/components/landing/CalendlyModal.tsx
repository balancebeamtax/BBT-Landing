"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

interface CalendlyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendlyUrl: string;
  prefill?: {
    name?: string;
    email?: string;
  };
}

/**
 * Calendly inline modal. Falls back to opening the Calendly URL in a new tab if
 * the embed script fails to load (e.g. blocked by extensions).
 */
export function CalendlyModal({
  open,
  onOpenChange,
  calendlyUrl,
  prefill,
}: CalendlyModalProps) {
  React.useEffect(() => {
    if (!open) return;
    track("calendly_open", { funnel: "extension-cleanup-review" });
  }, [open]);

  // Compose Calendly URL with prefill params.
  const url = React.useMemo(() => {
    try {
      const u = new URL(calendlyUrl);
      if (prefill?.name) u.searchParams.set("name", prefill.name);
      if (prefill?.email) u.searchParams.set("email", prefill.email);
      u.searchParams.set("utm_source", "balancebeamteam");
      u.searchParams.set("utm_medium", "landing");
      u.searchParams.set("utm_campaign", "extension-cleanup-review");
      return u.toString();
    } catch {
      return calendlyUrl;
    }
  }, [calendlyUrl, prefill]);

  const isPlaceholder = calendlyUrl.includes("PLACEHOLDER");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden h-[85vh] max-h-[800px]">
        <DialogTitle className="sr-only">Schedule your consultation</DialogTitle>
        {isPlaceholder ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl font-semibold mb-3">
                Calendly link not yet configured
              </h3>
              <p className="text-text-muted mb-4">
                The Calendly event type for this funnel is being set up.
                You can still reach us directly at{" "}
                <a
                  className="text-cta-primary underline"
                  href="mailto:dave.rios@balancebeamteam.com"
                >
                  dave.rios@balancebeamteam.com
                </a>{" "}
                and we&apos;ll find a time that works.
              </p>
              <Button onClick={() => onOpenChange(false)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            title="Calendly scheduling"
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen;"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
