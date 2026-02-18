/**
 * Scenario 2: Nudge Engagement Cycle
 *
 * Tests the tried/skip/auto-dial-down flow:
 * - Fetching nudge list
 * - Responding "tried" increments streak, resets skips
 * - Responding "skipped" resets streak, increments consecutive skips
 * - 3 consecutive skips auto-dials frequency to "gentle"
 * - Responding to an already-responded nudge returns 400
 * - Responding to a nonexistent nudge returns 404
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import {
  resetStore,
  getStore,
  seedStore,
  setFindFirstResolver,
  setUpdateFilter,
} from "../helpers/mock-db.js";
import { buildApp, generateToken } from "../helpers/setup.js";
import type { FastifyInstance } from "fastify";

describe("Scenario 2: Nudge Engagement Cycle", () => {
  let app: FastifyInstance;
  const USER_ID = "user-nudge-test-0001";
  const EMAIL = "leader@techcorp.io";
  let token: string;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetStore();
    token = generateToken(app, { id: USER_ID, email: EMAIL });
  });

  // -----------------------------------------------------------------------
  // Step 1: GET /api/nudges -- returns list of nudges
  // -----------------------------------------------------------------------
  it("Step 1: GET /api/nudges returns nudge list for the user", async () => {
    // Seed some nudges
    seedStore("nudges", "nudge-1", {
      userId: USER_ID,
      microBehaviorId: "mb-01",
      channel: "in_app",
      trigger: "weekly",
      content: { question: "Did you ask before stating today?" },
      deliveredAt: new Date(),
      respondedAt: null,
      response: null,
    });
    seedStore("nudges", "nudge-2", {
      userId: USER_ID,
      microBehaviorId: "mb-01",
      channel: "in_app",
      trigger: "weekly",
      content: { question: "Did you name your fallibility?" },
      deliveredAt: new Date(),
      respondedAt: null,
      response: null,
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/nudges",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.nudges).toHaveLength(2);
    expect(body.nudges[0].userId).toBe(USER_ID);
  });

  // -----------------------------------------------------------------------
  // Step 2: POST /api/nudges/:id/respond with "tried" -- streak increments
  // -----------------------------------------------------------------------
  it("Step 2: respond 'tried' increments streak and resets consecutive skips", async () => {
    // Seed the user with 0 streak, 0 skips
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      streakCount: 0,
      longestStreak: 0,
      consecutiveSkips: 0,
      dialFrequency: "steady",
    });

    // Seed one nudge that has NOT been responded to
    const NUDGE_ID = "nudge-tried-1";
    seedStore("nudges", NUDGE_ID, {
      id: NUDGE_ID,
      userId: USER_ID,
      respondedAt: null,
      response: null,
    });

    // Configure findFirst: the route calls findFirst for nudges, then for users
    setFindFirstResolver("nudges", () => getStore().nudges[NUDGE_ID]);
    setFindFirstResolver("users", () => getStore().users[USER_ID]);

    // Update filter: nudge update should target the specific nudge
    setUpdateFilter("nudges", (id) => id === NUDGE_ID);
    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "POST",
      url: `/api/nudges/${NUDGE_ID}/respond`,
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "tried" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ success: true, response: "tried" });

    // Verify user state updated
    const user = getStore().users[USER_ID];
    expect(user.streakCount).toBe(1);
    expect(user.longestStreak).toBe(1);
    expect(user.consecutiveSkips).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Step 3: Another "tried" response -- streak goes to 2
  // -----------------------------------------------------------------------
  it("Step 3: second 'tried' brings streak to 2", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      streakCount: 1,
      longestStreak: 1,
      consecutiveSkips: 0,
      dialFrequency: "steady",
    });

    const NUDGE_ID = "nudge-tried-2";
    seedStore("nudges", NUDGE_ID, {
      id: NUDGE_ID,
      userId: USER_ID,
      respondedAt: null,
      response: null,
    });

    setFindFirstResolver("nudges", () => getStore().nudges[NUDGE_ID]);
    setFindFirstResolver("users", () => getStore().users[USER_ID]);
    setUpdateFilter("nudges", (id) => id === NUDGE_ID);
    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "POST",
      url: `/api/nudges/${NUDGE_ID}/respond`,
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "tried" },
    });

    expect(res.statusCode).toBe(200);
    const user = getStore().users[USER_ID];
    expect(user.streakCount).toBe(2);
    expect(user.longestStreak).toBe(2);
  });

  // -----------------------------------------------------------------------
  // Step 4: "skipped" response -- streak resets, consecutiveSkips = 1
  // -----------------------------------------------------------------------
  it("Step 4: 'skipped' resets streak and sets consecutiveSkips to 1", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      streakCount: 2,
      longestStreak: 2,
      consecutiveSkips: 0,
      dialFrequency: "steady",
    });

    const NUDGE_ID = "nudge-skip-1";
    seedStore("nudges", NUDGE_ID, {
      id: NUDGE_ID,
      userId: USER_ID,
      respondedAt: null,
      response: null,
    });

    setFindFirstResolver("nudges", () => getStore().nudges[NUDGE_ID]);
    setFindFirstResolver("users", () => getStore().users[USER_ID]);
    setUpdateFilter("nudges", (id) => id === NUDGE_ID);
    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "POST",
      url: `/api/nudges/${NUDGE_ID}/respond`,
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "skipped" },
    });

    expect(res.statusCode).toBe(200);
    const user = getStore().users[USER_ID];
    expect(user.streakCount).toBe(0);
    expect(user.consecutiveSkips).toBe(1);
    expect(user.dialFrequency).toBe("steady"); // Not yet dialed down
  });

  // -----------------------------------------------------------------------
  // Step 5: Second skip -- consecutiveSkips = 2
  // -----------------------------------------------------------------------
  it("Step 5: second skip brings consecutiveSkips to 2", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      streakCount: 0,
      longestStreak: 2,
      consecutiveSkips: 1,
      dialFrequency: "steady",
    });

    const NUDGE_ID = "nudge-skip-2";
    seedStore("nudges", NUDGE_ID, {
      id: NUDGE_ID,
      userId: USER_ID,
      respondedAt: null,
      response: null,
    });

    setFindFirstResolver("nudges", () => getStore().nudges[NUDGE_ID]);
    setFindFirstResolver("users", () => getStore().users[USER_ID]);
    setUpdateFilter("nudges", (id) => id === NUDGE_ID);
    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "POST",
      url: `/api/nudges/${NUDGE_ID}/respond`,
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "skipped" },
    });

    expect(res.statusCode).toBe(200);
    const user = getStore().users[USER_ID];
    expect(user.consecutiveSkips).toBe(2);
    expect(user.dialFrequency).toBe("steady"); // Still not dialed down
  });

  // -----------------------------------------------------------------------
  // Step 6: Third skip -- auto-dials to "gentle"
  // -----------------------------------------------------------------------
  it("Step 6: third consecutive skip auto-dials frequency to gentle", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      streakCount: 0,
      longestStreak: 2,
      consecutiveSkips: 2,
      dialFrequency: "steady",
    });

    const NUDGE_ID = "nudge-skip-3";
    seedStore("nudges", NUDGE_ID, {
      id: NUDGE_ID,
      userId: USER_ID,
      respondedAt: null,
      response: null,
    });

    setFindFirstResolver("nudges", () => getStore().nudges[NUDGE_ID]);
    setFindFirstResolver("users", () => getStore().users[USER_ID]);
    setUpdateFilter("nudges", (id) => id === NUDGE_ID);
    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "POST",
      url: `/api/nudges/${NUDGE_ID}/respond`,
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "skipped" },
    });

    expect(res.statusCode).toBe(200);
    const user = getStore().users[USER_ID];
    expect(user.consecutiveSkips).toBe(3);
    expect(user.dialFrequency).toBe("gentle"); // Auto-dialed!
  });

  // -----------------------------------------------------------------------
  // Step 7: Respond to already-responded nudge -- 400
  // -----------------------------------------------------------------------
  it("Step 7: responding to an already-responded nudge returns 400", async () => {
    const NUDGE_ID = "nudge-already";
    seedStore("nudges", NUDGE_ID, {
      id: NUDGE_ID,
      userId: USER_ID,
      respondedAt: new Date(), // Already responded
      response: "tried",
    });

    setFindFirstResolver("nudges", () => getStore().nudges[NUDGE_ID]);

    const res = await app.inject({
      method: "POST",
      url: `/api/nudges/${NUDGE_ID}/respond`,
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "tried" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Nudge already responded to");
  });

  // -----------------------------------------------------------------------
  // Step 8: Respond to nonexistent nudge -- 404
  // -----------------------------------------------------------------------
  it("Step 8: responding to a nonexistent nudge returns 404", async () => {
    // No nudges in store
    setFindFirstResolver("nudges", () => undefined);

    const res = await app.inject({
      method: "POST",
      url: "/api/nudges/nonexistent-id/respond",
      headers: { authorization: `Bearer ${token}` },
      payload: { response: "tried" },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe("Nudge not found");
  });
});
