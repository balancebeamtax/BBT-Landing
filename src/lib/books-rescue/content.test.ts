import { describe, it, expect } from "vitest";
import { QUESTION_KEYS, RUBRIC, type Answers, type Tier } from "./scoring";
import {
  QUIZ,
  TIER_CONTENT,
  CALL_SECTION,
  PRIMARY_CTA_LABEL,
  buildScorecard,
} from "./content";

// This stands in for a page render test: vitest runs in a `node` environment
// with no DOM/testing-library (and no new deps allowed), so we validate the
// page's content/data contract — the part that actually carries the spec.

describe("quiz instrument matches the contract (Section 2/4)", () => {
  it("has the 7 questions in exact contract order", () => {
    expect(QUIZ.map((q) => q.key)).toEqual([...QUESTION_KEYS]);
    expect(QUIZ).toHaveLength(7);
  });

  it("each question has a non-empty prompt and exactly 4 options", () => {
    for (const q of QUIZ) {
      expect(q.prompt.trim().length).toBeGreaterThan(0);
      expect(q.options).toHaveLength(4);
      for (const opt of q.options) {
        expect(opt.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("option points are wired straight from the locked rubric", () => {
    for (const q of QUIZ) {
      expect(q.options.map((o) => o.points)).toEqual([...RUBRIC[q.key]]);
    }
  });
});

describe("result copy covers all four tiers (packet Section 5)", () => {
  const tiers: Tier[] = ["emergency", "crisis", "at-risk", "stable"];

  it("every tier has a headline, intro, diagnosis, and label", () => {
    for (const t of tiers) {
      const c = TIER_CONTENT[t];
      expect(c.headline.trim().length).toBeGreaterThan(0);
      expect(c.intro.trim().length).toBeGreaterThan(0);
      expect(c.diagnosis.trim().length).toBeGreaterThan(0);
      expect(c.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses the exact packet Section 5 headlines", () => {
    expect(TIER_CONTENT.emergency.headline).toBe(
      "Your books need a structured rescue — and the timing matters.",
    );
    expect(TIER_CONTENT.stable.headline).toBe(
      "Your books are in decent shape, with a few areas to tighten.",
    );
  });
});

describe("drift fixes hold (packet Section 4)", () => {
  // Collect all the copy the page can show.
  const allCopy = [
    ...QUIZ.flatMap((q) => [q.prompt, ...q.options.map((o) => o.label)]),
    ...Object.values(TIER_CONTENT).flatMap((c) => [c.headline, c.intro, c.diagnosis]),
    CALL_SECTION.heading,
    CALL_SECTION.intro,
    ...CALL_SECTION.points,
    PRIMARY_CTA_LABEL,
  ].join("\n");

  it("contains no alarming prototype words (fix #1)", () => {
    expect(allCopy).not.toMatch(/exposure|triage|critical/i);
  });

  it("call copy is length-neutral — no fixed-minutes claim (fix #4)", () => {
    expect(allCopy).not.toMatch(/\d+\s*minute/i);
    expect(allCopy).not.toMatch(/in 15 minutes/i);
  });

  it("carries no Extension Cleanup identifiers (anti-drift)", () => {
    expect(allCopy).not.toMatch(/extension-cleanup|d811fb0c|85b4e792/i);
  });
});

describe("audit scorecard is data-driven (contract Section 11)", () => {
  function full(indexes: number[]): Partial<Answers> {
    const a: Partial<Answers> = {};
    QUESTION_KEYS.forEach((k, i) => (a[k] = indexes[i]));
    return a;
  }

  it("returns the five mapped categories with interpretations", () => {
    const rows = buildScorecard(full([2, 2, 2, 2, 2, 2, 2]), "crisis");
    expect(rows.map((r) => r.category)).toEqual([
      "Bookkeeping currentness",
      "Reconciliation confidence",
      "Tax readiness",
      "Decision clarity",
      "Urgency level",
    ]);
    for (const r of rows) {
      expect(r.interpretation.trim().length).toBeGreaterThan(0);
    }
  });

  it("bands move with severity — all-floor reads lower than all-max", () => {
    const low = buildScorecard(full([0, 0, 0, 0, 0, 0, 0]), "stable");
    const high = buildScorecard(full([3, 3, 3, 3, 3, 3, 3]), "emergency");
    expect(low[0].band).toBe("low"); // currentness at idx 0
    expect(high[0].band).toBe("high"); // currentness at idx 3
    expect(low[4].band).toBe("low"); // urgency, stable tier
    expect(high[4].band).toBe("high"); // urgency, emergency tier
  });
});
