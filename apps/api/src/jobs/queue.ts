import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const parsed = new URL(redisUrl);

const connection = {
  host: parsed.hostname || "localhost",
  port: parseInt(parsed.port || "6379", 10),
  password: parsed.password || undefined,
  username: parsed.username || undefined,
  maxRetriesPerRequest: null,
};

export const nudgeQueue = new Queue("nudge", { connection });
export const pulseQueue = new Queue("pulse", { connection });
export const meetingQueue = new Queue("meeting", { connection });

export { connection };
