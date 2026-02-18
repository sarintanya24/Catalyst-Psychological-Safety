/**
 * Scenario 4: Settings & Anti-Overwhelm
 *
 * Tests settings retrieval, partial updates, empty-body rejection,
 * and the pause endpoint (auto-dials to gentle, sets pausedUntil).
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

describe("Scenario 4: Settings & Anti-Overwhelm", () => {
  let app: FastifyInstance;

  const USER_ID = "user-settings-001";
  const EMAIL = "settings-user@corp.com";
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
  // Step 1: GET /api/settings -- returns defaults
  // -----------------------------------------------------------------------
  it("Step 1: GET /api/settings returns default settings", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      dialFrequency: "steady",
      dialDepth: "informed",
      channels: {},
      quietHoursStart: "08:00",
      quietHoursEnd: "19:00",
      weekendsOff: true,
      pausedUntil: null,
    });

    setFindFirstResolver("users", () => getStore().users[USER_ID]);

    const res = await app.inject({
      method: "GET",
      url: "/api/settings",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.dialFrequency).toBe("steady");
    expect(body.dialDepth).toBe("informed");
    expect(body.weekendsOff).toBe(true);
    expect(body.quietHoursStart).toBe("08:00");
    expect(body.quietHoursEnd).toBe("19:00");
    expect(body.pausedUntil).toBeNull();
  });

  // -----------------------------------------------------------------------
  // Step 2: PUT /api/settings with dialFrequency only
  // -----------------------------------------------------------------------
  it("Step 2: PUT /api/settings updates dialFrequency only", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      dialFrequency: "steady",
      dialDepth: "informed",
      channels: {},
      quietHoursStart: "08:00",
      quietHoursEnd: "19:00",
      weekendsOff: true,
      pausedUntil: null,
    });

    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "PUT",
      url: "/api/settings",
      headers: { authorization: `Bearer ${token}` },
      payload: { dialFrequency: "immersive" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.dialFrequency).toBe("immersive");
    // Other settings unchanged
    expect(body.dialDepth).toBe("informed");
    expect(body.weekendsOff).toBe(true);

    // Store reflects the change
    const stored = getStore().users[USER_ID];
    expect(stored.dialFrequency).toBe("immersive");
  });

  // -----------------------------------------------------------------------
  // Step 3: PUT /api/settings with quiet hours
  // -----------------------------------------------------------------------
  it("Step 3: PUT /api/settings updates quiet hours", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      dialFrequency: "immersive",
      dialDepth: "informed",
      channels: {},
      quietHoursStart: "08:00",
      quietHoursEnd: "19:00",
      weekendsOff: true,
      pausedUntil: null,
    });

    setUpdateFilter("users", (id) => id === USER_ID);

    const res = await app.inject({
      method: "PUT",
      url: "/api/settings",
      headers: { authorization: `Bearer ${token}` },
      payload: { quietHoursStart: "09:00", quietHoursEnd: "18:00" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.quietHoursStart).toBe("09:00");
    expect(body.quietHoursEnd).toBe("18:00");
    expect(body.dialFrequency).toBe("immersive"); // Unchanged
  });

  // -----------------------------------------------------------------------
  // Step 4: PUT /api/settings with empty body -- 400
  // -----------------------------------------------------------------------
  it("Step 4: PUT /api/settings with empty body returns 400", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/api/settings",
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("No settings to update");
  });

  // -----------------------------------------------------------------------
  // Step 5: POST /api/settings/pause -- sets pausedUntil, dials to gentle
  // -----------------------------------------------------------------------
  it("Step 5: POST /api/settings/pause sets pausedUntil 7 days ahead and dials to gentle", async () => {
    seedStore("users", USER_ID, {
      id: USER_ID,
      email: EMAIL,
      dialFrequency: "immersive",
      dialDepth: "informed",
      channels: {},
      quietHoursStart: "09:00",
      quietHoursEnd: "18:00",
      weekendsOff: true,
      pausedUntil: null,
    });

    setUpdateFilter("users", (id) => id === USER_ID);

    const beforeRequest = new Date();

    const res = await app.inject({
      method: "POST",
      url: "/api/settings/pause",
      headers: { authorization: `Bearer ${token}` },
      payload: { duration: "1_week" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();

    // dialFrequency should be auto-dialed to gentle
    expect(body.dialFrequency).toBe("gentle");

    // pausedUntil should be roughly 7 days from now
    expect(body.pausedUntil).toBeDefined();
    const pausedDate = new Date(body.pausedUntil);
    const diffMs = pausedDate.getTime() - beforeRequest.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(6.9);
    expect(diffDays).toBeLessThanOrEqual(7.1);

    // Verify store
    const stored = getStore().users[USER_ID];
    expect(stored.dialFrequency).toBe("gentle");
    expect(stored.pausedUntil).toBeInstanceOf(Date);
  });
});
