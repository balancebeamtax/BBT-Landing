import type { NextRequest } from 'next/server';
import { serverPayloadSchema } from '@/lib/schemas/extension-cleanup';
import { checkLandingIpLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org',
  'tempmail.com','temp-mail.org','temp-mail.io',
  '10minutemail.com','10minutemail.net',
  'throwaway.email','throwawaymail.com',
  'yopmail.com','yopmail.net','yopmail.fr',
  'sharklasers.com','spam4.me','getairmail.com',
  'maildrop.cc','fakeinbox.com','trashmail.com',
  'getnada.com','emailondeck.com','mintemail.com',
  'mohmal.com','mvrht.net','inboxbear.com',
  'tempr.email','discard.email','discardmail.com',
]);

function redactIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return 'unknown';
}

function jsonResponse(status: number, body: Record<string, unknown>, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  // Defense 1 — method + content gate
  const ct = req.headers.get('content-type')?.toLowerCase() ?? '';
  if (!ct.startsWith('application/json')) {
    return jsonResponse(415, { error: 'unsupported_media_type' });
  }
  const contentLength = parseInt(req.headers.get('content-length') ?? '0', 10);
  if (contentLength > 8 * 1024) {
    return jsonResponse(413, { error: 'payload_too_large' });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return jsonResponse(400, { error: 'invalid_json' }); }

  // Resolve client IP once; reused by Defenses 2–4 and logging
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Defense 2 — honeypot
  if (typeof (body as Record<string, unknown>)._hp === 'string' && (body as Record<string, unknown>)._hp !== '') {
    console.log('[landing-lead] silent_drop', { ip: redactIp(ip), reason: 'honeypot' });
    return new Response(null, { status: 200 });
  }

  // Defense 3 — fill-time check
  // delta < 0  => client clock ahead of server: clock skew, NOT bot evidence — pass, log
  // 0–2s      => bot-fast: silent drop
  // > 2h      => wizard session expired: honest 422 so the user can resubmit (no silent lead loss)
  const t = (body as Record<string, unknown>)._t;
  if (typeof t !== 'number') {
    return jsonResponse(422, { error: 'validation_failed', field: '_t' });
  }
  const delta = Date.now() - t;
  if (delta < 0) {
    console.log('[landing-lead] clock_skew', { ip: redactIp(ip), skewMs: delta });
  } else if (delta < 2000) {
    console.log('[landing-lead] silent_drop', { ip: redactIp(ip), reason: 'too_fast' });
    return new Response(null, { status: 200 });
  } else if (delta > 7_200_000) {
    return jsonResponse(422, { error: 'session_expired', field: '_t' });
  }

  // Defense 4 — rate limit
  const rl = await checkLandingIpLimit(ip);
  if (!rl.success) {
    const retryAfter = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return jsonResponse(429, { error: 'rate_limited' }, { 'Retry-After': String(retryAfter) });
  }

  // Defense 5 — strict zod validation
  const parsed = serverPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    console.log('[landing-lead] validation_failed', {
      ip: redactIp(ip),
      field: issue.path.join('.'),
      code: issue.code,
    });
    return jsonResponse(422, { error: 'validation_failed', field: issue.path.join('.') });
  }
  const data = parsed.data;

  // Defense 6 — disposable-email blocklist
  const emailDomain = data.email.toLowerCase().split('@')[1] ?? '';
  if (DISPOSABLE_DOMAINS.has(emailDomain)) {
    console.log('[landing-lead] disposable_email', { ip: redactIp(ip), domain: emailDomain });
    return jsonResponse(422, { error: 'disposable_email' });
  }

  // Garbage-pattern guard on free-text fields.
  // - URL test excludes `notes` (prospects paste their website there).
  // - Control-char policy is per input widget: `notes` is a <Textarea>, so
  //   \t (09), \n (0A), \r (0D) are legitimate; single-line <input> fields
  //   permit no control characters at all. Validating a multiline widget with
  //   a single-line character class was the original P1 bug.
  const FREE_TEXT_FIELDS = ['first_name', 'last_name', 'business_name', 'notes'] as const;
  const URL_BLOCKED_FIELDS = new Set(['first_name', 'last_name', 'business_name']);
  const MULTILINE_FIELDS = new Set(['notes']);
  const CTRL_SINGLE_LINE = /[\x00-\x1F\x7F]/;                 // no control chars
  const CTRL_MULTILINE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;  // allows \t \n \r
  for (const k of FREE_TEXT_FIELDS) {
    const v = (data as Record<string, unknown>)[k];
    if (typeof v === 'string' && v.length > 0) {
      const ctrl = MULTILINE_FIELDS.has(k) ? CTRL_MULTILINE : CTRL_SINGLE_LINE;
      const garbage =
        /^(.)\1{3,}$/.test(v) ||
        ctrl.test(v) ||
        (URL_BLOCKED_FIELDS.has(k) && /https?:\/\//i.test(v));
      if (garbage) {
        console.log('[landing-lead] garbage_pattern', { ip: redactIp(ip), field: k });
        return jsonResponse(422, { error: 'validation_failed', field: k });
      }
    }
  }

  // Optional Defense 7 — Turnstile (env-flagged, disabled by default)
  if (process.env.TURNSTILE_ENABLED === 'true') {
    const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? '',
        response: data._turnstile_token ?? '',
        remoteip: ip,
      }).toString(),
    });
    const tsJson = (await tsRes.json()) as { success: boolean };
    if (!tsJson.success) return jsonResponse(403, { error: 'turnstile_failed' });
  }

  // Forward to GHL
  const upstream = process.env.GHL_LANDING_WEBHOOK_URL;
  if (!upstream) {
    console.error('[landing-lead] GHL_LANDING_WEBHOOK_URL not set');
    return jsonResponse(500, { error: 'server_misconfig' });
  }

  // Strip anti-bot fields before forwarding
  const { _hp, _t: _omitT, _turnstile_token, ...cleaned } = data;

  try {
    const upstreamRes = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cleaned),
      signal: AbortSignal.timeout(8000),
    });
    if (!upstreamRes.ok) {
      console.error('[landing-lead] upstream_failed', { status: upstreamRes.status });
      return jsonResponse(502, { error: 'upstream_failed' });
    }
  } catch (err) {
    console.error('[landing-lead] upstream_error', err);
    return jsonResponse(502, { error: 'upstream_failed' });
  }

  return jsonResponse(200, { ok: true });
}

export function GET()    { return jsonResponse(405, { error: 'method_not_allowed' }); }
export function PUT()    { return jsonResponse(405, { error: 'method_not_allowed' }); }
export function DELETE() { return jsonResponse(405, { error: 'method_not_allowed' }); }
