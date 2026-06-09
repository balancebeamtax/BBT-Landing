/**
 * Thin GA4 / GTM dataLayer event helper.
 *
 * Standard event names for balancebeamteam.com landing pages
 * (locked in the project hub):
 *   - cta_click
 *   - form_start
 *   - generate_lead          (form submit success)
 *   - calendly_open
 *   - appointment_booked
 *
 * Per-funnel extras (extension-cleanup-review):
 *   - extension_cleanup_page_view
 *   - extension_cleanup_primary_cta_click
 *   - extension_cleanup_secondary_cta_click
 *   - extension_cleanup_form_start
 *   - extension_cleanup_form_submit
 *   - extension_cleanup_booking_click
 *   - extension_cleanup_booking_complete
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackOnce(key: string, event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  const storageKey = `bbt:event_once:${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // sessionStorage may throw in privacy modes — fall through and fire anyway.
  }
  track(event, params);
}
