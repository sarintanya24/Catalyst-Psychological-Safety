import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

// Inlined from shared constants
const MIN_PULSE_RESPONSES = 3;
const REVERSE_SCORED_ITEMS = [0, 2, 4] as const;
const EDMONDSON_SURVEY = [
  "If I make a mistake on this team, it is held against me.",
  "Members of this team are able to bring up problems and tough issues.",
  "People on this team sometimes reject others for being different.",
  "It is safe to take a risk on this team.",
  "It is difficult to ask other members of this team for help.",
  "No one on this team would deliberately act to undermine my efforts.",
  "Working with members of this team, my unique skills and talents are valued and utilized.",
] as const;

const createBody = z.object({
  surveyType: z.enum(["baseline", "monthly", "mirror_moment"]),
});

const respondBody = z.object({
  surveyId: z.string().uuid(),
  scores: z.array(z.number().min(1).max(7)).length(7),
});

function aggregateScores(allResponses: number[][]): {
  aggregateScore: number;
  perQuestion: number[];
} {
  const questionCount = 7;
  const responseCount = allResponses.length;
  const sums = new Array(questionCount).fill(0);

  for (const scores of allResponses) {
    for (let i = 0; i < questionCount; i++) {
      // Reverse-score items 0, 2, 4: flip on the 1-7 scale (8 - score)
      const adjustedScore = (REVERSE_SCORED_ITEMS as readonly number[]).includes(i)
        ? 8 - scores[i]
        : scores[i];
      sums[i] += adjustedScore;
    }
  }

  const perQuestion = sums.map((s) => Math.round((s / responseCount) * 100) / 100);
  const aggregateScore =
    Math.round(
      (perQuestion.reduce((a, b) => a + b, 0) / questionCount) * 100
    ) / 100;

  return { aggregateScore, perQuestion };
}

export default async function pulseRoutes(app: FastifyInstance) {
  // POST /create — create a pulse survey (auth required)
  app.post(
    "/create",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = createBody.parse(request.body);

      const [survey] = await db
        .insert(schema.pulseSurveys)
        .values({
          leaderId: id,
          surveyType: body.surveyType,
        })
        .returning();

      return {
        survey,
        questions: EDMONDSON_SURVEY,
      };
    }
  );

  // POST /respond — anonymous team member submits response (no auth)
  app.post(
    "/respond",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = respondBody.parse(request.body);

      // Verify the survey exists
      const survey = await db.query.pulseSurveys.findFirst({
        where: eq(schema.pulseSurveys.id, body.surveyId),
      });

      if (!survey) {
        return reply.status(404).send({ error: "Survey not found" });
      }

      if (survey.closedAt) {
        return reply.status(400).send({ error: "Survey is closed" });
      }

      // Insert the anonymous response
      await db.insert(schema.pulseResponses).values({
        surveyId: body.surveyId,
        scores: body.scores,
      });

      // Check how many responses we have now
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.pulseResponses)
        .where(eq(schema.pulseResponses.surveyId, body.surveyId));

      const responseCount = countResult[0]?.count ?? 0;

      // If we've reached the minimum, aggregate scores
      if (responseCount >= MIN_PULSE_RESPONSES) {
        const responses = await db
          .select()
          .from(schema.pulseResponses)
          .where(eq(schema.pulseResponses.surveyId, body.surveyId));

        const allScores = responses.map((r) => r.scores as number[]);
        const { aggregateScore, perQuestion } = aggregateScores(allScores);

        await db
          .update(schema.pulseSurveys)
          .set({
            aggregateScore,
            domainScores: { perQuestion },
          })
          .where(eq(schema.pulseSurveys.id, body.surveyId));
      }

      return { success: true, responseCount };
    }
  );

  // GET /results/:surveyId — auth required, returns aggregated results
  app.get<{ Params: { surveyId: string } }>(
    "/results/:surveyId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.user as { id: string };
      const { surveyId } = request.params;

      const survey = await db.query.pulseSurveys.findFirst({
        where: eq(schema.pulseSurveys.id, surveyId),
      });

      if (!survey) {
        return reply.status(404).send({ error: "Survey not found" });
      }

      // Only the leader who created it can see results
      if (survey.leaderId !== id) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      // Check response count for anonymity threshold
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.pulseResponses)
        .where(eq(schema.pulseResponses.surveyId, surveyId));

      const responseCount = countResult[0]?.count ?? 0;

      if (responseCount < MIN_PULSE_RESPONSES) {
        return {
          surveyId,
          responseCount,
          minimumRequired: MIN_PULSE_RESPONSES,
          message: `Need at least ${MIN_PULSE_RESPONSES} responses for anonymity. Currently have ${responseCount}.`,
          results: null,
        };
      }

      return {
        surveyId,
        responseCount,
        aggregateScore: survey.aggregateScore,
        domainScores: survey.domainScores,
        questions: EDMONDSON_SURVEY,
        surveyType: survey.surveyType,
        createdAt: survey.createdAt,
      };
    }
  );
}
