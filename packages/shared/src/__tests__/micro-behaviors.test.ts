import { describe, it, expect } from "vitest";
import { MICRO_BEHAVIORS } from "../micro-behaviors";
import type { ScarfDomain, BehaviorCategory } from "../types";

const VALID_SCARF_DOMAINS: ScarfDomain[] = [
  "status",
  "certainty",
  "autonomy",
  "relatedness",
  "fairness",
];

const VALID_CATEGORIES: BehaviorCategory[] = [
  "question",
  "vulnerability",
  "acknowledgment",
  "space_making",
];

describe("MICRO_BEHAVIORS", () => {
  it("contains exactly 10 behaviors", () => {
    expect(MICRO_BEHAVIORS).toHaveLength(10);
  });

  it("has unique IDs mb-01 through mb-10", () => {
    const expectedIds = Array.from({ length: 10 }, (_, i) =>
      `mb-${String(i + 1).padStart(2, "0")}`
    );
    const actualIds = MICRO_BEHAVIORS.map((b) => b.id);
    expect(actualIds).toEqual(expectedIds);
  });

  it("has no duplicate IDs", () => {
    const ids = MICRO_BEHAVIORS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no duplicate ranks", () => {
    const ranks = MICRO_BEHAVIORS.map((b) => b.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  describe("tier distribution", () => {
    it("has 5 behaviors in Tier 1 (ranks 1-5)", () => {
      const tier1 = MICRO_BEHAVIORS.filter((b) => b.tier === 1);
      expect(tier1).toHaveLength(5);
      const ranks = tier1.map((b) => b.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([1, 2, 3, 4, 5]);
    });

    it("has 5 behaviors in Tier 2 (ranks 6-10)", () => {
      const tier2 = MICRO_BEHAVIORS.filter((b) => b.tier === 2);
      expect(tier2).toHaveLength(5);
      const ranks = tier2.map((b) => b.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe("required fields", () => {
    for (const behavior of MICRO_BEHAVIORS) {
      describe(`${behavior.id}: ${behavior.name}`, () => {
        it("has a non-empty id", () => {
          expect(behavior.id).toBeTruthy();
          expect(typeof behavior.id).toBe("string");
        });

        it("has a non-empty name", () => {
          expect(behavior.name).toBeTruthy();
          expect(typeof behavior.name).toBe("string");
        });

        it("has a non-empty description", () => {
          expect(behavior.description).toBeTruthy();
          expect(typeof behavior.description).toBe("string");
        });

        it("has a valid tier (1 or 2)", () => {
          expect([1, 2]).toContain(behavior.tier);
        });

        it("has a numeric rank", () => {
          expect(typeof behavior.rank).toBe("number");
          expect(behavior.rank).toBeGreaterThanOrEqual(1);
          expect(behavior.rank).toBeLessThanOrEqual(10);
        });

        it("has a non-empty scarfDomains array with valid values", () => {
          expect(Array.isArray(behavior.scarfDomains)).toBe(true);
          expect(behavior.scarfDomains.length).toBeGreaterThan(0);
          for (const domain of behavior.scarfDomains) {
            expect(VALID_SCARF_DOMAINS).toContain(domain);
          }
        });

        it("has a valid category", () => {
          expect(VALID_CATEGORIES).toContain(behavior.category);
        });

        it("has a timeSeconds value", () => {
          expect(behavior.timeSeconds).toBeTruthy();
        });

        it("has exactly 3 example scripts", () => {
          expect(Array.isArray(behavior.exampleScripts)).toBe(true);
          expect(behavior.exampleScripts).toHaveLength(3);
          for (const script of behavior.exampleScripts) {
            expect(typeof script).toBe("string");
            expect(script.length).toBeGreaterThan(0);
          }
        });

        it("has a non-empty neuroscienceBasis", () => {
          expect(behavior.neuroscienceBasis).toBeTruthy();
          expect(typeof behavior.neuroscienceBasis).toBe("string");
        });
      });
    }
  });

  describe("SCARF domain validation", () => {
    it("all scarfDomains entries are valid SCARF domains", () => {
      for (const behavior of MICRO_BEHAVIORS) {
        for (const domain of behavior.scarfDomains) {
          expect(VALID_SCARF_DOMAINS).toContain(domain);
        }
      }
    });
  });

  describe("category validation", () => {
    it("all categories are one of: question, vulnerability, acknowledgment, space_making", () => {
      for (const behavior of MICRO_BEHAVIORS) {
        expect(VALID_CATEGORIES).toContain(behavior.category);
      }
    });
  });
});
