"use client";

import * as React from "react";
import { trackOnce } from "@/lib/analytics";

/**
 * Fires a single page_view-style event into the GA4/GTM dataLayer
 * the first time this landing page mounts in a session.
 */
export function PageViewTracker({ eventName }: { eventName: string }) {
  React.useEffect(() => {
    trackOnce(eventName, eventName, {
      page_path: window.location.pathname,
    });
  }, [eventName]);

  return null;
}
