import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const scarfBody = z.object({
  status: z.number().min(1).max(10),
  certainty: z.number().min(1).max(10),
  autonomy: z.number().min(1).max(10),
  relatedness: z.number().min(1).max(10),
  fairness: z.number().min(1).max(10),
});

const focusBody = z.object({
  microBehaviorId: z.string(),
});

const channelsBody = z.object({
  channels: z.record(z.string(), z.boolean()),
});

type OnboardingStep =
  | "scarf_assessment"
  | "choose_focus"
  | "connect_channels"
  | "complete";

export default async function onboardingRoutes(app: FastifyInstance) {
  // GET /status — which onboarding step the user is at
  app.get(
    "/status",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      let step: OnboardingStep = "scarf_assessment";

      if (user.onboardedAt) {
        step = "complete";
      } else if (user.channels && Object.keys(user.channels as object).length > 0) {
        step = "complete";
      } else if (user.activeMicroBehaviorId) {
        step = "connect_channels";
      } else if (user.scarfProfile) {
        step = "choose_focus";
      }

      return { step, user };
    }
  );

  // POST /scarf — submit SCARF assessment
  app.post(
    "/scarf",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = scarfBody.parse(request.body);

      const [updated] = await db
        .update(schema.users)
        .set({ scarfProfile: body })
        .where(eq(schema.users.id, id))
        .returning();

      return { user: updated };
    }
  );

  // POST /focus — choose micro-behavior
  app.post(
    "/focus",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = focusBody.parse(request.body);

      const [updated] = await db
        .update(schema.users)
        .set({ activeMicroBehaviorId: body.microBehaviorId })
        .where(eq(schema.users.id, id))
        .returning();

      return { user: updated };
    }
  );

  // POST /channels — connect channels
  app.post(
    "/channels",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };
      const body = channelsBody.parse(request.body);

      const [updated] = await db
        .update(schema.users)
        .set({ channels: body.channels })
        .where(eq(schema.users.id, id))
        .returning();

      return { user: updated };
    }
  );

  // POST /complete — mark onboarding complete
  app.post(
    "/complete",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const [updated] = await db
        .update(schema.users)
        .set({ onboardedAt: new Date() })
        .where(eq(schema.users.id, id))
        .returning();

      return { user: updated };
    }
  );
}
