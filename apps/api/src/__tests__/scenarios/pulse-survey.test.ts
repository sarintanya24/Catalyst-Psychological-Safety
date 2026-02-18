/**
 * Scenario 3: Pulse Survey & Anonymity
 *
 * Tests the full pulse survey lifecycle:
 * 1. Leader creates a baseline survey
 * 2. Anonymous responses accumulate
 * 3. Results are blocked until anonymity threshold (3 responses) is met
 * 4. After 3 responses, aggregation triggers with reverse-scored items
 * 5. A different user cannot view results (403 Forbidden)
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import {
  resetStore,
  getStore,
  seedStore,
  setFindFirstResolver,
  setSelectFilter,
  setUpdateFilter,
} from "../helpers/mock-db.js";
import { buildApp, generateToken } from "../helpers/setup.js";
import type { FastifyInstance } from "fastify";

describe("Scenario 3: Pulse Survey & Anonymity", () => {
  let app: FastifyInstance;

  const LEADER_ID = "leader-pulse-001";
  const LEADER_EMAIL = "leader@techcorp.io";
  const OTHER_USER_ID = "other-user-002";
  const OTHER_EMAIL = "other@techcorp.io";
  let leaderToken: string;
  let otherToken: string;
  let surveyId: string;

  // A fixed UUID for the survey (Zod 4 validates UUID v1-v8: third group
  // must start with [1-8], fourth group must start with [89abAB])
  const SURVEY_UUID = "a0a0a0a0-b1b1-4cc2-9d3d-e4e4e4e4e4e4";

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetStore();
    leaderToken = generateToken(app, { id: LEADER_ID, email: LEADER_EMAIL });
    otherToken = generateToken(app, { id: OTHER_USER_ID, email: OTHER_EMAIL });
  });

  // -----------------------------------------------------------------------
  // Step 1: POST /api/pulse/create -- create a baseline survey
  // -----------------------------------------------------------------------
  it("Step 1: create a baseline pulse survey returns survey + 7 questions", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/pulse/create",
      headers: { authorization: `Bearer ${leaderToken}` },
      payload: { surveyType: "baseline" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.survey).toBeDefined();
    expect(body.survey.leaderId).toBe(LEADER_ID);
    expect(body.survey.surveyType).toBe("baseline");
    expect(body.questions).toHaveLength(7);

    // First question is the reverse-scored "held against me" item
    expect(body.questions[0]).toContain("held against me");

    // Save the survey id for subsequent steps
    surveyId = body.survey.id;
  });

  // -----------------------------------------------------------------------
  // Step 2: POST /api/pulse/respond -- 1st anonymous response
  // -----------------------------------------------------------------------
  it("Step 2: first anonymous response returns responseCount = 1", async () => {
    // Seed the survey
    surveyId = SURVEY_UUID;
    seedStore("pulseSurveys", surveyId, {
      id: surveyId,
      leaderId: LEADER_ID,
      surveyType: "baseline",
      aggregateScore: null,
      domainScores: null,
      closedAt: null,
      createdAt: new Date(),
    });

    setFindFirstResolver("pulseSurveys", () => getStore().pulseSurveys[surveyId]);

    // selectFilter for pulseResponses: return all responses for this survey
    setSelectFilter("pulseResponses", (rows) =>
      rows.filter((r) => r.surveyId === surveyId)
    );

    const res = await app.inject({
      method: "POST",
      url: "/api/pulse/respond",
      payload: {
        surveyId,
        scores: [7, 7, 7, 7, 7, 7, 7],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.responseCount).toBe(1);
  });

  // -----------------------------------------------------------------------
  // Step 3: POST /api/pulse/respond -- 2nd response
  // -----------------------------------------------------------------------
  it("Step 3: second response returns responseCount = 2", async () => {
    surveyId = SURVEY_UUID;
    seedStore("pulseSurveys", surveyId, {
      id: surveyId,
      leaderId: LEADER_ID,
      surveyType: "baseline",
      aggregateScore: null,
      domainScores: null,
      closedAt: null,
    });

    // Pre-seed 1 existing response
    seedStore("pulseResponses", "resp-1", {
      surveyId,
      scores: [7, 7, 7, 7, 7, 7, 7],
      submittedAt: new Date(),
    });

    setFindFirstResolver("pulseSurveys", () => getStore().pulseSurveys[surveyId]);
    setSelectFilter("pulseResponses", (rows) =>
      rows.filter((r) => r.surveyId === surveyId)
    );

    const res = await app.inject({
      method: "POST",
      url: "/api/pulse/respond",
      payload: {
        surveyId,
        scores: [5, 5, 5, 5, 5, 5, 5],
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().responseCount).toBe(2);
  });

  // -----------------------------------------------------------------------
  // Step 4: GET /api/pulse/results/:id -- below threshold
  // -----------------------------------------------------------------------
  it("Step 4: results below threshold returns message about needing more responses", async () => {
    surveyId = SURVEY_UUID;
    seedStore("pulseSurveys", surveyId, {
      id: surveyId,
      leaderId: LEADER_ID,
      surveyType: "baseline",
      aggregateScore: null,
      domainScores: null,
    });

    // Only 2 responses in store
    seedStore("pulseResponses", "resp-1", { surveyId, scores: [7, 7, 7, 7, 7, 7, 7] });
    seedStore("pulseResponses", "resp-2", { surveyId, scores: [5, 5, 5, 5, 5, 5, 5] });

    setFindFirstResolver("pulseSurveys", () => getStore().pulseSurveys[surveyId]);
    setSelectFilter("pulseResponses", (rows) =>
      rows.filter((r) => r.surveyId === surveyId)
    );

    const res = await app.inject({
      method: "GET",
      url: `/api/pulse/results/${surveyId}`,
      headers: { authorization: `Bearer ${leaderToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.responseCount).toBe(2);
    expect(body.minimumRequired).toBe(3);
    expect(body.message).toContain("Need at least 3 responses");
    expect(body.results).toBeNull();
  });

  // -----------------------------------------------------------------------
  // Step 5: POST /api/pulse/respond -- 3rd response triggers aggregation
  // -----------------------------------------------------------------------
  it("Step 5: third response triggers aggregation", async () => {
    surveyId = SURVEY_UUID;
    seedStore("pulseSurveys", surveyId, {
      id: surveyId,
      leaderId: LEADER_ID,
      surveyType: "baseline",
      aggregateScore: null,
      domainScores: null,
      closedAt: null,
    });

    // Pre-seed 2 existing responses
    seedStore("pulseResponses", "resp-1", {
      surveyId,
      scores: [7, 7, 7, 7, 7, 7, 7],
      submittedAt: new Date(),
    });
    seedStore("pulseResponses", "resp-2", {
      surveyId,
      scores: [5, 5, 5, 5, 5, 5, 5],
      submittedAt: new Date(),
    });

    setFindFirstResolver("pulseSurveys", () => getStore().pulseSurveys[surveyId]);
    setSelectFilter("pulseResponses", (rows) =>
      rows.filter((r) => r.surveyId === surveyId)
    );
    setUpdateFilter("pulseSurveys", (id) => id === surveyId);

    const res = await app.inject({
      method: "POST",
      url: "/api/pulse/respond",
      payload: {
        surveyId,
        scores: [3, 5, 2, 6, 4, 7, 1],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.responseCount).toBe(3);

    // Verify aggregation was written to the survey
    const survey = getStore().pulseSurveys[surveyId];
    expect(survey.aggregateScore).toBeDefined();
    expect(survey.aggregateScore).toBeTypeOf("number");
    expect(survey.domainScores).toBeDefined();
    expect(survey.domainScores.perQuestion).toHaveLength(7);

    // Verify reverse scoring: items 0, 2, 4 are reverse-scored (8 - score)
    // Raw scores across 3 responses:
    //   Item 0: [7, 5, 3] -> reversed: [1, 3, 5] -> avg 3.0
    //   Item 1: [7, 5, 5] -> not reversed -> avg 5.67
    //   Item 2: [7, 5, 2] -> reversed: [1, 3, 6] -> avg 3.33
    //   Item 3: [7, 5, 6] -> not reversed -> avg 6.0
    //   Item 4: [7, 5, 4] -> reversed: [1, 3, 4] -> avg 2.67
    //   Item 5: [7, 5, 7] -> not reversed -> avg 6.33
    //   Item 6: [7, 5, 1] -> not reversed -> avg 4.33
    const pq = survey.domainScores.perQuestion;
    expect(pq[0]).toBe(3);      // reverse-scored
    expect(pq[1]).toBe(5.67);   // normal
    expect(pq[2]).toBeCloseTo(3.33, 1);  // reverse-scored
    expect(pq[3]).toBe(6);      // normal
    expect(pq[4]).toBeCloseTo(2.67, 1);  // reverse-scored
    expect(pq[5]).toBeCloseTo(6.33, 1);  // normal
    expect(pq[6]).toBeCloseTo(4.33, 1);  // normal
  });

  // -----------------------------------------------------------------------
  // Step 6: GET /api/pulse/results/:id -- returns aggregated results
  // -----------------------------------------------------------------------
  it("Step 6: results with 3+ responses returns aggregateScore and domainScores", async () => {
    surveyId = SURVEY_UUID;
    seedStore("pulseSurveys", surveyId, {
      id: surveyId,
      leaderId: LEADER_ID,
      surveyType: "baseline",
      aggregateScore: 4.48,
      domainScores: { perQuestion: [3, 5.67, 3.33, 6, 2.67, 6.33, 4.33] },
      createdAt: new Date(),
    });

    // 3 responses in store
    seedStore("pulseResponses", "resp-1", { surveyId, scores: [7, 7, 7, 7, 7, 7, 7] });
    seedStore("pulseResponses", "resp-2", { surveyId, scores: [5, 5, 5, 5, 5, 5, 5] });
    seedStore("pulseResponses", "resp-3", { surveyId, scores: [3, 5, 2, 6, 4, 7, 1] });

    setFindFirstResolver("pulseSurveys", () => getStore().pulseSurveys[surveyId]);
    setSelectFilter("pulseResponses", (rows) =>
      rows.filter((r) => r.surveyId === surveyId)
    );

    const res = await app.inject({
      method: "GET",
      url: `/api/pulse/results/${surveyId}`,
      headers: { authorization: `Bearer ${leaderToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.responseCount).toBe(3);
    expect(body.aggregateScore).toBeDefined();
    expect(body.aggregateScore).toBeTypeOf("number");
    expect(body.domainScores).toBeDefined();
    expect(body.domainScores.perQuestion).toHaveLength(7);
    expect(body.questions).toHaveLength(7);
    expect(body.surveyType).toBe("baseline");
  });

  // -----------------------------------------------------------------------
  // Step 7: GET /api/pulse/results/:id as different user -- 403 Forbidden
  // -----------------------------------------------------------------------
  it("Step 7: different user cannot view leader's results (403)", async () => {
    surveyId = SURVEY_UUID;
    seedStore("pulseSurveys", surveyId, {
      id: surveyId,
      leaderId: LEADER_ID, // belongs to LEADER, not OTHER
      surveyType: "baseline",
      aggregateScore: 4.48,
      domainScores: { perQuestion: [3, 5.67, 3.33, 6, 2.67, 6.33, 4.33] },
    });

    setFindFirstResolver("pulseSurveys", () => getStore().pulseSurveys[surveyId]);

    const res = await app.inject({
      method: "GET",
      url: `/api/pulse/results/${surveyId}`,
      headers: { authorization: `Bearer ${otherToken}` },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe("Forbidden");
  });
});
