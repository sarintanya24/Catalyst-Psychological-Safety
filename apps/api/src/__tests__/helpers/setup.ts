/**
 * setup.ts — Build a Fastify app instance for testing.
 *
 * Registers JWT with a fixed test secret, registers all route plugins,
 * and provides helpers to generate auth tokens.
 */
import Fastify, { type FastifyInstance } from "fastify";
import jwt from "@fastify/jwt";

const TEST_JWT_SECRET = "test-secret-for-catalyst-api";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  // Register JWT plugin
  await app.register(jwt, { secret: TEST_JWT_SECRET });

  // Decorate the authenticate hook (matches server.ts)
  app.decorate("authenticate", async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });

  // Register route plugins (same as server.ts)
  await app.register((await import("../../routes/auth.js")).default, {
    prefix: "/api/auth",
  });
  await app.register((await import("../../routes/onboarding.js")).default, {
    prefix: "/api/onboarding",
  });
  await app.register((await import("../../routes/nudges.js")).default, {
    prefix: "/api/nudges",
  });
  await app.register((await import("../../routes/settings.js")).default, {
    prefix: "/api/settings",
  });
  await app.register((await import("../../routes/pulse.js")).default, {
    prefix: "/api/pulse",
  });
  await app.register((await import("../../routes/cascade.js")).default, {
    prefix: "/api/cascade",
  });
  await app.register((await import("../../routes/dashboard.js")).default, {
    prefix: "/api/dashboard",
  });

  await app.ready();
  return app;
}

/**
 * Generate a JWT token for the given user payload.
 */
export function generateToken(
  app: FastifyInstance,
  payload: { id: string; email: string }
): string {
  return app.jwt.sign(payload);
}
