import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Mock the rate limiter so tests never touch Upstash.
vi.mock('@/lib/ratelimit', () => ({ checkLandingIpLimit: vi.fn() }));
import { checkLandingIpLimit } from '@/lib/ratelimit';
import { POST } from './route';

const mockedLimit = vi.mocked(checkLandingIpLimit);

// ---- helpers ---------------------------------------------------------------

interface ReqOpts {
  contentType?: string | null; // null => omit the header entirely
  contentLength?: string;
  rawBody?: string; // overrides JSON.stringify(body), for invalid-JSON tests
}

function makeReq(body: unknown, o: ReqOpts = {}): NextRequest {
  const headers = new Headers();
  const ct = o.contentType === undefined ? 'application/json' : o.contentType;
  if (ct !== null) headers.set('content-type', ct);
  if (o.contentLength !== undefined) headers.set('content-length', o.contentLength);
  const payload = o.rawBody !== undefined ? o.rawBody : JSON.stringify(body);
  return new Request('http://localhost/api/landing-lead', {
    method: 'POST',
    headers,
    body: payload,
  }) as unknown as NextRequest;
}

// A fully valid server payload. `_t` defaults to 5s ago so it passes the
// fill-time window (>2s, <2h). Override any field per test.
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: '555-555-5555',
    entity_type: 's_corp',
    state: 'CA',
    bookkeeping_software: 'qbo',
    role: 'owner',
    revenue_range: '100k_500k',
    filed_extension: 'yes',
    deadline_segment: 'scorp_partnership_sep15',
    extended_because_books: 'yes',
    preparer_requested: 'no',
    reconciled_through_yearend: 'partly',
    months_behind: '1_3',
    accounts_to_review: '3_5',
    help_needed: 'cleanup_before_prep',
    biggest_issue: 'behind',
    consent_sms: true,
    consent_terms: true,
    form_origin: 'extension-cleanup-review',
    page_url: 'https://www.balancebeamteam.com/extension-cleanup-review/',
    submitted_at: '2026-06-11T12:00:00.000Z',
    _hp: '',
    _t: Date.now() - 5000,
    ...overrides,
  };
}

function okFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
  } as unknown as Response);
}

beforeEach(() => {
  mockedLimit.mockReset();
  mockedLimit.mockResolvedValue({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 60_000,
    pending: Promise.resolve(),
  } as Awaited<ReturnType<typeof checkLandingIpLimit>>);

  global.fetch = okFetch();
  process.env.GHL_LANDING_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/PLACEHOLDER';
  delete process.env.TURNSTILE_ENABLED;

  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---- cases -----------------------------------------------------------------

describe('POST /api/landing-lead', () => {
  it('1. content-type not JSON (or missing) → 415', async () => {
    const a = await POST(makeReq(validBody(), { contentType: 'text/plain' }));
    expect(a.status).toBe(415);
    const b = await POST(makeReq(validBody(), { contentType: null }));
    expect(b.status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('2. content-type application/json; charset=utf-8 → proceeds past Defense 1 (200)', async () => {
    const res = await POST(
      makeReq(validBody(), { contentType: 'application/json; charset=utf-8' })
    );
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('3. content-length > 8KB → 413', async () => {
    const res = await POST(makeReq(validBody(), { contentLength: '9000' }));
    expect(res.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('4. invalid JSON → 400', async () => {
    const res = await POST(makeReq(null, { rawBody: '{not valid json' }));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('5. honeypot (_hp non-empty) → 200, upstream NOT called', async () => {
    const res = await POST(makeReq(validBody({ _hp: 'i-am-a-bot' })));
    expect(res.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('6. _t missing → 422 field _t', async () => {
    const body = validBody();
    delete body._t;
    const res = await POST(makeReq(body));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'validation_failed', field: '_t' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('7. _t too fresh (<2s) → 200 silent drop, upstream NOT called', async () => {
    const res = await POST(makeReq(validBody({ _t: Date.now() - 500 })));
    expect(res.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('8. _t negative delta (client clock ahead) → passes; upstream called, 200', async () => {
    const res = await POST(makeReq(validBody({ _t: Date.now() + 60_000 })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('9. _t older than 2h → 422 session_expired', async () => {
    const res = await POST(makeReq(validBody({ _t: Date.now() - 7_200_001 })));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'session_expired', field: '_t' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('10. rate limiter returns success:false → 429 with Retry-After', async () => {
    mockedLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
      pending: Promise.resolve(),
    } as Awaited<ReturnType<typeof checkLandingIpLimit>>);
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ error: 'rate_limited' });
    const retryAfter = Number(res.headers.get('Retry-After'));
    expect(retryAfter).toBeGreaterThan(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('11. strict zod: unknown extra key → 422', async () => {
    const res = await POST(makeReq(validBody({ surprise_field: 'x' })));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe('validation_failed');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('12. URL in first_name → 422', async () => {
    const res = await POST(makeReq(validBody({ first_name: 'http://evil.com' })));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'validation_failed', field: 'first_name' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('13. URL in notes → accepted (200)', async () => {
    const res = await POST(makeReq(validBody({ notes: 'See https://mysite.com for details' })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('14. all-same-char in first_name → 422', async () => {
    const res = await POST(makeReq(validBody({ first_name: 'aaaa' })));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'validation_failed', field: 'first_name' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('15. disposable email → 422 disposable_email', async () => {
    const res = await POST(makeReq(validBody({ email: 'spammer@mailinator.com' })));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'disposable_email' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('16. missing GHL_LANDING_WEBHOOK_URL → 500 server_misconfig', async () => {
    delete process.env.GHL_LANDING_WEBHOOK_URL;
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: 'server_misconfig' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('17. upstream returns 500 → 502 upstream_failed', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: 'upstream_failed' });
  });

  it('18. happy path → 200 {ok:true}, forwarded body stripped of anti-bot fields', async () => {
    const res = await POST(makeReq(validBody({ _turnstile_token: 'tok' })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(process.env.GHL_LANDING_WEBHOOK_URL);
    const forwarded = JSON.parse((init as RequestInit).body as string);
    expect(forwarded).not.toHaveProperty('_hp');
    expect(forwarded).not.toHaveProperty('_t');
    expect(forwarded).not.toHaveProperty('_turnstile_token');
    // real fields still present
    expect(forwarded.email).toBe('jane@example.com');
    expect(forwarded.form_origin).toBe('extension-cleanup-review');
  });

  it('19. multiline notes (\\n) → accepted (200)', async () => {
    const res = await POST(makeReq(validBody({ notes: 'Filed late.\nBooks ~8 months behind.' })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('20. CRLF + tab in notes → accepted (200)', async () => {
    const res = await POST(makeReq(validBody({ notes: 'Line1\r\nLine2\twith tab' })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('21. NUL byte in notes → 422', async () => {
    const res = await POST(makeReq(validBody({ notes: 'bad\u0000note' })));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'validation_failed', field: 'notes' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('22. newline in first_name (single-line field) → 422', async () => {
    const res = await POST(makeReq(validBody({ first_name: 'Ja\nne' })));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: 'validation_failed', field: 'first_name' });
    expect(fetch).not.toHaveBeenCalled();
  });
});
