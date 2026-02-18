import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const updateSettingsBody = z.object({
  dialFrequency: z.enum(["gentle", "steady", "immersive"]).optional(),
  dialDepth: z.enum(["essentials", "informed", "deep_dive"]).optional(),
  channels: z.record(z.string(), z.boolean()).optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  weekendsOff: z.boolean().optional(),
});

const pauseBody = z.object({
  duration: z.enum(["1_week", "2_weeks", "1_month"]),
});

const PAUSE_DURATIONS: Record<string, number> = {
  "1_week": 7,
  "2_weeks": 14,
  "1_month": 30,
};

export default async function settingsRoutes(app: FastifyInstance) {
  // GET / — get current settings
  app.get(
    "/",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return {
        dialFrequency: user.dialFrequency,
        dialDepth: user.dialDepth,
        channels: user.channels,
        quietHoursStart: user.quietHoursStart,
        quietHoursEnd: user.quietHoursEnd,
        weekendsOff: user.weekendsOff,
        pausedUntil: user.pausedUntil,
      };
    }
  );

  // PUT / — update settings
  app.put(
    "/",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = updateSettingsBody.parse(request.body);

      const updates: Record<string, unknown> = {};
      if (body.dialFrequency !== undefined) updates.dialFrequency = body.dialFrequency;
      if (body.dialDepth !== undefined) updates.dialDepth = body.dialDepth;
      if (body.channels !== undefined) updates.channels = body.channels;
      if (body.quietHoursStart !== undefined) updates.quietHoursStart = body.quietHoursStart;
      if (body.quietHoursEnd !== undefined) updates.quietHoursEnd = body.quietHoursEnd;
      if (body.weekendsOff !== undefined) updates.weekendsOff = body.weekendsOff;

      if (Object.keys(updates).length === 0) {
        return reply.status(400).send({ error: "No settings to update" });
      }

      const [updated] = await db
        .update(schema.users)
        .set(updates)
        .where(eq(schema.users.id, id))
        .returning();

      return {
        dialFrequency: updated.dialFrequency,
        dialDepth: updated.dialDepth,
        channels: updated.channels,
        quietHoursStart: updated.quietHoursStart,
        quietHoursEnd: updated.quietHoursEnd,
        weekendsOff: updated.weekendsOff,
        pausedUntil: updated.pausedUntil,
      };
    }
  );

  // POST /pause — pause all nudges
  app.post(
    "/pause",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = pauseBody.parse(request.body);

      const days = PAUSE_DURATIONS[body.duration];
      const pausedUntil = new Date();
      pausedUntil.setDate(pausedUntil.getDate() + days);

      const [updated] = await db
        .update(schema.users)
        .set({
          pausedUntil,
          dialFrequency: "gentle", // auto-dial to gentle when pausing
        })
        .where(eq(schema.users.id, id))
        .returning();

      return {
        pausedUntil: updated.pausedUntil,
        dialFrequency: updated.dialFrequency,
      };
    }
  );
}
