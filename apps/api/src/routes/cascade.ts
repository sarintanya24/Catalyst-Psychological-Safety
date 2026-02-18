import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const inviteBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export default async function cascadeRoutes(app: FastifyInstance) {
  // GET / — cascade tree (leader + direct reports with latest pulse scores)
  app.get(
    "/",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      // Get the leader
      const leader = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!leader) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Get direct reports
      const reports = await db
        .select()
        .from(schema.teamMembers)
        .where(eq(schema.teamMembers.leaderId, id));

      // Get leader's latest pulse score
      const latestPulse = await db.query.pulseSurveys.findFirst({
        where: eq(schema.pulseSurveys.leaderId, id),
        orderBy: [desc(schema.pulseSurveys.createdAt)],
      });

      return {
        leader: {
          id: leader.id,
          name: leader.name,
          email: leader.email,
          currentStage: leader.currentStage,
          safetyScore: latestPulse?.aggregateScore ?? null,
        },
        directReports: reports.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          cascadeStatus: r.cascadeStatus,
          createdAt: r.createdAt,
        })),
      };
    }
  );

  // POST /invite — invite a direct report
  app.post(
    "/invite",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = inviteBody.parse(request.body);

      // Check if already invited
      const existing = await db.query.teamMembers.findFirst({
        where: eq(schema.teamMembers.email, body.email),
      });

      if (existing) {
        return reply
          .status(409)
          .send({ error: "Team member already exists with this email" });
      }

      // Create the team member
      const [member] = await db
        .insert(schema.teamMembers)
        .values({
          name: body.name,
          email: body.email,
          leaderId: id,
          cascadeStatus: "invited",
        })
        .returning();

      // Create cascade event
      await db.insert(schema.cascadeEvents).values({
        leaderId: id,
        reportId: member.id,
        eventType: "invited",
      });

      return { teamMember: member };
    }
  );
}
