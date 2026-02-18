import { describe, it, expect } from "vitest";
import { REVERSE_SCORED_ITEMS } from "../constants";

/**
 * Reverse-scoring algorithm for the Edmondson 7-item survey.
 *
 * Items at indices in REVERSE_SCORED_ITEMS (0, 2, 4) are negatively framed
 * and need to be flipped on a 1-7 Likert scale: reversed = 8 - score.
 *
 * When multiple response sets are provided, the function first averages
 * each question across all respondents, then applies reverse scoring,
 * then computes the overall aggregate.
 */
function aggregateScores(
  allResponses: number[][]
): { aggregateScore: number; perQuestion: number[] } {
  const numQuestions = 7;
  const numResponses = allResponses.length;

  // Average each question across all responses
  const averaged: number[] = new Array(numQuestions).fill(0);
  for (let q = 0; q < numQuestions; q++) {
    let sum = 0;
    for (let r = 0; r < numResponses; r++) {
      sum += allResponses[r][q];
    }
    averaged[q] = sum / numResponses;
  }

  // Apply reverse scoring
  const scored: number[] = averaged.map((score, index) =>
    (REVERSE_SCORED_ITEMS as readonly number[]).includes(index)
      ? 8 - score
      : score
  );

  // Compute aggregate
  const aggregateScore =
    Math.round(
      (scored.reduce((sum, val) => sum + val, 0) / numQuestions) * 100
    ) / 100;

  return {
    aggregateScore,
    perQuestion: scored.map((s) => Math.round(s * 100) / 100),
  };
}

describe("aggregateScores", () => {
  it("correctly identifies reverse-scored items at indices 0, 2, 4", () => {
    expect([...REVERSE_SCORED_ITEMS]).toEqual([0, 2, 4]);
  });

  describe("all 7s response", () => {
    it("reverse items become 1, forward items stay 7, average = 4.43", () => {
      const responses = [[7, 7, 7, 7, 7, 7, 7]];
      const result = aggregateScores(responses);

      // Indices 0, 2, 4 are reversed: 8 - 7 = 1
      // Indices 1, 3, 5, 6 stay: 7
      // Expected per-question: [1, 7, 1, 7, 1, 7, 7]
      expect(result.perQuestion).toEqual([1, 7, 1, 7, 1, 7, 7]);

      // Average: (1 + 7 + 1 + 7 + 1 + 7 + 7) / 7 = 31 / 7 = 4.428... ≈ 4.43
      expect(result.aggregateScore).toBeCloseTo(4.43, 2);
    });
  });

  describe("all 1s response", () => {
    it("reverse items become 7, forward items stay 1, average = 3.57", () => {
      const responses = [[1, 1, 1, 1, 1, 1, 1]];
      const result = aggregateScores(responses);

      // Indices 0, 2, 4 are reversed: 8 - 1 = 7
      // Indices 1, 3, 5, 6 stay: 1
      // Expected per-question: [7, 1, 7, 1, 7, 1, 1]
      expect(result.perQuestion).toEqual([7, 1, 7, 1, 7, 1, 1]);

      // Average: (7 + 1 + 7 + 1 + 7 + 1 + 1) / 7 = 25 / 7 = 3.571... ≈ 3.57
      expect(result.aggregateScore).toBeCloseTo(3.57, 2);
    });
  });

  describe("mixed response [3,5,2,6,4,7,1]", () => {
    it("applies reverse scoring and computes average = 4.86", () => {
      const responses = [[3, 5, 2, 6, 4, 7, 1]];
      const result = aggregateScores(responses);

      // Index 0: 8 - 3 = 5
      // Index 1: 5 (forward)
      // Index 2: 8 - 2 = 6
      // Index 3: 6 (forward)
      // Index 4: 8 - 4 = 4
      // Index 5: 7 (forward)
      // Index 6: 1 (forward)
      expect(result.perQuestion).toEqual([5, 5, 6, 6, 4, 7, 1]);

      // Average: (5 + 5 + 6 + 6 + 4 + 7 + 1) / 7 = 34 / 7 = 4.857... ≈ 4.86
      expect(result.aggregateScore).toBeCloseTo(4.86, 2);
    });
  });

  describe("multiple responses are averaged correctly", () => {
    it("averages across respondents before scoring", () => {
      const responses = [
        [7, 7, 7, 7, 7, 7, 7],
        [1, 1, 1, 1, 1, 1, 1],
      ];
      const result = aggregateScores(responses);

      // Averaged per question: [4, 4, 4, 4, 4, 4, 4]
      // After reverse scoring (indices 0, 2, 4): [4, 4, 4, 4, 4, 4, 4]
      // 8 - 4 = 4 for reversed, 4 for forward — all become 4
      expect(result.perQuestion).toEqual([4, 4, 4, 4, 4, 4, 4]);

      // Average: 4.0
      expect(result.aggregateScore).toBe(4);
    });

    it("handles three respondents with varied scores", () => {
      const responses = [
        [1, 2, 3, 4, 5, 6, 7],
        [7, 6, 5, 4, 3, 2, 1],
        [4, 4, 4, 4, 4, 4, 4],
      ];
      const result = aggregateScores(responses);

      // Averaged per question: [4, 4, 4, 4, 4, 4, 4]
      // After reverse scoring: [4, 4, 4, 4, 4, 4, 4]
      expect(result.perQuestion).toEqual([4, 4, 4, 4, 4, 4, 4]);
      expect(result.aggregateScore).toBe(4);
    });
  });

  describe("edge case: single response", () => {
    it("single response is the same as the input (after scoring)", () => {
      const responses = [[2, 5, 3, 6, 1, 4, 7]];
      const result = aggregateScores(responses);

      // Index 0: 8 - 2 = 6
      // Index 1: 5
      // Index 2: 8 - 3 = 5
      // Index 3: 6
      // Index 4: 8 - 1 = 7
      // Index 5: 4
      // Index 6: 7
      expect(result.perQuestion).toEqual([6, 5, 5, 6, 7, 4, 7]);

      // Average: (6 + 5 + 5 + 6 + 7 + 4 + 7) / 7 = 40 / 7 = 5.714... ≈ 5.71
      expect(result.aggregateScore).toBeCloseTo(5.71, 2);
    });
  });

  describe("score boundaries", () => {
    it("handles minimum valid scores (all 1s)", () => {
      const result = aggregateScores([[1, 1, 1, 1, 1, 1, 1]]);
      for (const score of result.perQuestion) {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(7);
      }
    });

    it("handles maximum valid scores (all 7s)", () => {
      const result = aggregateScores([[7, 7, 7, 7, 7, 7, 7]]);
      for (const score of result.perQuestion) {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(7);
      }
    });

    it("aggregate score is always between 1 and 7", () => {
      const testCases = [
        [[1, 1, 1, 1, 1, 1, 1]],
        [[7, 7, 7, 7, 7, 7, 7]],
        [[4, 4, 4, 4, 4, 4, 4]],
        [[1, 7, 1, 7, 1, 7, 1]],
      ];

      for (const responses of testCases) {
        const result = aggregateScores(responses);
        expect(result.aggregateScore).toBeGreaterThanOrEqual(1);
        expect(result.aggregateScore).toBeLessThanOrEqual(7);
      }
    });
  });
});
