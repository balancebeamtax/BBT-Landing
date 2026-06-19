import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/ratelimit', () => ({ checkBooksRescueIpLimit: vi.fn() }));
import { checkBooksRescueIpLimit } from '@/lib/ratelimit';
import { POST, GET } from './route';

const mockedLimit = vi.mocked(checkBooksRescueIpLimit);

const WEBHOOK_URL = 'https://n8n.test/webhook/books-rescue-submit';
const WEBHOOK_SECRET = 'unit-test-secret';

interface ReqOpts {
  contentType?: string | null;
  contentLength?: string;
  rawBody?: string;
}

function makeReq(body: unknown, o: ReqOpts = {}): NextRequest {
  const headers = new Headers();
  const ct = o.contentType === undefined ? 'application/json' : o.contentType;
  if (ct !== null) headers.set('content-type', ct);
  if (o.contentLength !== undefined) headers.set('content-length', o.contentLength);
  const payload = o.rawBody !== undefined ? o.rawBody : JSON.stringify(body);
  return new Request('http://localhost/api/books-rescue-submit', {
    method: 'POST',
    headers,
    body: payload,
  }) as unknown as NextRequest;
}

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    submission_id: 'sub_abc123',
    submitted_at: '2026-06-14T12:00:00.000Z',
    source: 'books-rescue-quiz-v3',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: '(555) 555-5555',
    company_name: 'Acme LLC',
    q_recency: 1,
    q_confidence: 2,
    q_deadline_pressure: 0,
    q_tx_complexity: 3,
    q_owner_burden: 2,
    q_surprise_rate: 1,
    q_decision_drag: 0,
    website_val: '',
    time_elapsed_ms: 15_000,
    cf_turnstile_response: 'turnstile-token',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'rescue-q2',
    utm_term: 'late books',
    utm_content: 'hero-cta',
    quiz_score: 72,
    tier: 'at-risk',
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
  } as Awaited<ReturnType<typeof checkBooksRescueIpLimit>>);

  global.fetch = okFetch();
  process.env.BOOKS_RESCUE_N8N_WEBHOOK_URL = WEBHOOK_URL;
  process.env.BOOKS_RESCUE_N8N_WEBHOOK_SECRET = WEBHOOK_SECRET;
  delete process.env.TURNSTILE_ENABLED;

  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/books-rescue-submit', () => {
  it('non-POST (GET) → 405', () => {
    expect(GET().status).toBe(405);
  });

  it('content-type not JSON → 415, upstream NOT called', async () => {
    const res = await POST(makeReq(validBody(), { contentType: 'text/plain' }));
    expect(res.status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('content-length > 16KB → 413, upstream NOT called', async () => {
    const res = await POST(makeReq(validBody(), { contentLength: String(17 * 1024) }));
    expect(res.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('body bytes > 16KB → 413, upstream NOT called', async () => {
    const huge = validBody({ company_name: 'A'.repeat(20 * 1024) });
    const res = await POST(makeReq(huge));
    expect(res.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('honeypot website_val non-empty → 200 empty body, no forward', async () => {
    const res = await POST(makeReq(validBody({ website_val: 'http://spam.test' })));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('time_elapsed_ms < 12000 → 200 empty body, no forward', async () => {
    const res = await POST(makeReq(validBody({ time_elapsed_ms: 4000 })));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('time_elapsed_ms missing → 200 empty body, no forward (fail closed)', async () => {
    const body = validBody();
    delete body.time_elapsed_ms;
    const res = await POST(makeReq(body));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('time_elapsed_ms non-numeric (NaN) → 200 empty body, no forward', async () => {
    const res = await POST(makeReq(validBody({ time_elapsed_ms: 'soon' })));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('time_elapsed_ms exactly 12000 → forwarded (boundary)', async () => {
    const res = await POST(makeReq(validBody({ time_elapsed_ms: 12_000 })));
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('rate limited → 429 with Retry-After, no forward', async () => {
    mockedLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
      pending: Promise.resolve(),
    } as Awaited<ReturnType<typeof checkBooksRescueIpLimit>>);
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('Turnstile failure (enabled) → 403, no forward to n8n', async () => {
    process.env.TURNSTILE_ENABLED = 'true';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: false }),
    } as unknown as Response);
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(403);
    // exactly one fetch — the turnstile verify; n8n NOT called
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).toContain('challenges.cloudflare.com');
  });

  it('Turnstile errored verify (enabled) → 403 (failed OR errored = failure)', async () => {
    process.env.TURNSTILE_ENABLED = 'true';
    global.fetch = vi.fn().mockRejectedValue(new Error('network unreachable'));
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(403);
  });

  it('missing email → 400 invalid_submission, no forward', async () => {
    const body = validBody();
    delete body.email;
    const res = await POST(makeReq(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_submission' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('malformed email → 400 invalid_submission, no forward', async () => {
    const res = await POST(makeReq(validBody({ email: 'not-an-email' })));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_submission' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('email > 254 chars → 400 invalid_submission', async () => {
    const long = `${'a'.repeat(250)}@x.io`;
    const res = await POST(makeReq(validBody({ email: long })));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('incomplete answers (missing q_decision_drag) → 400 invalid_submission, no forward', async () => {
    const body = validBody();
    delete body.q_decision_drag;
    const res = await POST(makeReq(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_submission' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('answer out of range (q_recency=4) → 400 invalid_submission', async () => {
    const res = await POST(makeReq(validBody({ q_recency: 4 })));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('answer non-integer (q_recency=1.5) → 400 invalid_submission', async () => {
    const res = await POST(makeReq(validBody({ q_recency: 1.5 })));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('free-text containing < > or control chars → stripped before forward', async () => {
    const res = await POST(
      makeReq(
        validBody({
          first_name: '<script>Jane',
          last_name: 'Do e',
          company_name: 'Ac<m>e',
          phone: '555\x1F-5555',
        })
      )
    );
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const fwd = JSON.parse((init as RequestInit).body as string);
    expect(fwd.first_name).toBe('scriptJane');
    expect(fwd.last_name).toBe('Doe');
    expect(fwd.company_name).toBe('Acme');
    expect(fwd.phone).toBe('555-5555');
    // belt-and-suspenders: no angle brackets or ctrl chars survive anywhere
    for (const k of ['first_name', 'last_name', 'company_name', 'phone'] as const) {
      expect(fwd[k]).not.toMatch(/[<>]/);
      // eslint-disable-next-line no-control-regex
      expect(fwd[k]).not.toMatch(/[\x00-\x1F\x7F]/);
    }
  });

  it('free-text capped at 120 chars', async () => {
    const res = await POST(makeReq(validBody({ first_name: 'A'.repeat(200) })));
    expect(res.status).toBe(200);
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const fwd = JSON.parse((init as RequestInit).body as string);
    expect(fwd.first_name.length).toBe(120);
  });

  it('missing webhook URL → 500 not_configured, no forward', async () => {
    delete process.env.BOOKS_RESCUE_N8N_WEBHOOK_URL;
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'not_configured' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('missing webhook secret → 500 not_configured, no forward', async () => {
    delete process.env.BOOKS_RESCUE_N8N_WEBHOOK_SECRET;
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'not_configured' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('non-https webhook URL → 500 not_configured, no forward', async () => {
    process.env.BOOKS_RESCUE_N8N_WEBHOOK_URL = 'http://insecure.test/webhook';
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'not_configured' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetch timeout (AbortError) → 502 intake_failed', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'intake_failed' });
  });

  it('n8n non-2xx → 502 intake_failed', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);
    const res = await POST(makeReq(validBody()));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'intake_failed' });
  });

  it('happy path → 200 {ok:true, submissionId}, forwards env URL, x-bbt-intake-secret header, ONLY allowlisted keys', async () => {
    // inject an extra key — it MUST NOT appear in the forwarded body
    const res = await POST(
      makeReq(
        validBody({
          evil_key: 'inject',
          __proto__: { polluted: true },
          extra_nested: { a: 1 },
        })
      )
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, submissionId: 'sub_abc123' });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(WEBHOOK_URL);
    const initObj = init as RequestInit;
    const headers = new Headers(initObj.headers);
    expect(headers.get('x-bbt-intake-secret')).toBe(WEBHOOK_SECRET);
    expect(headers.get('content-type')).toBe('application/json');

    const fwd = JSON.parse(initObj.body as string) as Record<string, unknown>;
    expect(fwd).not.toHaveProperty('evil_key');
    expect(fwd).not.toHaveProperty('extra_nested');
    expect(fwd).not.toHaveProperty('polluted');

    const ALLOWED = new Set([
      'submission_id',
      'submitted_at',
      'source',
      'first_name',
      'last_name',
      'email',
      'phone',
      'company_name',
      'q_recency',
      'q_confidence',
      'q_deadline_pressure',
      'q_tx_complexity',
      'q_owner_burden',
      'q_surprise_rate',
      'q_decision_drag',
      'website_val',
      'time_elapsed_ms',
      'cf_turnstile_response',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'quiz_score',
      'tier',
    ]);
    for (const k of Object.keys(fwd)) {
      expect(ALLOWED.has(k)).toBe(true);
    }

    expect(fwd.email).toBe('jane@example.com');
    expect(fwd.tier).toBe('at-risk');
    expect(fwd.q_tx_complexity).toBe(3);
  });

  it('forward URL is sourced from env, NOT from the request body', async () => {
    const malicious = validBody({
      BOOKS_RESCUE_N8N_WEBHOOK_URL: 'https://attacker.example/steal',
      webhookUrl: 'https://attacker.example/steal',
      url: 'https://attacker.example/steal',
    });
    const res = await POST(makeReq(malicious));
    expect(res.status).toBe(200);
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(WEBHOOK_URL);
    expect(String(url)).not.toContain('attacker.example');
  });
});
