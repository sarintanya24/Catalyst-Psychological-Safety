import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, { origin: true });
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
await app.register(jwt, { secret: process.env.JWT_SECRET });

// Zod validation error handler — return 400 instead of 500
app.setErrorHandler((error, _request, reply) => {
  if (error.validation || error.name === "ZodError") {
    return reply.status(400).send({ error: "Validation error", details: error.message });
  }
  reply.status(error.statusCode ?? 500).send({ error: error.message });
});

// Health check
app.get("/health", async () => ({ status: "ok", service: "catalyst-api" }));

// Register all routes
await app.register(import("./routes/auth.js"), { prefix: "/api/auth" });
await app.register(import("./routes/onboarding.js"), { prefix: "/api/onboarding" });
await app.register(import("./routes/dashboard.js"), { prefix: "/api/dashboard" });
await app.register(import("./routes/nudges.js"), { prefix: "/api/nudges" });
await app.register(import("./routes/settings.js"), { prefix: "/api/settings" });
await app.register(import("./routes/library.js"), { prefix: "/api/library" });
await app.register(import("./routes/pulse.js"), { prefix: "/api/pulse" });
await app.register(import("./routes/mirror.js"), { prefix: "/api/mirror" });
await app.register(import("./routes/cascade.js"), { prefix: "/api/cascade" });
await app.register(import("./routes/webhooks.js"), { prefix: "/webhooks" });

// Start
const start = async () => {
  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Catalyst API running on port ${port}`);
};

start();

export default app;
