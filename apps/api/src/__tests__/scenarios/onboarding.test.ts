/**
 * Scenario 1: Executive Onboarding Journey
 *
 * Tests the full onboarding flow from login through SCARF assessment,
 * focus selection, channel connection, and completion.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

// Mock db MUST be imported before anything that imports routes
import {
  resetStore,
  getStore,
  seedStore,
} from "../helpers/mock-db.js";
import { buildApp, generateToken } from "../helpers/setup.js";
import type { FastifyInstance } from "fastify";

describe("Scenario 1: Executive Onboarding Journey", () => {
  let app: FastifyInstance;

  // We'll track the user & token across the sequential scenario steps
  const TEST_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const TEST_EMAIL = "ceo@acmecorp.com";
  let authToken: string;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetStore();
  });

  // -----------------------------------------------------------------------
  // Step 1: POST /api/auth/login -- creates user, returns JWT
  // -----------------------------------------------------------------------
  it("Step 1: POST /api/auth/login creates user and returns JWT", async () => {
    // db.query.users.findFirst returns undefined (no existing user)
    // db.insert(schema.users).values(...).returning() creates the user
    // The mock store is empty so findFirst returns undefined, then insert adds.

    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: TEST_EMAIL, name: "Jane CEO" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.token).toBeDefined();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(TEST_EMAIL);
    expect(body.user.name).toBe("Jane CEO");

    // Save token for subsequent requests
    authToken = body.token;
  });

  // -----------------------------------------------------------------------
  // Step 2: GET /api/onboarding/status -- step should be "scarf_assessment"
  // -----------------------------------------------------------------------
  it("Step 2: GET /api/onboarding/status returns scarf_assessment for new user", async () => {
    // Seed a bare user (no scarfProfile, no activeMicroBehaviorId, no channels)
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: null,
      activeMicroBehaviorId: null,
      channels: null,
      onboardedAt: null,
      currentStage: "1",
      dialFrequency: "steady",
      dialDepth: "informed",
      streakCount: 0,
      longestStreak: 0,
      consecutiveSkips: 0,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "GET",
      url: "/api/onboarding/status",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.step).toBe("scarf_assessment");
    expect(body.user.id).toBe(TEST_USER_ID);
  });

  // -----------------------------------------------------------------------
  // Step 3: POST /api/onboarding/scarf -- saves SCARF profile
  // -----------------------------------------------------------------------
  it("Step 3: POST /api/onboarding/scarf saves SCARF profile", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: null,
      activeMicroBehaviorId: null,
      channels: null,
      onboardedAt: null,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const scarfData = {
      status: 8,
      certainty: 6,
      autonomy: 7,
      relatedness: 5,
      fairness: 9,
    };

    const res = await app.inject({
      method: "POST",
      url: "/api/onboarding/scarf",
      headers: { authorization: `Bearer ${authToken}` },
      payload: scarfData,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user).toBeDefined();
    expect(body.user.scarfProfile).toEqual(scarfData);

    // Verify store was updated
    const stored = getStore().users[TEST_USER_ID];
    expect(stored.scarfProfile).toEqual(scarfData);
  });

  // -----------------------------------------------------------------------
  // Step 4: GET /api/onboarding/status -- step now "choose_focus"
  // -----------------------------------------------------------------------
  it("Step 4: GET /api/onboarding/status returns choose_focus after SCARF", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: { status: 8, certainty: 6, autonomy: 7, relatedness: 5, fairness: 9 },
      activeMicroBehaviorId: null,
      channels: null,
      onboardedAt: null,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "GET",
      url: "/api/onboarding/status",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().step).toBe("choose_focus");
  });

  // -----------------------------------------------------------------------
  // Step 5: POST /api/onboarding/focus -- choose micro-behavior
  // -----------------------------------------------------------------------
  it("Step 5: POST /api/onboarding/focus saves micro-behavior choice", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: { status: 8, certainty: 6, autonomy: 7, relatedness: 5, fairness: 9 },
      activeMicroBehaviorId: null,
      channels: null,
      onboardedAt: null,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "POST",
      url: "/api/onboarding/focus",
      headers: { authorization: `Bearer ${authToken}` },
      payload: { microBehaviorId: "mb-01" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user.activeMicroBehaviorId).toBe("mb-01");

    const stored = getStore().users[TEST_USER_ID];
    expect(stored.activeMicroBehaviorId).toBe("mb-01");
  });

  // -----------------------------------------------------------------------
  // Step 6: GET /api/onboarding/status -- step now "connect_channels"
  // -----------------------------------------------------------------------
  it("Step 6: GET /api/onboarding/status returns connect_channels after focus", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: { status: 8, certainty: 6, autonomy: 7, relatedness: 5, fairness: 9 },
      activeMicroBehaviorId: "mb-01",
      channels: null,
      onboardedAt: null,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "GET",
      url: "/api/onboarding/status",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().step).toBe("connect_channels");
  });

  // -----------------------------------------------------------------------
  // Step 7: POST /api/onboarding/channels -- save channel prefs
  // -----------------------------------------------------------------------
  it("Step 7: POST /api/onboarding/channels saves channel preferences", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: { status: 8, certainty: 6, autonomy: 7, relatedness: 5, fairness: 9 },
      activeMicroBehaviorId: "mb-01",
      channels: null,
      onboardedAt: null,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "POST",
      url: "/api/onboarding/channels",
      headers: { authorization: `Bearer ${authToken}` },
      payload: { channels: { slack: true, email: true } },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user.channels).toEqual({ slack: true, email: true });

    const stored = getStore().users[TEST_USER_ID];
    expect(stored.channels).toEqual({ slack: true, email: true });
  });

  // -----------------------------------------------------------------------
  // Step 8: POST /api/onboarding/complete -- mark onboarding done
  // -----------------------------------------------------------------------
  it("Step 8: POST /api/onboarding/complete sets onboardedAt", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: { status: 8, certainty: 6, autonomy: 7, relatedness: 5, fairness: 9 },
      activeMicroBehaviorId: "mb-01",
      channels: { slack: true, email: true },
      onboardedAt: null,
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "POST",
      url: "/api/onboarding/complete",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user.onboardedAt).toBeDefined();

    const stored = getStore().users[TEST_USER_ID];
    expect(stored.onboardedAt).toBeInstanceOf(Date);
  });

  // -----------------------------------------------------------------------
  // Step 9: GET /api/onboarding/status -- step now "complete"
  // -----------------------------------------------------------------------
  it("Step 9: GET /api/onboarding/status returns complete after onboarding", async () => {
    seedStore("users", TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Jane CEO",
      orgId: "acmecorp.com",
      scarfProfile: { status: 8, certainty: 6, autonomy: 7, relatedness: 5, fairness: 9 },
      activeMicroBehaviorId: "mb-01",
      channels: { slack: true, email: true },
      onboardedAt: new Date(),
    });

    authToken = generateToken(app, { id: TEST_USER_ID, email: TEST_EMAIL });

    const res = await app.inject({
      method: "GET",
      url: "/api/onboarding/status",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().step).toBe("complete");
  });
});
