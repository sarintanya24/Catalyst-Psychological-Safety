import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────
// vi.hoisted() ensures these are available when vi.mock factories run
// (vi.mock calls are hoisted above all other code at transform time).

const {
  mockFindFirstUser,
  mockFindManyNudges,
  mockInsertValues,
  mockInsert,
  mockPersonalizeNudge,
} = vi.hoisted(() => {
  const mockInsertValues = vi.fn().mockResolvedValue(undefined);
  return {
    mockFindFirstUser: vi.fn(),
    mockFindManyNudges: vi.fn(),
    mockInsertValues,
    mockInsert: vi.fn().mockReturnValue({ values: mockInsertValues }),
    mockPersonalizeNudge: vi.fn().mockResolvedValue({
      question: "Test nudge question?",
      context: "Test context",
      options: ["Tried it", "Skip", "Remind me later"],
    }),
  };
});

vi.mock("../db/index.js", () => ({
  db: {
    query: {
      users: { findFirst: mockFindFirstUser },
      nudges: { findMany: mockFindManyNudges },
    },
    insert: mockInsert,
  },
  schema: { nudges: {}, users: {} },
}));

vi.mock("../services/claude.js", () => ({
  personalizeNudge: mockPersonalizeNudge,
}));

// drizzle-orm operators are used inside the service but we only need stubs
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
  gte: vi.fn((...args: unknown[]) => args),
}));

// ── Import under test (after mocks) ────────────────────────────────────
import { generateNudge } from "../services/nudge-engine.js";

// ── Helpers ─────────────────────────────────────────────────────────────

/** A fully-valid user that will pass every safeguard. */
const baseUser = {
  id: "user-1",
  name: "Test Leader",
  email: "leader@test.com",
  onboardedAt: new Date("2024-01-01"),
  pausedUntil: null,
  quietHoursStart: "08:00",
  quietHoursEnd: "19:00",
  weekendsOff: true,
  consecutiveSkips: 0,
  activeMicroBehaviorId: "mb-01",
  channels: { slack: true, email: true },
  scarfProfile: {
    status: 7,
    certainty: 5,
    autonomy: 8,
    relatedness: 6,
    fairness: 9,
  },
  dialDepth: "informed",
  streakCount: 3,
};

/**
 * Sets the fake clock to a known "good" time:
 *   Wednesday 2024-06-12 at 10:00 AM (within 08–19 quiet window, weekday).
 */
function setGoodTime() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-06-12T10:00:00")); // Wed
}

/**
 * Shorthand: set up happy-path defaults (user found, 0 nudges today).
 */
function setupHappyPath(userOverrides: Record<string, unknown> = {}) {
  mockFindFirstUser.mockResolvedValue({ ...baseUser, ...userOverrides });
  mockFindManyNudges.mockResolvedValue([]); // no nudges today
}

// ── Test suites ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  setGoodTime();
  setupHappyPath();
});

afterEach(() => {
  vi.useRealTimers();
});

// ========================================================================
// 1. SAFEGUARD TESTS
// ========================================================================

