/**
 * Books Rescue Diagnostic — page content (IMP-233).
 *
 * Two kinds of copy live here:
 *
 *  1. LOCKED, load-bearing — the 7 question prompts and option labels are
 *     transcribed verbatim from the scorer contract Section 2
 *     (`imp-233-books-rescue-quiz-scorer-contract.md`). The tier headlines and
 *     intro lines are verbatim from the build packet Section 5 table. Do not
 *     edit these without updating the source docs.
 *
 *  2. DISPLAY LAYER, tunable — the diagnosis paragraphs, "what happens on the
 *     call" copy, and the audit-scorecard interpretation sentences. The packet
 *     (Section 5, Section 11, open item 4) marks these as presentational and
 *     finalized at page-port time. They are calm, plain-English, self-
 *     description (not verdict), length-neutral, with no alarm/fear hooks and
 *     no Extension Cleanup identifiers (balancebeamteam.com lane only).
 *
 * Points are never duplicated here — they are read from the rubric in
 * `scoring.ts`, the single source.
 */

import {
  QUESTION_KEYS,
  RUBRIC,
  DIM_OF,
  type QuestionKey,
  type Dimension,
  type Tier,
  type Answers,
} from './scoring';

// ─────────────────────────────────────────────────────────────────────────
// 1. The quiz instrument — LOCKED copy (contract Section 2)
// ─────────────────────────────────────────────────────────────────────────

export interface QuizOption {
  label: string;
  /** Points awarded for this choiceIndex, sourced from the locked rubric. */
  points: number;
}

export interface QuizQuestion {
  key: QuestionKey;
  dimension: Dimension;
  prompt: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
}

/** Verbatim option labels per dimension, choiceIndex 0..3 (least → most severe). */
const OPTION_LABELS: Record<QuestionKey, [string, string, string, string]> = {
  recency: [
    'Within the last month',
    'A couple of months ago',
    'Several months back',
    "I'm honestly not sure",
  ],
  confidence: [
    'Ready to share as-is',
    "I'd add a quick note or two",
    "I'd want to walk them through it first",
    "I'd need to do some prep before sharing",
  ],
  deadline_pressure: [
    'Nothing major coming up',
    'Something is on the calendar this quarter',
    'A deadline is coming up soon — within six weeks',
    "A deadline has passed or I'm already in catch-up mode",
  ],
  tx_complexity: [
    'Clean and mostly automatic',
    'Manageable — some manual steps but nothing broken',
    "A few different tools that don't always talk to each other",
    'Genuinely hard to follow without digging',
  ],
  owner_burden: [
    'Very little — it mostly takes care of itself',
    'An hour or two, spread across the week',
    'Enough to notice — it pulls me away from other things',
    "It's become its own unpredictable project",
  ],
  surprise_rate: [
    'Rarely — things usually stay put',
    'Sometimes — a couple of times a month',
    'Regularly enough that it feels normal',
    "Frequently — I can't fully trust what I'm looking at",
  ],
  decision_drag: [
    'No — things have moved forward as planned',
    'Once or twice — small delays, nothing significant',
    'A few times — it slowed things down noticeably',
    "Pretty regularly — it's become a recurring friction point",
  ],
};

/** Verbatim question prompts (contract Section 2). */
const PROMPTS: Record<QuestionKey, string> = {
  recency:
    "When was the last time your books were where you'd want them — not in progress, but actually done?",
  confidence:
    'If you needed to share your financials with someone outside the business today — accountant, lender, or partner — how ready would you feel?',
  deadline_pressure:
    'Is there a financial or tax deadline coming up — and how does your current bookkeeping situation line up with it?',
  tx_complexity:
    'How would you describe the way money flows through your business — bank accounts, cards, platforms, payment tools?',
  owner_burden:
    'In a typical week, how much of your personal time goes toward bookkeeping — categorizing, reconciling, chasing down receipts, fixing syncs?',
  surprise_rate:
    'How often do you come across something in the books that you thought was already handled — a duplicate, a wrong category, a missing entry?',
  decision_drag:
    'In the last few months, has uncertainty about the finances made you pause on something — a pricing decision, a hire, a plan you wanted to move forward on?',
};

