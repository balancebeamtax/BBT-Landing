import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Server-side mirror of the n8n spam gates (see docs/imp/04_n8n_workflow_spec.md):
// honeypot must be empty, fill time must be ≥ 12s.
const TIME_GUARD_MS = 12_000;

// Minimum fields the diagnostic must carry to be a real lead.
const REQUIRED_FIELDS = ['first_name', 'last_name', 'email', 'quiz_score', 'tier'] as const;

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isMissing(v: unknown): boolean {
  // Note: 0 is a valid quiz_score (Emergency tier) — only undefined/null/blank-string count as missing.
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { status: 'rejected', error: 'invalid_json' });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return jsonResponse(400, { status: 'rejected', error: 'invalid_payload' });
  }

  // Spam check 1 — honeypot must be empty.
  const honeypot = body.website_val;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return jsonResponse(400, { status: 'rejected', error: 'spam_honeypot' });
  }

  // Spam check 2 — fill-time guard (≥ 12s).
  const elapsed = Number(body.time_elapsed_ms);
  if (!Number.isFinite(elapsed) || elapsed < TIME_GUARD_MS) {
    return jsonResponse(400, { status: 'rejected', error: 'spam_time_guard' });
  }

  // Validation — required fields present.
  for (const field of REQUIRED_FIELDS) {
    if (isMissing(body[field])) {
      return jsonResponse(400, { status: 'rejected', error: 'missing_field', field });
    }
  }

  // Webhook URL lives only in the server env — never logged, never returned to the client.
  const webhookUrl = process.env.GHL_LANDING_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('[books-rescue-submit] GHL_LANDING_WEBHOOK_URL not configured');
    return jsonResponse(500, { status: 'error', error: 'server_misconfig' });
  }

  // Fire-and-forget: kick off the upstream POST but don't block the response.
  void forwardToWebhook(webhookUrl, body);

  return jsonResponse(200, { status: 'received' });
}

// Forwards the full payload to GHL. Errors are swallowed (the lead UX must not
// depend on the webhook round-trip). The webhook URL is never included in logs.
function forwardToWebhook(webhookUrl: string, payload: unknown): Promise<void> {
  return fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8_000),
  })
    .then(() => undefined)
    .catch(() => {
      console.error('[books-rescue-submit] upstream forward failed');
    });
}

export function GET()    { return jsonResponse(405, { status: 'rejected', error: 'method_not_allowed' }); }
export function PUT()    { return jsonResponse(405, { status: 'rejected', error: 'method_not_allowed' }); }
export function PATCH()  { return jsonResponse(405, { status: 'rejected', error: 'method_not_allowed' }); }
export function DELETE() { return jsonResponse(405, { status: 'rejected', error: 'method_not_allowed' }); }
