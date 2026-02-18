import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const loginBody = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export default async function authRoutes(app: FastifyInstance) {
  // POST /login — find or create user, return JWT + user
  app.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginBody.parse(request.body);

    let user = await db.query.users.findFirst({
      where: eq(schema.users.email, body.email),
    });

    if (!user) {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email: body.email,
          name: body.name || body.email.split("@")[0],
          orgId: body.email.split("@")[1] || "default",
        })
        .returning();
      user = newUser;
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return { token, user };
  });

  // GET /me — returns current authenticated user
  app.get(
    "/me",
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.user as { id: string };

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return { user };
    }
  );
}
