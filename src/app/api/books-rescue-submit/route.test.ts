import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST, GET } from './route';

// A placeholder upstream URL. Never assert it appears anywhere client-visible.
const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/IMP-233-PLACEHOLDER';

// ---- helpers ---------------------------------------------------------------

interface ReqOpts {
  rawBody?: string; // overrides JSON.stringify(body), for invalid-JSON tests
}

function makeReq(body: unknown, o: ReqOpts = {}): NextRequest {
  const payload = o.rawBody !== undefined ? o.rawBody : JSON.stringify(body);
  return new Request('http://localhost/api/books-rescue-submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
  }) as unknown as NextRequest;
}

// A fully valid quiz payload (matches books-rescue-quiz-v3.html → n8n spec).
// time_elapsed_ms defaults above the 12s guard; honeypot empty. Override per test.
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: '(555) 555-5555',
    company_name: 'Acme LLC',
    quiz_score: 72,
    raw_score: 72,
    tier: 'at-risk',
    answers: [{ key: 'months_behind', answer_index: 0, score: 20 }],
    website_val: '',
    submission_ts: '2026-06-14T12:00:00.000Z',
    time_elapsed_ms: 15_000,
    cf_turnstile_response: 'turnstile-token',
    source: 'books-rescue-quiz-v3',
    domain: 'balancebeamteam.com',
    ...overrides,
  };
}

function okFetch() {
  return vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) } as unknown as Response);
}

beforeEach(() => {
  global.fetch = okFetch();
  process.env.GHL_LANDING_WEBHOOK_URL = WEBHOOK_URL;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---- cases -----------------------------------------------------------------

describe('POST /api/books-rescue-submit', () => {
  it('1. happy path → 200 {status:"received"}, forwards full payload to env webhook', async () => {
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'received' });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(WEBHOOK_URL);
    const forwarded = JSON.parse((init as RequestInit).body as string);
    // full payload forwarded, untouched (honeypot mirror + all fields included)
    expect(forwarded.first_name).toBe('Jane');
    expect(forwarded.quiz_score).toBe(72);
    expect(forwarded.tier).toBe('at-risk');
    expect(forwarded.website_val).toBe('');
    expect(forwarded.domain).toBe('balancebeamteam.com');
  });

  it('2. non-POST method (GET) → 405', () => {
    const res = GET();
    expect(res.status).toBe(405);
  });

  it('3. invalid JSON → 400, upstream NOT called', async () => {
    const res = await POST(makeReq(null, { rawBody: '{not json' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'invalid_json' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('4. honeypot (website_val non-empty) → 400 spam_honeypot, upstream NOT called', async () => {
    const res = await POST(makeReq(validBody({ website_val: 'http://spam.test' })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'spam_honeypot' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('5. time_elapsed_ms below 12000 → 400 spam_time_guard, upstream NOT called', async () => {
    const res = await POST(makeReq(validBody({ time_elapsed_ms: 4000 })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'spam_time_guard' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('6. time_elapsed_ms exactly 12000 → 200 (boundary passes)', async () => {
    const res = await POST(makeReq(validBody({ time_elapsed_ms: 12_000 })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('7. time_elapsed_ms missing / non-numeric → 400 spam_time_guard', async () => {
    const body = validBody();
    delete body.time_elapsed_ms;
    const res = await POST(makeReq(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'spam_time_guard' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('8. missing required field (first_name) → 400 missing_field', async () => {
    const body = validBody();
    delete body.first_name;
    const res = await POST(makeReq(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'missing_field', field: 'first_name' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('9. missing tier → 400 missing_field tier', async () => {
    const res = await POST(makeReq(validBody({ tier: '' })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'missing_field', field: 'tier' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('10. quiz_score of 0 (Emergency) is valid → 200', async () => {
    const res = await POST(makeReq(validBody({ quiz_score: 0, tier: 'emergency' })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('11. missing GHL_LANDING_WEBHOOK_URL → 500 server_misconfig, upstream NOT called', async () => {
    delete process.env.GHL_LANDING_WEBHOOK_URL;
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: 'server_misconfig' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('12. fire-and-forget: upstream rejection still returns 200', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'received' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('13. webhook URL is never echoed in any response body', async () => {
    const ok = await POST(makeReq(validBody()));
    expect(await ok.text()).not.toContain(WEBHOOK_URL);

    delete process.env.GHL_LANDING_WEBHOOK_URL;
    const misconfig = await POST(makeReq(validBody()));
    expect(await misconfig.text()).not.toContain('http');
  });
});
