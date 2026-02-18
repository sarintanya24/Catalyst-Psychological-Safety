import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || "dev-secret" });

// Decorate for TypeScript
app.decorate("authenticate", async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
});

// Health check
app.get("/health", async () => ({ status: "ok", service: "catalyst-api" }));

// Start
const start = async () => {
  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Catalyst API running on port ${port}`);
};

start();

export default app;
