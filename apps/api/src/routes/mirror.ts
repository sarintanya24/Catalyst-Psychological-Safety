import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function mirrorRoutes(app: FastifyInstance) {
  // GET /latest — most recent mirror moment for user
  app.get(
    "/latest",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const latest = await db.query.mirrorMoments.findFirst({
        where: eq(schema.mirrorMoments.userId, id),
        orderBy: [desc(schema.mirrorMoments.createdAt)],
      });

      if (!latest) {
        return reply
          .status(404)
          .send({ error: "No mirror moments found" });
      }

      return { mirrorMoment: latest };
    }
  );

  // GET /history — all mirror moments for user
  app.get(
    "/history",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const moments = await db
        .select()
        .from(schema.mirrorMoments)
        .where(eq(schema.mirrorMoments.userId, id))
        .orderBy(desc(schema.mirrorMoments.createdAt));

      return { mirrorMoments: moments };
    }
  );
}
