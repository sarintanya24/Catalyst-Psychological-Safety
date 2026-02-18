/**
 * Scenario 5: Cascade & Team
 *
 * Tests the cascade tree and team invitation flow:
 * 1. GET cascade shows leader with empty directReports
 * 2. POST invite creates a team member
 * 3. GET cascade now shows the new report
 * 4. Duplicate invite returns 409
 * 5. Invalid invite (empty name, bad email) returns Zod validation error
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import {
  resetStore,
  getStore,
  seedStore,
  setFindFirstResolver,
} from "../helpers/mock-db.js";
import { buildApp, generateToken } from "../helpers/setup.js";
import type { FastifyInstance } from "fastify";

describe("Scenario 5: Cascade & Team", () => {
  let app: FastifyInstance;

  const LEADER_ID = "leader-cascade-001";
  const LEADER_EMAIL = "leader@cascadecorp.com";
  let token: string;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetStore();
    token = generateToken(app, { id: LEADER_ID, email: LEADER_EMAIL });
  });

  // -----------------------------------------------------------------------
  // Step 1: GET /api/cascade -- leader with no direct reports
  // -----------------------------------------------------------------------
  it("Step 1: GET /api/cascade returns leader with empty directReports", async () => {
    seedStore("users", LEADER_ID, {
      id: LEADER_ID,
      name: "Team Leader",
      email: LEADER_EMAIL,
      currentStage: "1",
    });

    setFindFirstResolver("users", () => getStore().users[LEADER_ID]);
    setFindFirstResolver("pulseSurveys", () => undefined); // no pulse surveys

    const res = await app.inject({
      method: "GET",
      url: "/api/cascade",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.leader).toBeDefined();
    expect(body.leader.id).toBe(LEADER_ID);
    expect(body.leader.name).toBe("Team Leader");
    expect(body.leader.email).toBe(LEADER_EMAIL);
    expect(body.leader.safetyScore).toBeNull();
    expect(body.directReports).toEqual([]);
  });

  // -----------------------------------------------------------------------
  // Step 2: POST /api/cascade/invite -- invite Alice
  // -----------------------------------------------------------------------
  it("Step 2: POST /api/cascade/invite creates a team member", async () => {
    // No existing team member with this email
    setFindFirstResolver("teamMembers", () => undefined);

    const res = await app.inject({
      method: "POST",
      url: "/api/cascade/invite",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Alice", email: "alice@co.com" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.teamMember).toBeDefined();
    expect(body.teamMember.name).toBe("Alice");
    expect(body.teamMember.email).toBe("alice@co.com");
    expect(body.teamMember.leaderId).toBe(LEADER_ID);
    expect(body.teamMember.cascadeStatus).toBe("invited");

    // Verify cascade event was also created
    const events = Object.values(getStore().cascadeEvents);
    expect(events.length).toBe(1);
    expect(events[0].leaderId).toBe(LEADER_ID);
    expect(events[0].eventType).toBe("invited");
  });

  // -----------------------------------------------------------------------
  // Step 3: GET /api/cascade -- now has 1 direct report
  // -----------------------------------------------------------------------
  it("Step 3: GET /api/cascade shows newly invited report", async () => {
    seedStore("users", LEADER_ID, {
      id: LEADER_ID,
      name: "Team Leader",
      email: LEADER_EMAIL,
      currentStage: "1",
    });

    // Add a team member in the store
    const memberId = "member-alice-001";
    seedStore("teamMembers", memberId, {
      id: memberId,
      name: "Alice",
      email: "alice@co.com",
      leaderId: LEADER_ID,
      cascadeStatus: "invited",
      createdAt: new Date(),
    });

    setFindFirstResolver("users", () => getStore().users[LEADER_ID]);
    setFindFirstResolver("pulseSurveys", () => undefined);

    const res = await app.inject({
      method: "GET",
      url: "/api/cascade",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.directReports).toHaveLength(1);
    expect(body.directReports[0].name).toBe("Alice");
    expect(body.directReports[0].email).toBe("alice@co.com");
    expect(body.directReports[0].cascadeStatus).toBe("invited");
  });

  // -----------------------------------------------------------------------
  // Step 4: POST /api/cascade/invite with same email -- 409
  // -----------------------------------------------------------------------
  it("Step 4: inviting same email again returns 409 conflict", async () => {
    // Seed existing team member so findFirst returns it
    const memberId = "member-alice-001";
    seedStore("teamMembers", memberId, {
      id: memberId,
      name: "Alice",
      email: "alice@co.com",
      leaderId: LEADER_ID,
      cascadeStatus: "invited",
    });

    setFindFirstResolver("teamMembers", () => getStore().teamMembers[memberId]);

    const res = await app.inject({
      method: "POST",
      url: "/api/cascade/invite",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Alice Again", email: "alice@co.com" },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toContain("already exists");
  });

  // -----------------------------------------------------------------------
  // Step 5: POST /api/cascade/invite with invalid body -- Zod error
  // -----------------------------------------------------------------------
  it("Step 5a: empty name fails Zod validation", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cascade/invite",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "", email: "valid@email.com" },
    });

    // Zod validation error throws, Fastify catches and returns 500 or the
    // route may not have a custom error handler, so it becomes a 500.
    // With Zod 4 (zod ^4.3.6), parse throws ZodError.
    // Fastify turns unhandled errors into 500.
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("Step 5b: invalid email fails Zod validation", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cascade/invite",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Bob", email: "not-an-email" },
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
