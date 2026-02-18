import { nudgeQueue } from "./queue.js";
import { db, schema } from "../db/index.js";
import { isNotNull } from "drizzle-orm";

// Schedule Monday morning reflections
export async function scheduleMondayReflections() {
  const users = await db.query.users.findMany({
    where: isNotNull(schema.users.onboardedAt),
  });

  for (const user of users) {
    if (user.pausedUntil && new Date(user.pausedUntil) > new Date()) continue;
    await nudgeQueue.add("monday-reflection", {
      userId: user.id,
      trigger: "monday",
    });
  }
}

// Schedule pre-meeting nudges (called every 15 min by cron)
export async function schedulePreMeetingNudges() {
  // In production, this would check Google Calendar / Zoom for upcoming meetings
  // For MVP, we'll trigger these via webhook from calendar integration
}

// Register recurring jobs
export async function registerSchedules() {
  // Monday morning reflections at 8am
  await nudgeQueue.add(
    "weekly-scheduler",
    {},
    {
      repeat: { pattern: "0 8 * * 1" }, // Every Monday at 8am
    },
  );

  // Check for pre-meeting nudges every 15 min
  await nudgeQueue.add(
    "meeting-check",
    {},
    {
      repeat: { pattern: "*/15 * * * *" }, // Every 15 min
    },
  );
}
