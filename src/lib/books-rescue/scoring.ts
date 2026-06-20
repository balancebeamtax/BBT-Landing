/**
 * Books Rescue Diagnostic — scoring module (IMP-233).
 *
 * Single in-repo source of the quiz↔scorer contract, mirroring
 * `docs/imp/imp-233-books-rescue-quiz-scorer-contract.md` (LOCKED 2026-06-16)
 * and the deployed n8n "Quality Scorer" node (workflow bBOl4vZI86LcGJED).
 *
 * AUTHORITY: scoring is recomputed server-side in n8n and is authoritative.
 * Anything this module computes on the client is DISPLAY / TELEMETRY ONLY and
 * is never trusted for routing (OWASP A06 — Insecure Design). The page sends
 * the seven answer indexes; n8n derives points from its own copy of the rubric.
 *
 * The constants below are byte-for-byte the contract's Section 4 rubric,
 * Section 3 dimension map, Section 5 cutoffs, and Section 6 deadline floor.
 */

/** The seven dimensions, in contract order (Q1..Q7). */
export const QUESTION_KEYS = [
  'recency',
  'confidence',
  'deadline_pressure',
  'tx_complexity',
  'owner_burden',
  'surprise_rate',
  'decision_drag',
] as const;

export type QuestionKey = (typeof QUESTION_KEYS)[number];

/**
 * Canonical points table (contract Section 4). Index 0..3 = choiceIndex, least
 * → most severe. n8n holds the identical table; the page never sends points.
 */
export const RUBRIC: Record<QuestionKey, readonly [number, number, number, number]> = {
  recency: [2, 8, 16, 24],
  confidence: [2, 8, 16, 22],
  deadline_pressure: [4, 10, 18, 24],
  tx_complexity: [3, 9, 17, 23],
  owner_burden: [2, 8, 15, 21],
  surprise_rate: [2, 9, 16, 22],
  decision_drag: [2, 8, 16, 22],
} as const;

export type Dimension = 'deadline_risk' | 'confidence_risk' | 'ops_drag';

/** Question → dimension map (contract Section 3). */
export const DIM_OF: Record<QuestionKey, Dimension> = {
  recency: 'deadline_risk',
  deadline_pressure: 'deadline_risk',
  confidence: 'confidence_risk',
  surprise_rate: 'confidence_risk',
  tx_complexity: 'ops_drag',
  owner_burden: 'ops_drag',
  decision_drag: 'ops_drag',
};

export type Tier = 'emergency' | 'crisis' | 'at-risk' | 'stable';

/** Tier cutoffs — LOCKED (contract Section 5). Raw-score lower bounds. */
export const CUTOFFS = {
  emergency: 130,
  crisis: 102,
  'at-risk': 66,
} as const;

/** Theoretical bounds of the additive raw score (contract Section 3). */
export const SCORE_MIN = 17;
export const SCORE_MAX = 158;

/** Tier ranking for the deadline-floor comparison (contract Section 6). */
const RANK: Record<Tier, number> = { stable: 0, 'at-risk': 1, crisis: 2, emergency: 3 };

/** Tier → GHL tag map (contract Section 7). */
export const TIER_TAG: Record<Tier, string> = {
  emergency: 'books-rescue-emergency',
  crisis: 'books-rescue-crisis',
  'at-risk': 'books-rescue-at-risk',
  stable: 'books-rescue-stable',
};

/** A complete set of answers: each dimension → choiceIndex 0..3. */
export type Answers = Record<QuestionKey, number>;

export interface ScoreResult {
  score: number;
  tier: Tier;
  /** Per-dimension subtotals (contract Section 3 / scorecard Section 11). */
  dimensions: Record<Dimension, number>;
  /** True once every answer is a valid integer 0..3 (the deadline floor and
   *  tier are still computed from whatever valid answers are present). */
  complete: boolean;
}

function isValidIndex(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3;
}

/** Map a raw score to its tier using the locked cutoffs (no floor applied). */
export function tierForScore(score: number): Tier {
  if (score >= CUTOFFS.emergency) return 'emergency';
  if (score >= CUTOFFS.crisis) return 'crisis';
  if (score >= CUTOFFS['at-risk']) return 'at-risk';
  return 'stable';
}

/**
 * Compute the display score, dimension subtotals, and tier for a set of
 * answers, applying the LOCKED deadline floor (Section 6): if
 * `deadline_pressure` = idx 3 ("a deadline has passed / already in catch-up"),
 * the tier is raised to at least Crisis regardless of total.
 *
 * Missing/out-of-range answers contribute 0 and set `complete: false` — this
 * mirrors the n8n scorer, which never throws and lets the validity gate drop.
 */
export function computeResult(answers: Partial<Answers>): ScoreResult {
  let score = 0;
  const dimensions: Record<Dimension, number> = {
    deadline_risk: 0,
    confidence_risk: 0,
    ops_drag: 0,
  };
  let complete = true;

  for (const key of QUESTION_KEYS) {
    const idx = answers[key];
    if (!isValidIndex(idx)) {
      complete = false;
      continue;
    }
    const points = RUBRIC[key][idx];
    score += points;
    dimensions[DIM_OF[key]] += points;
  }

  let tier = tierForScore(score);

  // Deadline floor override — LOCKED ON (contract Section 6).
  if (answers.deadline_pressure === 3 && RANK[tier] < RANK.crisis) {
    tier = 'crisis';
  }

  return { score, tier, dimensions, complete };
}
