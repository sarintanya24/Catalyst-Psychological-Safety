import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const AUTO_DIAL_DOWN_AFTER_SKIPS = 3;

const respondBody = z.object({
  response: z.enum(["tried", "skipped", "later", "reflection"]),
  reflectionText: z.string().optional(),
});

export default async function nudgeRoutes(app: FastifyInstance) {
  // GET / — list nudge history (last 50)
  app.get(
    "/",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const nudgeList = await db
        .select()
        .from(schema.nudges)
        .where(eq(schema.nudges.userId, id))
        .orderBy(desc(schema.nudges.deliveredAt))
        .limit(50);

      return { nudges: nudgeList };
    }
  );

  // POST /:nudgeId/respond — respond to a nudge
  app.post<{ Params: { nudgeId: string } }>(
    "/:nudgeId/respond",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id: userId } = request.user as { id: string };
      const { nudgeId } = request.params;
      const body = respondBody.parse(request.body);

      // Find the nudge
      const nudge = await db.query.nudges.findFirst({
        where: and(
          eq(schema.nudges.id, nudgeId),
          eq(schema.nudges.userId, userId)
        ),
      });

      if (!nudge) {
        return reply.status(404).send({ error: "Nudge not found" });
      }

      if (nudge.respondedAt) {
        return reply
          .status(400)
          .send({ error: "Nudge already responded to" });
      }

      // Update the nudge
      await db
        .update(schema.nudges)
        .set({
          response: body.response,
          respondedAt: new Date(),
          reflectionText: body.reflectionText || null,
        })
        .where(eq(schema.nudges.id, nudgeId));

      // Get current user for streak/skip data
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Update user streaks based on response
      if (body.response === "tried") {
        const newStreak = user.streakCount + 1;
        const newLongest = Math.max(newStreak, user.longestStreak);
        await db
          .update(schema.users)
          .set({
            streakCount: newStreak,
            longestStreak: newLongest,
            consecutiveSkips: 0,
          })
          .where(eq(schema.users.id, userId));
      } else if (body.response === "skipped") {
        const newSkips = user.consecutiveSkips + 1;
        const updates: Record<string, unknown> = {
          consecutiveSkips: newSkips,
          streakCount: 0,
        };

        // Auto-dial down to gentle after 3+ consecutive skips
        if (newSkips >= AUTO_DIAL_DOWN_AFTER_SKIPS) {
          updates.dialFrequency = "gentle";
        }

        await db
          .update(schema.users)
          .set(updates)
          .where(eq(schema.users.id, userId));
      }
      // "later" and "reflection" don't affect streaks

      return { success: true, response: body.response };
    }
  );
}