/** The 7 questions in contract order, points wired from the locked rubric. */
export const QUIZ: QuizQuestion[] = QUESTION_KEYS.map((key) => {
  const labels = OPTION_LABELS[key];
  const points = RUBRIC[key];
  return {
    key,
    dimension: DIM_OF[key],
    prompt: PROMPTS[key],
    options: [
      { label: labels[0], points: points[0] },
      { label: labels[1], points: points[1] },
      { label: labels[2], points: points[2] },
      { label: labels[3], points: points[3] },
    ],
  };
});

// ─────────────────────────────────────────────────────────────────────────
// 2. Result copy — tier headline/intro LOCKED (packet Section 5); diagnosis
//    is the tunable display layer.
// ─────────────────────────────────────────────────────────────────────────

export interface TierContent {
  /** Verbatim from packet Section 5. */
  headline: string;
  /** Verbatim from packet Section 5. */
  intro: string;
  /** Display layer — calm, length-neutral diagnosis paragraph. */
  diagnosis: string;
  label: string;
}

export const TIER_CONTENT: Record<Tier, TierContent> = {
  emergency: {
    label: 'Emergency',
    headline: 'Your books need a structured rescue — and the timing matters.',
    intro:
      'Your answers point to meaningful gaps with a deadline already pressing. This is the most time-sensitive path, and a focused call is the fastest way through it.',
    diagnosis:
      'Across your answers, several areas are stretched at once — and a deadline is already pressing. That combination is the most time-sensitive, but it is also very workable with a clear plan. The point of a call is to get the books to a reliable state and line them up against what is due, in the right order.',
  },
  crisis: {
    label: 'Crisis',
    headline: "Your books likely need a focused cleanup before they're reliable.",
    intro:
      'Your answers suggest the books have drifted enough to affect confident reporting, with a deadline in view. A short call maps the fastest cleanup path.',
    diagnosis:
      'Your answers point to books that have drifted enough to make confident reporting hard, with a deadline coming into view. Nothing here is unusual or alarming — it is a focused cleanup, and starting now leaves the most room to do it well before the deadline.',
  },
  'at-risk': {
    label: 'At-Risk',
    headline: 'A few areas of your books are worth addressing before they compound.',
    intro:
      'Your answers show some gaps building up — manageable now, easier to fix early. A short call clarifies what to tackle first.',
    diagnosis:
      'A few areas are starting to build up — the kind of gaps that are easy to fix now and harder to unwind later. You are not behind in any serious way; this is about tightening things while they are still small.',
  },
  stable: {
    label: 'Stable',
    headline: 'Your books are in decent shape, with a few areas to tighten.',
    intro:
      "Your answers suggest you're mostly current. A short call can confirm what's solid and tune the rest for year-round confidence.",
    diagnosis:
      'Your answers suggest you are mostly current and in good shape. The value of a call here is confirmation — making sure what is solid really is, and tuning the few areas that could be cleaner for year-round confidence.',
  },
};

/**
 * "What happens on the call" — display layer, LENGTH-NEUTRAL (drift fix #4: no
 * "in 15 minutes", since the booked event can run up to 60 minutes).
 */
export const CALL_SECTION = {
  heading: 'What happens on the call',
  intro: 'A short call to walk through your results together and map the fastest path forward.',
  points: [
    'Review what your answers point to and where your books actually stand.',
    'Identify what to tackle first — and what can wait.',
    'Outline a clear, right-sized plan to get current and stay that way.',
  ],
} as const;

export const PRIMARY_CTA_LABEL = 'Schedule my rescue call';

/** Booking-step reassurance — display layer (calm, no alarm). */
export const BOOKING_REASSURANCE =
  "Pick a time that works — you'll get a confirmation by email right away. If nothing fits, reply to that email and we'll find one together.";

// ─────────────────────────────────────────────────────────────────────────
// 3. Audit scorecard — data-driven from answers (contract Section 11 mapping;
//    band logic + interpretation copy are the tunable display layer).
// ─────────────────────────────────────────────────────────────────────────

