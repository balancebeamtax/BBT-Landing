import type { NextRequest } from 'next/server';
import { checkBooksRescueIpLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_GUARD_MS = 12_000;
const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_LEN = 120;
const MAX_EMAIL_LEN = 254;
const FORWARD_TIMEOUT_MS = 10_000;

// RFC 5322 is permissive; this captures the practical-mail shape used by every
// downstream system (local@domain.tld). Defense-in-depth — n8n re-validates.
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Q_KEYS = [
  'q_recency',
  'q_confidence',
  'q_deadline_pressure',
  'q_tx_complexity',
  'q_owner_burden',
  'q_surprise_rate',
  'q_decision_drag',
] as const;

const FREE_TEXT_FIELDS = ['first_name', 'last_name', 'company_name', 'phone'] as const;

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function silentOk(): Response {
  return new Response(null, { status: 200 });
}

function redactIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return 'unknown';
}

// Strip control chars and angle brackets; trim; cap length. The free-text
// fields land in an HTML alert email downstream, so < and > must not survive.
function normalizeFreeText(v: unknown): string {
  const raw = typeof v === 'string' ? v : v == null ? '' : String(v);
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\x00-\x1F\x7F<>]/g, '').trim();
  return cleaned.length > MAX_TEXT_LEN ? cleaned.slice(0, MAX_TEXT_LEN) : cleaned;
}

function isInt03(v: unknown): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3;
}

export async function POST(req: NextRequest): Promise<Response> {
  // (a) method + content + size gates
  const ct = req.headers.get('content-type')?.toLowerCase() ?? '';
  if (!ct.startsWith('application/json')) {
    return jsonResponse(415, { ok: false, error: 'unsupported_media_type' });
  }
  const contentLength = parseInt(req.headers.get('content-length') ?? '0', 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, error: 'payload_too_large' });
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_submission' });
  }
  if (text.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, error: 'payload_too_large' });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return jsonResponse(400, { ok: false, error: 'invalid_submission' });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_submission' });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // (b) honeypot — drop silently
  const hp = body.website_val;
  const hpStr = typeof hp === 'string' ? hp : hp == null ? '' : String(hp);
  if (hpStr.trim() !== '') {
    console.log('[books-rescue-submit] silent_drop', { ip: redactIp(ip), reason: 'honeypot' });
    return silentOk();
  }

  // (c) time guard — fail closed on missing/non-numeric/<12s
  const tRaw = body.time_elapsed_ms;
  if (tRaw === undefined || tRaw === null) {
    console.log('[books-rescue-submit] silent_drop', { ip: redactIp(ip), reason: 'time_missing' });
    return silentOk();
  }
  const tNum = Number(tRaw);
  if (!Number.isFinite(tNum) || tNum < TIME_GUARD_MS) {
    console.log('[books-rescue-submit] silent_drop', { ip: redactIp(ip), reason: 'time_guard' });
    return silentOk();
  }

  // (d) Turnstile — env-flagged; treat failed OR errored verify as failure
  if (process.env.TURNSTILE_ENABLED === 'true') {
    const token =
      typeof body.cf_turnstile_response === 'string' ? body.cf_turnstile_response : '';
    let success = false;
    try {
      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY ?? '',
          response: token,
          remoteip: ip,
        }).toString(),
      });
      const tsJson = (await tsRes.json()) as { success?: boolean };
      success = tsJson.success === true;
    } catch {
      success = false;
    }
    if (!success) return jsonResponse(403, { ok: false, error: 'turnstile_failed' });
  }

  // (e) rate limit
  const rl = await checkBooksRescueIpLimit(ip);
  if (!rl.success) {
    const retryAfter = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return jsonResponse(
      429,
      { ok: false, error: 'rate_limited' },
      { 'Retry-After': String(retryAfter) }
    );
  }

  // (f) validate — fail closed
  const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
  if (!emailRaw || emailRaw.length > MAX_EMAIL_LEN || !EMAIL_RX.test(emailRaw)) {
    return jsonResponse(400, { ok: false, error: 'invalid_submission' });
  }
  for (const k of Q_KEYS) {
    if (!isInt03(body[k])) {
      return jsonResponse(400, { ok: false, error: 'invalid_submission' });
    }
  }

  const normalized = Object.fromEntries(
    FREE_TEXT_FIELDS.map((k) => [k, normalizeFreeText(body[k])]),
  ) as Record<(typeof FREE_TEXT_FIELDS)[number], string>;

  // (g) env config — fail closed
  const webhookUrl = process.env.BOOKS_RESCUE_N8N_WEBHOOK_URL;
  const webhookSecret = process.env.BOOKS_RESCUE_N8N_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret || !webhookUrl.startsWith('https://')) {
    console.error('[books-rescue-submit] n8n webhook not configured');
    return jsonResponse(500, { ok: false, error: 'not_configured' });
  }

  // (h) build the allowlisted forward — never spread the raw body
  const forward: Record<string, unknown> = {
    submission_id: body.submission_id,
    submitted_at: body.submitted_at,
    source: body.source,
    first_name: normalized.first_name,
    last_name: normalized.last_name,
    email: emailRaw,
    phone: normalized.phone,
    company_name: normalized.company_name,
    website_val: hpStr,
    time_elapsed_ms: tNum,
    cf_turnstile_response: body.cf_turnstile_response,
    utm_source: body.utm_source,
    utm_medium: body.utm_medium,
    utm_campaign: body.utm_campaign,
    utm_term: body.utm_term,
    utm_content: body.utm_content,
    quiz_score: body.quiz_score,
    tier: body.tier,
  };
  for (const k of Q_KEYS) forward[k] = body[k];

  // (i) forward to n8n
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);
  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bbt-intake-secret': webhookSecret,
      },
      body: JSON.stringify(forward),
      signal: controller.signal,
      redirect: 'error',
    });
    if (!upstream.ok) {
      console.error('[books-rescue-submit] intake_failed', { status: upstream.status });
      return jsonResponse(502, { ok: false, error: 'intake_failed' });
    }
  } catch (err) {
    console.error('[books-rescue-submit] intake_failed', {
      reason: (err as { name?: string } | null)?.name ?? 'unknown',
    });
    return jsonResponse(502, { ok: false, error: 'intake_failed' });
  } finally {
    clearTimeout(timer);
  }

  return jsonResponse(200, { ok: true, submissionId: body.submission_id });
}

export function GET() {
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' });
}
export function PUT() {
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' });
}
export function PATCH() {
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' });
}
export function DELETE() {
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' });
}
