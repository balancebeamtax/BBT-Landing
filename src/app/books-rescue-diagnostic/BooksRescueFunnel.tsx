"use client";

import * as React from "react";
import Script from "next/script";
import { track } from "@/lib/analytics";
import {
  QUESTION_KEYS,
  computeResult,
  type Answers,
  type QuestionKey,
  type ScoreResult,
} from "@/lib/books-rescue/scoring";
import {
  QUIZ,
  TIER_CONTENT,
  CALL_SECTION,
  PRIMARY_CTA_LABEL,
  BOOKING_REASSURANCE,
  RESULT_EYEBROW,
  buildScorecard,
  BAND_ORDER,
  type Band,
} from "@/lib/books-rescue/content";

// ── config ────────────────────────────────────────────────────────────────
// trailingSlash:true in next.config → hit the canonical URL directly so the
// POST isn't 308-redirected (which would drop the body on some clients).
const SUBMIT_ENDPOINT = "/api/books-rescue-submit/";
const SOURCE = "balancebeamteam.com/books-rescue-diagnostic";
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL = QUIZ.length;

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL_BOOKS_RESCUE || "";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type Phase = "cover" | "quiz" | "analyzing" | "result" | "capture" | "booking";
type SubmitState = "idle" | "submitting" | "error";

const LETTERS = ["A", "B", "C", "D"];

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

function getUrlParam(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
}

function makeSubmissionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `br_${crypto.randomUUID()}`;
    }
  } catch {
    /* fall through */
  }
  return `br_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function readTurnstileToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const ts = (window as unknown as { turnstile?: { getResponse?: () => string } }).turnstile;
    if (ts && typeof ts.getResponse === "function") return ts.getResponse() || "";
  } catch {
    /* fall through to hidden-input fallback */
  }
  const input = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
  return input ? input.value : "";
}

// ── band → visual treatment (display layer) ────────────────────────────────
const BAND_LABEL: Record<Band, string> = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
};

function bandPillClass(band: Band): string {
  switch (band) {
    case "low":
      return "bg-se-primary/12 text-se-primary";
    case "moderate":
      return "bg-se-muted/15 text-se-muted";
    case "elevated":
      return "bg-se-accent/15 text-se-accent";
    case "high":
      return "bg-se-accent/25 text-se-accent";
  }
}

export function BooksRescueFunnel() {
  const [phase, setPhase] = React.useState<Phase>("cover");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Partial<Answers>>({});
  const [result, setResult] = React.useState<ScoreResult | null>(null);
  // Full-gate flag: the result/scorecard phase stays unreachable until the
  // capture form POSTs successfully. Flipped true only in handleSubmit success.
  const [submitted, setSubmitted] = React.useState(false);

  // Contact capture fields (controlled → naturally preserved across a failed submit).
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");

  const [submitState, setSubmitState] = React.useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [formError, setFormError] = React.useState("");

  // Fill-time for the server's ≥12s time-guard. Captured on mount.
  const renderTimeRef = React.useRef<number>(0);
  const hpRef = React.useRef<HTMLInputElement>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    renderTimeRef.current = Date.now();
    track("books_rescue_page_view");
  }, []);

  // Scroll to top on phase change so each screen starts at the top on mobile.
  React.useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase, step]);

  const current = QUIZ[step];
  const selected = current ? answers[current.key] : undefined;

  function startQuiz() {
    setPhase("quiz");
    setStep(0);
  }

  function selectAnswer(key: QuestionKey, idx: number) {
    if (!startedRef.current) {
      startedRef.current = true;
      track("books_rescue_quiz_start");
    }
    setAnswers((prev) => ({ ...prev, [key]: idx }));
  }

  function goNext() {
    if (selected === undefined) return;
    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
    } else {
      // All 7 answered → compute display result and run the analyzing transition.
      const r = computeResult(answers);
      setResult(r);
      track("books_rescue_quiz_complete", { score: r.score, tier: r.tier });
      setPhase("analyzing");
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  // Analyzing → capture. Results are computed but withheld: the user lands on
  // the capture form next, and the scorecard is revealed only after a
  // successful submit (see handleSubmit).
  React.useEffect(() => {
    if (phase !== "analyzing") return;
    const t = window.setTimeout(() => {
      setPhase("capture");
    }, 2600);
    return () => window.clearTimeout(t);
  }, [phase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const fn = firstName.trim();
    const em = email.trim();
    if (!fn) {
      setFormError("Please enter your first name.");
      return;
    }
    if (!EMAIL_RX.test(em)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!result) return;

    setSubmitState("submitting");
    setErrorMessage("");

    const payload: Record<string, unknown> = {
      submission_id: makeSubmissionId(),
      submitted_at: new Date().toISOString(),
      source: SOURCE,
      first_name: fn,
      last_name: lastName.trim(),
      email: em,
      phone: phone.trim(),
      company_name: company.trim(),
      website_val: hpRef.current?.value ?? "",
      time_elapsed_ms: Date.now() - renderTimeRef.current,
      cf_turnstile_response: TURNSTILE_SITE_KEY ? readTurnstileToken() : "",
      // Display/telemetry only — n8n recomputes and routes authoritatively.
      quiz_score: result.score,
      tier: result.tier,
    };
    for (const key of QUESTION_KEYS) {
      payload[`q_${key}`] = answers[key];
    }
    for (const k of UTM_KEYS) {
      payload[k] = getUrlParam(k);
    }

    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;

      if (res.ok && data?.ok) {
        track("generate_lead", { funnel: "books_rescue", score: result.score, tier: result.tier });
        track("books_rescue_view_result", { score: result.score, tier: result.tier });
        setSubmitState("idle");
        // Gate opens only here — reveal the score/scorecard, computed client-side
        // from answers already in state, so it appears instantly.
        setSubmitted(true);
        setPhase("result");
        return;
      }

      if (res.status === 429) {
        setErrorMessage("Too many submissions — please wait a moment and try again.");
      } else {
        setErrorMessage("Something went wrong sending your results. Please try again.");
      }
      setSubmitState("error");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitState("error");
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[46rem] px-5 pb-28 pt-7 text-[1.0625rem] leading-relaxed sm:pb-16">
      <Header />

      {phase === "cover" && <Cover onStart={startQuiz} />}

      {phase === "quiz" && current && (
        <QuizStep
          step={step}
          total={TOTAL}
          question={current}
          selected={selected}
          onSelect={selectAnswer}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {phase === "analyzing" && <Analyzing />}

      {phase === "capture" && (
        <Capture
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          company={company}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setEmail={setEmail}
          setPhone={setPhone}
          setCompany={setCompany}
          hpRef={hpRef}
          submitState={submitState}
          formError={formError}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />
      )}

      {phase === "result" && submitted && result && (
        <Result result={result} answers={answers} onContinue={() => setPhase("booking")} />
      )}

      {phase === "booking" && <Booking firstName={firstName} email={email} />}
    </div>
  );
}

// ── header ──────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="mb-8 flex items-center">
      {/* Logo is a static public asset; <img> matches the repo's SiteHeader. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/balance-beam-lockup.svg" alt="Balance Beam Bookkeeping & Tax" className="h-9 w-auto" />
    </header>
  );
}

// ── primary button (Slate Ember) ─────────────────────────────────────────────
function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-se-primary px-7 text-base font-bold text-se-inverse transition-colors hover:bg-se-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-se-primary focus-visible:ring-offset-2 focus-visible:ring-offset-se-bg disabled:cursor-not-allowed disabled:opacity-50 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}

// ── cover ─────────────────────────────────────────────────────────────────
function Cover({ onStart }: { onStart: () => void }) {
  return (
    <section>
      <span className="inline-flex items-center gap-2 rounded-full bg-se-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-se-primary">
        7 questions · about two minutes
      </span>
      <h1 className="mt-4 font-display text-4xl font-normal leading-tight text-se-text sm:text-5xl">
        How healthy are your books, really?
      </h1>
      <p className="mt-4 max-w-prose text-xl text-se-muted">
        Most owners already sense when something is off. This diagnostic scores where your
        bookkeeping actually stands, names what needs attention first, and tells you the fastest
        next move.
      </p>
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-se-muted">
        {["Private — no account needed", "Instant score & rescue tier", "No prep required"].map(
          (m) => (
            <li key={m} className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-se-primary" />
              {m}
            </li>
          ),
        )}
      </ul>
      <div className="mt-8 max-sm:sticky max-sm:bottom-4 max-sm:z-10">
        <PrimaryButton onClick={onStart} className="w-full sm:w-auto">
          Start the diagnostic →
        </PrimaryButton>
      </div>
      <p className="mt-6 text-sm text-se-muted">
        Built for small-business owners on extension, behind on cleanup, or just unsure whether the
        numbers can be trusted.
      </p>
    </section>
  );
}

// ── quiz step ───────────────────────────────────────────────────────────────
function QuizStep({
  step,
  total,
  question,
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  step: number;
  total: number;
  question: (typeof QUIZ)[number];
  selected: number | undefined;
  onSelect: (key: QuestionKey, idx: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const pct = (step / total) * 100;
  const isLast = step === total - 1;
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-se-muted">
          Question {step + 1} of {total}
        </span>
        <span className="text-xs font-bold text-se-primary">
          {step + 1} / {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-se-surface-offset" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-se-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-se-border bg-se-surface p-6 shadow-sm">
        <h2 className="font-display text-2xl leading-snug text-se-text sm:text-3xl">
          {question.prompt}
        </h2>

        <div className="mt-5 grid gap-2.5" role="group" aria-label={question.prompt}>
          {question.options.map((opt, idx) => {
            const isSel = selected === idx;
            return (
              <button
                key={idx}
                type="button"
                aria-pressed={isSel}
                onClick={() => onSelect(question.key, idx)}
                className={
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors " +
                  (isSel
                    ? "border-se-primary bg-se-primary/[0.07]"
                    : "border-se-border bg-se-surface-2 hover:border-se-primary")
                }
              >
                <span
                  className={
                    "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-bold " +
                    (isSel
                      ? "border-se-primary bg-se-primary text-se-inverse"
                      : "border-se-border bg-se-surface-offset text-se-muted")
                  }
                >
                  {LETTERS[idx]}
                </span>
                <span className="font-semibold text-se-text">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 max-sm:sticky max-sm:bottom-4 max-sm:z-10">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 0}
            className="inline-flex min-h-[48px] items-center rounded-full border border-se-border px-5 text-sm font-bold text-se-text transition-colors hover:bg-se-surface-offset disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <PrimaryButton onClick={onNext} disabled={selected === undefined}>
            {isLast ? "See my results →" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

// ── analyzing ────────────────────────────────────────────────────────────────
function Analyzing() {
  const steps = [
    "Reading your answers",
    "Calculating your Books Rescue score",
    "Matching your rescue tier",
    "Building your scorecard",
  ];
  const [on, setOn] = React.useState(0);
  React.useEffect(() => {
    const timers = steps.map((_, i) => window.setTimeout(() => setOn(i + 1), 550 * (i + 1)));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="py-14 text-center">
      <div
        className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-se-surface-offset border-t-se-primary"
        role="status"
        aria-label="Analyzing"
      />
      <h2 className="mt-6 font-display text-3xl text-se-text">Analyzing your books…</h2>
      <ul className="mx-auto mt-7 grid max-w-xs gap-2.5 text-left">
        {steps.map((s, i) => (
          <li
            key={s}
            className={
              "flex items-center gap-3 text-sm transition-opacity " +
              (i < on ? "text-se-text opacity-100" : "text-se-muted opacity-40")
            }
          >
            <span
              className={
                "h-4 w-4 flex-shrink-0 rounded-full border-2 " +
                (i < on ? "border-se-primary bg-se-primary" : "border-se-border")
              }
            />
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── result ───────────────────────────────────────────────────────────────────
function Result({
  result,
  answers,
  onContinue,
}: {
  result: ScoreResult;
  answers: Partial<Answers>;
  onContinue: () => void;
}) {
  const tier = TIER_CONTENT[result.tier];
  const scorecard = buildScorecard(answers, result.tier);
  return (
    <section>
      <span className="text-xs font-bold uppercase tracking-wider text-se-accent">
        {RESULT_EYEBROW} · {tier.label}
      </span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-se-text sm:text-4xl">
        {tier.headline}
      </h1>
      <p className="mt-4 max-w-prose text-xl text-se-muted">{tier.intro}</p>

      <div className="mt-6 rounded-2xl border border-se-border bg-se-surface p-6">
        <p className="text-se-text">{tier.diagnosis}</p>
      </div>

      {/* Audit scorecard */}
      <h2 className="mt-9 font-display text-2xl text-se-text">Your audit scorecard</h2>
      <div className="mt-4 grid gap-3">
        {scorecard.map((row) => (
          <div
            key={row.category}
            className="rounded-xl border border-se-border bg-se-surface-2 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-se-text">{row.category}</h3>
              <span
                className={
                  "rounded-full px-2.5 py-0.5 text-xs font-bold " + bandPillClass(row.band)
                }
              >
                {BAND_LABEL[row.band]}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-se-surface-offset">
              <span
                className="block h-full rounded-full bg-se-accent"
                style={{ width: `${((BAND_ORDER[row.band] + 1) / 4) * 100}%` }}
              />
            </div>
            <p className="mt-2.5 text-sm text-se-muted">{row.interpretation}</p>
          </div>
        ))}
      </div>

      {/* What happens on the call */}
      <div className="mt-9 rounded-2xl border border-se-border bg-se-surface p-6">
        <h2 className="font-display text-2xl text-se-text">{CALL_SECTION.heading}</h2>
        <p className="mt-2 text-se-muted">{CALL_SECTION.intro}</p>
        <ul className="mt-4 grid gap-2.5">
          {CALL_SECTION.points.map((p) => (
            <li key={p} className="flex gap-3 text-se-text">
              <CheckIcon />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 max-sm:sticky max-sm:bottom-4 max-sm:z-10">
        <PrimaryButton onClick={onContinue} className="w-full sm:w-auto">
          {PRIMARY_CTA_LABEL} →
        </PrimaryButton>
      </div>
    </section>
  );
}

// ── capture ──────────────────────────────────────────────────────────────────
function Capture({
  firstName,
  lastName,
  email,
  phone,
  company,
  setFirstName,
  setLastName,
  setEmail,
  setPhone,
  setCompany,
  hpRef,
  submitState,
  formError,
  errorMessage,
  onSubmit,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setCompany: (v: string) => void;
  hpRef: React.RefObject<HTMLInputElement>;
  submitState: SubmitState;
  formError: string;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const inputClass =
    "min-h-[50px] w-full rounded-xl border border-se-border bg-se-surface-2 px-4 text-base text-se-text placeholder:text-se-muted focus-visible:border-se-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-se-primary/40";
  const labelClass = "mb-1.5 block text-sm font-semibold text-se-text";
  const optional = <span className="font-normal text-se-muted">(optional)</span>;
  return (
    <section>
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-se-muted">
        Almost there
      </div>
      <h1 className="font-display text-3xl font-normal leading-tight text-se-text sm:text-4xl">
        Your Books Rescue results are ready
      </h1>
      <p className="mt-3 max-w-prose text-se-muted">
        Enter your details to see your score and personalized scorecard.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
        <div>
          <label htmlFor="br-first" className={labelClass}>
            First name
          </label>
          <input
            id="br-first"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="br-last" className={labelClass}>
            Last name {optional}
          </label>
          <input
            id="br-last"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="br-email" className={labelClass}>
            Email
          </label>
          <input
            id="br-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="br-phone" className={labelClass}>
            Phone {optional}
          </label>
          <input
            id="br-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="br-company" className={labelClass}>
            Business name {optional}
          </label>
          <input
            id="br-company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Honeypot — off-screen (not display:none), aria-hidden, untabbable. Must stay empty. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor="website_val">Website</label>
          <input
            ref={hpRef}
            id="website_val"
            name="website_val"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {/* Cloudflare Turnstile — only when a site key is configured. */}
        {TURNSTILE_SITE_KEY && (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="lazyOnload"
            />
            <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" />
          </>
        )}

        {formError && (
          <p role="alert" className="text-sm font-semibold text-se-accent">
            {formError}
          </p>
        )}

        <PrimaryButton type="submit" disabled={submitState === "submitting"} className="w-full">
          {submitState === "submitting" ? "Sending…" : "See my results →"}
        </PrimaryButton>

        {submitState === "error" && (
          <p role="alert" className="text-sm text-se-accent">
            {errorMessage || "Something went wrong. Please try again."}
          </p>
        )}

        <p className="text-xs text-se-muted">
          By continuing you agree we may contact you about your results. Your information stays with
          Balance Beam.
        </p>
      </form>
    </section>
  );
}

// ── booking ──────────────────────────────────────────────────────────────────
function Booking({ firstName, email }: { firstName: string; email: string }) {
  const url = CALENDLY_URL
    ? `${CALENDLY_URL}${CALENDLY_URL.includes("?") ? "&" : "?"}hide_gdpr_banner=1` +
      (firstName ? `&name=${encodeURIComponent(firstName)}` : "") +
      (email ? `&email=${encodeURIComponent(email)}` : "")
    : "";
  return (
    <section>
      <span className="text-xs font-bold uppercase tracking-wider text-se-primary">
        One last step
      </span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-se-text sm:text-4xl">
        Pick a time for your rescue call
      </h1>
      <p className="mt-3 max-w-prose text-se-muted">{BOOKING_REASSURANCE}</p>

      {url ? (
        <>
          {/* Official Calendly widget, lazy-loaded only at the booking step. */}
          <Script
            src="https://assets.calendly.com/assets/external/widget.js"
            strategy="lazyOnload"
          />
          <div
            className="calendly-inline-widget mt-6 overflow-hidden rounded-2xl border border-se-border"
            data-url={url}
            style={{ minWidth: "280px", height: "680px" }}
          />
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-se-border bg-se-surface p-6 text-se-muted">
          Scheduling is being set up. We&apos;ll reach out by email to find a time.
        </div>
      )}
    </section>
  );
}

// ── icon ─────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="mt-1 h-5 w-5 flex-shrink-0 text-se-primary"
    >
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