describe("Safeguard: early-return conditions", () => {
  // ---- 1. Not onboarded ------------------------------------------------
  it("returns without nudge when user is not onboarded (onboardedAt is null)", async () => {
    mockFindFirstUser.mockResolvedValue({ ...baseUser, onboardedAt: null });

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 2. Paused -------------------------------------------------------
  it("returns without nudge when user is paused (pausedUntil in the future)", async () => {
    setupHappyPath({
      pausedUntil: new Date("2099-01-01"), // far future
    });

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 3. Outside quiet hours — before start ---------------------------
  it("returns without nudge when current hour is before quietHoursStart", async () => {
    vi.setSystemTime(new Date("2024-06-12T06:00:00")); // 6 AM, before 8 AM start

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 4. Outside quiet hours — after end -------------------------------
  it("returns without nudge when current hour is at or after quietHoursEnd", async () => {
    vi.setSystemTime(new Date("2024-06-12T19:00:00")); // 19:00, >= endHour 19

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 5. Weekends off — Saturday --------------------------------------
  it("returns without nudge when weekendsOff is true and it is Saturday", async () => {
    vi.setSystemTime(new Date("2024-06-15T10:00:00")); // Saturday

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 6. Weekends allowed — Saturday generates nudge -------------------
  it("generates nudge when weekendsOff is false even on Saturday", async () => {
    vi.setSystemTime(new Date("2024-06-15T10:00:00")); // Saturday
    setupHappyPath({ weekendsOff: false });

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });

  // ---- 7. Daily limit reached ------------------------------------------
  it("returns without nudge when user already has MAX_NUDGES_PER_DAY nudges today", async () => {
    mockFindManyNudges.mockResolvedValue([{ id: "nudge-existing" }]); // 1 nudge already

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 8. Daily limit not reached — generates nudge --------------------
  it("generates nudge when user has 0 nudges today", async () => {
    mockFindManyNudges.mockResolvedValue([]); // 0 nudges

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });

  // ---- 9. 3+ consecutive skips — auto-dial-down -----------------------
  it("returns without nudge when consecutiveSkips >= AUTO_DIAL_DOWN_AFTER_SKIPS (3)", async () => {
    setupHappyPath({ consecutiveSkips: 3 });

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- 10. No active behavior ------------------------------------------
  it("returns without nudge when activeMicroBehaviorId is null", async () => {
    setupHappyPath({ activeMicroBehaviorId: null });

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns without nudge when activeMicroBehaviorId does not match any MICRO_BEHAVIORS", async () => {
    setupHappyPath({ activeMicroBehaviorId: "mb-nonexistent" });

    await generateNudge("user-1", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ---- Edge: user not found in DB --------------------------------------
  it("returns without nudge when user is not found in DB", async () => {
    mockFindFirstUser.mockResolvedValue(undefined);

    await generateNudge("nonexistent-user", "pre_meeting");

    expect(mockPersonalizeNudge).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

// ========================================================================
// 2. CHANNEL ROUTING TESTS
// ========================================================================

describe("Channel routing: selects correct delivery channel", () => {
  /** Helper: run generateNudge and capture the channel written to DB. */
  async function captureChannel(
    trigger: Parameters<typeof generateNudge>[1],
    channels: Record<string, boolean>,
  ): Promise<string> {
    setupHappyPath({ channels });

    await generateNudge("user-1", trigger);

    // mockInsertValues receives the object passed to .values(...)
    const insertedRow = mockInsertValues.mock.calls[0][0];
    return insertedRow.channel;
  }

  // ---- 11. pre_meeting + slack -----------------------------------------
  it("routes pre_meeting trigger to slack when slack is enabled", async () => {
    const channel = await captureChannel("pre_meeting", { slack: true });
    expect(channel).toBe("slack");
  });

  // ---- 12. post_meeting + zoom_post ------------------------------------
  it("routes post_meeting trigger to zoom_post when zoom_post is enabled", async () => {
    const channel = await captureChannel("post_meeting", {
      zoom_post: true,
    });
    expect(channel).toBe("zoom_post");
  });

  // ---- 13. weekly + email ----------------------------------------------
  it("routes weekly trigger to email when email is enabled", async () => {
    const channel = await captureChannel("weekly", { email: true });
    expect(channel).toBe("email");
  });

  // ---- 14. monday + email ----------------------------------------------
  it("routes monday trigger to email when email is enabled", async () => {
    const channel = await captureChannel("monday", { email: true });
    expect(channel).toBe("email");
  });

  // ---- 15. Fallback to slack -------------------------------------------
  it("falls back to slack when trigger has no specific match but slack is enabled", async () => {
    const channel = await captureChannel("contextual", { slack: true });
    expect(channel).toBe("slack");
  });

  // ---- 16. Fallback to teams -------------------------------------------
  it("falls back to teams when slack is not enabled but teams is", async () => {
    const channel = await captureChannel("contextual", {
      slack: false,
      teams: true,
    });
    expect(channel).toBe("teams");
  });

  // ---- 17. Ultimate fallback to in_app ---------------------------------
  it("falls back to in_app when no channels are enabled", async () => {
    const channel = await captureChannel("contextual", {});
    expect(channel).toBe("in_app");
  });
});

// ========================================================================
// 3. INTEGRATION / HAPPY-PATH TEST
// ========================================================================

describe("Happy path: end-to-end nudge generation", () => {
  // ---- 18. Full happy path ---------------------------------------------
  it("creates a nudge in DB with correct fields for a fully-onboarded user", async () => {
    setupHappyPath();

    await generateNudge("user-1", "pre_meeting", {
      attendeeName: "Alice",
      meetingType: "1:1",
    });

    // personalizeNudge was called with expected context
    expect(mockPersonalizeNudge).toHaveBeenCalledOnce();
    const nudgeArgs = mockPersonalizeNudge.mock.calls[0][0];
    expect(nudgeArgs.userName).toBe("Test Leader");
    expect(nudgeArgs.microBehavior.name).toBe("Ask before you state");
    expect(nudgeArgs.trigger).toBe("pre_meeting");
    expect(nudgeArgs.meetingContext).toEqual({
      attendeeName: "Alice",
      meetingType: "1:1",
    });
    expect(nudgeArgs.streakCount).toBe(3);
    expect(nudgeArgs.scarfProfile).toEqual(baseUser.scarfProfile);
    expect(nudgeArgs.depth).toBe("informed");

    // db.insert was called with schema.nudges
    expect(mockInsert).toHaveBeenCalledOnce();

    // The row passed to .values(...)
    const insertedRow = mockInsertValues.mock.calls[0][0];
    expect(insertedRow).toEqual({
      userId: "user-1",
      microBehaviorId: "mb-01",
      channel: "slack",
      trigger: "pre_meeting",
      content: {
        question: "Test nudge question?",
        context: "Test context",
        options: ["Tried it", "Skip", "Remind me later"],
      },
      meetingContext: { attendeeName: "Alice", meetingType: "1:1" },
    });
  });

  it("passes null for meetingContext when none is provided", async () => {
    setupHappyPath();

    await generateNudge("user-1", "weekly");

    const insertedRow = mockInsertValues.mock.calls[0][0];
    expect(insertedRow.meetingContext).toBeNull();
  });
});
