import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq, desc, and, isNull, gte, sql } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function dashboardRoutes(app: FastifyInstance) {
  // GET / — dashboard overview
  app.get(
    "/",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      // Get user
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Latest safety score (most recent pulse survey with an aggregate score)
      const latestPulse = await db.query.pulseSurveys.findFirst({
        where: eq(schema.pulseSurveys.leaderId, id),
        orderBy: [desc(schema.pulseSurveys.createdAt)],
      });

      // Today's unresponded nudge
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayNudge = await db.query.nudges.findFirst({
        where: and(
          eq(schema.nudges.userId, id),
          isNull(schema.nudges.respondedAt),
          gte(schema.nudges.deliveredAt, todayStart)
        ),
        orderBy: [desc(schema.nudges.deliveredAt)],
      });

      // Weekly engagement: count of responded nudges in the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyNudges = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.nudges)
        .where(
          and(
            eq(schema.nudges.userId, id),
            gte(schema.nudges.deliveredAt, weekAgo)
          )
        );

      const weeklyResponded = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.nudges)
        .where(
          and(
            eq(schema.nudges.userId, id),
            gte(schema.nudges.deliveredAt, weekAgo),
            sql`${schema.nudges.respondedAt} IS NOT NULL`
          )
        );

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currentStage: user.currentStage,
          activeMicroBehaviorId: user.activeMicroBehaviorId,
          dialFrequency: user.dialFrequency,
          dialDepth: user.dialDepth,
        },
        safetyScore: latestPulse?.aggregateScore ?? null,
        domainScores: latestPulse?.domainScores ?? null,
        todayNudge: todayNudge ?? null,
        streakCount: user.streakCount,
        longestStreak: user.longestStreak,
        weeklyEngagement: {
          total: weeklyNudges[0]?.count ?? 0,
          responded: weeklyResponded[0]?.count ?? 0,
        },
      };
    }
  );
}
