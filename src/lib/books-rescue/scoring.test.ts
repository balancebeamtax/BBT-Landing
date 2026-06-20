import { describe, it, expect } from "vitest";
import {
  computeResult,
  tierForScore,
  QUESTION_KEYS,
  RUBRIC,
  CUTOFFS,
  SCORE_MIN,
  SCORE_MAX,
  TIER_TAG,
  type Answers,
  type QuestionKey,
} from "./scoring";

// Build a full answer set from an ordered list of choiceIndexes (Q1..Q7).
function answersFrom(indexes: number[]): Answers {
  const a = {} as Answers;
  QUESTION_KEYS.forEach((k, i) => {
    a[k] = indexes[i];
  });
  return a;
}

describe("Books Rescue scoring — contract worked examples (Section 5/6)", () => {
  it("moderately behind, deadline soon, some friction (all idx 2) = 114 → Crisis", () => {
    const r = computeResult(answersFrom([2, 2, 2, 2, 2, 2, 2]));
    expect(r.score).toBe(114);
    expect(r.tier).toBe("crisis");
  });

  it("minor drift across the board (all idx 1) = 60 → Stable", () => {
    const r = computeResult(answersFrom([1, 1, 1, 1, 1, 1, 1]));
    expect(r.score).toBe(60);
    expect(r.tier).toBe("stable");
  });

  it("severe everywhere = 144 → Emergency", () => {
    // recency 2, confidence 3, deadline 3, tx 3, owner 3, surprise 2, decision 3
    const r = computeResult(answersFrom([2, 3, 3, 3, 3, 2, 3]));
    expect(r.score).toBe(144);
    expect(r.tier).toBe("emergency");
  });

  it("operationally messy, no urgency = 76 → At-Risk", () => {
    // ops maxed (tx/owner/decision = 3), everything else at floor (idx 0)
    const r = computeResult(answersFrom([0, 0, 0, 3, 3, 0, 3]));
    expect(r.score).toBe(76);
    expect(r.tier).toBe("at-risk");
  });

  it("deadline floor: passed deadline + unsure recency = 59 additive → floored to Crisis", () => {
    // recency 3, deadline_pressure 3, all else idx 0
    const r = computeResult(answersFrom([3, 0, 3, 0, 0, 0, 0]));
    expect(r.score).toBe(59); // raw additive lands in Stable…
    expect(r.tier).toBe("crisis"); // …floor raises it
  });
});

describe("score bounds (Section 3)", () => {
  it("all idx 0 → theoretical minimum 17, Stable", () => {
    const r = computeResult(answersFrom([0, 0, 0, 0, 0, 0, 0]));
    expect(r.score).toBe(SCORE_MIN);
    expect(r.score).toBe(17);
    expect(r.tier).toBe("stable");
  });

  it("all idx 3 → theoretical maximum 158, Emergency", () => {
    const r = computeResult(answersFrom([3, 3, 3, 3, 3, 3, 3]));
    expect(r.score).toBe(SCORE_MAX);
    expect(r.score).toBe(158);
    expect(r.tier).toBe("emergency");
  });
});

describe("tierForScore — cutoff boundaries (Section 5, LOCKED 130/102/66)", () => {
  it.each([
    [SCORE_MAX, "emergency"],
    [CUTOFFS.emergency, "emergency"],
    [CUTOFFS.emergency - 1, "crisis"],
    [CUTOFFS.crisis, "crisis"],
    [CUTOFFS.crisis - 1, "at-risk"],
    [CUTOFFS["at-risk"], "at-risk"],
    [CUTOFFS["at-risk"] - 1, "stable"],
    [SCORE_MIN, "stable"],
  ])("score %i → %s", (score, tier) => {
    expect(tierForScore(score)).toBe(tier);
  });
});

describe("deadline floor only ever raises (Section 6)", () => {
  it("does not downgrade an Emergency", () => {
    // all idx 3 = 158 Emergency, deadline_pressure idx 3 present
    const r = computeResult(answersFrom([3, 3, 3, 3, 3, 3, 3]));
    expect(r.tier).toBe("emergency");
  });

  it("only triggers on deadline_pressure idx 3, not idx 2", () => {
    // recency 3, deadline_pressure 2, rest 0 → 24+18+2+3+2+2+2 = 53 → Stable, no floor
    const r = computeResult(answersFrom([3, 0, 2, 0, 0, 0, 0]));
    expect(r.tier).toBe("stable");
  });
});

describe("dimension subtotals (Section 3)", () => {
  it("splits the 114 case across the three dimensions", () => {
    const r = computeResult(answersFrom([2, 2, 2, 2, 2, 2, 2]));
    expect(r.dimensions).toEqual({
      deadline_risk: 16 + 18, // recency + deadline_pressure
      confidence_risk: 16 + 16, // confidence + surprise_rate
      ops_drag: 17 + 15 + 16, // tx_complexity + owner_burden + decision_drag
    });
    // subtotals reconstruct the total
    const sum =
      r.dimensions.deadline_risk + r.dimensions.confidence_risk + r.dimensions.ops_drag;
    expect(sum).toBe(r.score);
  });
});

describe("completeness + invalid handling (mirrors n8n fail-closed gate)", () => {
  it("a full valid set is complete", () => {
    expect(computeResult(answersFrom([0, 1, 2, 3, 0, 1, 2])).complete).toBe(true);
  });

  it("a missing answer marks incomplete and contributes 0", () => {
    const partial: Partial<Answers> = { recency: 3 };
    const r = computeResult(partial);
    expect(r.complete).toBe(false);
    expect(r.score).toBe(24);
  });

  it("out-of-range / non-integer answers contribute 0 and mark incomplete", () => {
    const bad = { ...answersFrom([0, 0, 0, 0, 0, 0, 0]), recency: 4 } as Partial<Answers>;
    const r = computeResult(bad);
    expect(r.complete).toBe(false);
    // recency dropped (would have been 2), rest at floor 15 → 15
    expect(r.score).toBe(15);
  });
});

describe("rubric + tag invariants match the contract", () => {
  it("every rubric row has 4 ascending-by-severity point values", () => {
    (Object.keys(RUBRIC) as QuestionKey[]).forEach((k) => {
      const row = RUBRIC[k];
      expect(row).toHaveLength(4);
      expect(row[0]).toBeLessThan(row[1]);
      expect(row[1]).toBeLessThan(row[2]);
      expect(row[2]).toBeLessThan(row[3]);
    });
  });

  it("tier → tag map matches the locked Section 7 names", () => {
    expect(TIER_TAG).toEqual({
      emergency: "books-rescue-emergency",
      crisis: "books-rescue-crisis",
      "at-risk": "books-rescue-at-risk",
      stable: "books-rescue-stable",
    });
  });
});