export type Band = 'low' | 'moderate' | 'elevated' | 'high';

export const BAND_ORDER: Record<Band, number> = { low: 0, moderate: 1, elevated: 2, high: 3 };

/** Single-question band: choiceIndex maps straight onto the four bands. */
function bandByIndex(idx: number | undefined): Band {
  switch (idx) {
    case 0:
      return 'low';
    case 1:
      return 'moderate';
    case 2:
      return 'elevated';
    case 3:
      return 'high';
    default:
      return 'low';
  }
}

/** Two-question band: sum of the two choiceIndexes (0..6) → band. */
function bandByCombined(a: number | undefined, b: number | undefined): Band {
  const sum = (a ?? 0) + (b ?? 0);
  if (sum <= 1) return 'low';
  if (sum <= 3) return 'moderate';
  if (sum <= 5) return 'elevated';
  return 'high';
}

function bandByTier(tier: Tier): Band {
  switch (tier) {
    case 'stable':
      return 'low';
    case 'at-risk':
      return 'moderate';
    case 'crisis':
      return 'elevated';
    case 'emergency':
      return 'high';
  }
}

export interface ScorecardRow {
  category: string;
  band: Band;
  interpretation: string;
}

/** Interpretation sentence per category per band (display layer, tunable). */
const INTERPRETATIONS: Record<string, Record<Band, string>> = {
  'Bookkeeping currentness': {
    low: 'Your books are current and usable as a day-to-day reference.',
    moderate: "A little drift has built up, but nothing that can't be caught up quickly.",
    elevated: 'Enough time has passed that the current picture needs a real catch-up.',
    high: "It's unclear where the books stand right now — that's the first thing to settle.",
  },
  'Reconciliation confidence': {
    low: 'Money flows through cleanly and little slips past unnoticed.',
    moderate: 'Mostly in order, with the occasional item worth a second look.',
    elevated: 'Enough moving parts that things slip through more often than they should.',
    high: 'Hard to fully trust the running balances without a reconciliation pass.',
  },
  'Tax readiness': {
    low: 'You could hand your numbers to a preparer or lender today without much prep.',
    moderate: 'Close to ready — a few items to tidy before anything formal.',
    elevated: 'There is prep to do before the numbers would hold up to outside review.',
    high: "A deadline is pressing and the books aren't ready to support it yet.",
  },
  'Decision clarity': {
    low: 'The numbers are clear enough to make calls without second-guessing.',
    moderate: 'Once or twice the finances have made you pause, but nothing major.',
    elevated: 'Uncertainty in the books has slowed a few real decisions.',
    high: 'Financial uncertainty has become a recurring drag on moving forward.',
  },
  'Urgency level': {
    low: 'No real time pressure — improvements can happen at a steady pace.',
    moderate: 'Worth addressing soon, while the fixes are still small.',
    elevated: 'Time-sensitive — the sooner this is mapped out, the easier it is.',
    high: 'The most time-sensitive path — a focused plan now makes the biggest difference.',
  },
};

/**
 * Build the five-row audit scorecard for a set of answers + tier.
 * Source mapping is the contract Section 11; band logic + copy are display.
 */
export function buildScorecard(answers: Partial<Answers>, tier: Tier): ScorecardRow[] {
  const rows: { category: string; band: Band }[] = [
    { category: 'Bookkeeping currentness', band: bandByIndex(answers.recency) },
    {
      category: 'Reconciliation confidence',
      band: bandByCombined(answers.tx_complexity, answers.surprise_rate),
    },
    {
      category: 'Tax readiness',
      band: bandByCombined(answers.confidence, answers.deadline_pressure),
    },
    { category: 'Decision clarity', band: bandByIndex(answers.decision_drag) },
    { category: 'Urgency level', band: bandByTier(tier) },
  ];
  return rows.map(({ category, band }) => ({
    category,
    band,
    interpretation: INTERPRETATIONS[category][band],
  }));
}

export const RESULT_EYEBROW = 'Your Books Rescue result';
