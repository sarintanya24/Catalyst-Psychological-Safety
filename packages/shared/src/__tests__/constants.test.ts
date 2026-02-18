import { describe, it, expect } from "vitest";
import {
  EDMONDSON_SURVEY,
  REVERSE_SCORED_ITEMS,
  SAFEGUARDS,
  FREQUENCY_CONFIG,
  STAGE_THRESHOLDS,
} from "../constants";

describe("EDMONDSON_SURVEY", () => {
  it("has exactly 7 items", () => {
    expect(EDMONDSON_SURVEY).toHaveLength(7);
  });

  it("every item is a non-empty string", () => {
    for (const item of EDMONDSON_SURVEY) {
      expect(typeof item).toBe("string");
      expect(item.length).toBeGreaterThan(0);
    }
  });
});

describe("REVERSE_SCORED_ITEMS", () => {
  it("contains exactly [0, 2, 4]", () => {
    expect([...REVERSE_SCORED_ITEMS]).toEqual([0, 2, 4]);
  });

  it("has 3 items", () => {
    expect(REVERSE_SCORED_ITEMS).toHaveLength(3);
  });

  it("all indices are within the survey range (0-6)", () => {
    for (const index of REVERSE_SCORED_ITEMS) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(EDMONDSON_SURVEY.length);
    }
  });
});

describe("SAFEGUARDS", () => {
  it("maxNudgesPerDay is 1", () => {
    expect(SAFEGUARDS.maxNudgesPerDay).toBe(1);
  });

  it("autoDialDownAfterSkips is 3", () => {
    expect(SAFEGUARDS.autoDialDownAfterSkips).toBe(3);
  });

  it("minPulseResponses is 3 (for anonymity)", () => {
    expect(SAFEGUARDS.minPulseResponses).toBe(3);
  });

  it("has all expected safeguard keys", () => {
    expect(SAFEGUARDS).toHaveProperty("maxNudgesPerDay");
    expect(SAFEGUARDS).toHaveProperty("quietHoursDefault");
    expect(SAFEGUARDS).toHaveProperty("weekendsOffDefault");
    expect(SAFEGUARDS).toHaveProperty("cooldownAfterSkipHours");
    expect(SAFEGUARDS).toHaveProperty("backToBackMeetingThresholdHours");
    expect(SAFEGUARDS).toHaveProperty("autoDialDownAfterSkips");
    expect(SAFEGUARDS).toHaveProperty("onboardingRampWeeks");
    expect(SAFEGUARDS).toHaveProperty("minPulseResponses");
  });
});

describe("FREQUENCY_CONFIG", () => {
  it("has keys: gentle, steady, immersive", () => {
    expect(Object.keys(FREQUENCY_CONFIG).sort()).toEqual(
      ["gentle", "immersive", "steady"].sort()
    );
  });

  it("each frequency has perWeek and description", () => {
    for (const key of ["gentle", "steady", "immersive"] as const) {
      const config = FREQUENCY_CONFIG[key];
      expect(typeof config.perWeek).toBe("number");
      expect(typeof config.description).toBe("string");
      expect(config.perWeek).toBeGreaterThan(0);
      expect(config.description.length).toBeGreaterThan(0);
    }
  });

  it("gentle < steady < immersive in perWeek", () => {
    expect(FREQUENCY_CONFIG.gentle.perWeek).toBeLessThan(
      FREQUENCY_CONFIG.steady.perWeek
    );
    expect(FREQUENCY_CONFIG.steady.perWeek).toBeLessThan(
      FREQUENCY_CONFIG.immersive.perWeek
    );
  });
});

describe("STAGE_THRESHOLDS", () => {
  it("has stages 1 through 4", () => {
    const keys = Object.keys(STAGE_THRESHOLDS).map(Number).sort((a, b) => a - b);
    expect(keys).toEqual([1, 2, 3, 4]);
  });

  it("each stage has minWeeks and label", () => {
    for (const stage of [1, 2, 3, 4] as const) {
      const threshold = STAGE_THRESHOLDS[stage];
      expect(typeof threshold.minWeeks).toBe("number");
      expect(typeof threshold.label).toBe("string");
      expect(threshold.minWeeks).toBeGreaterThanOrEqual(0);
      expect(threshold.label.length).toBeGreaterThan(0);
    }
  });

  it("stages have increasing minWeeks", () => {
    expect(STAGE_THRESHOLDS[1].minWeeks).toBeLessThan(
      STAGE_THRESHOLDS[2].minWeeks
    );
    expect(STAGE_THRESHOLDS[2].minWeeks).toBeLessThan(
      STAGE_THRESHOLDS[3].minWeeks
    );
    expect(STAGE_THRESHOLDS[3].minWeeks).toBeLessThan(
      STAGE_THRESHOLDS[4].minWeeks
    );
  });
});
