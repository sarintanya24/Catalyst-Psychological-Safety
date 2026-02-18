import { deliverSlackNudge } from "./slack.js";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";

type Channel = "slack" | "teams" | "zoom_meeting" | "zoom_post" | "email" | "push" | "in_app";

export async function deliverNudge(
  userId: string,
  channel: Channel,
  nudge: { id: string; question: string; context?: string; options: string[] },
) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user) return;

  switch (channel) {
    case "slack":
      if (user.slackUserId) {
        await deliverSlackNudge(user.slackUserId, nudge);
      }
      break;

    case "teams":
      // TODO: Microsoft Teams adaptive card delivery
      console.log(`[Teams] Would deliver nudge to ${user.teamsUserId}`);
      break;

    case "zoom_post":
      // TODO: Zoom Team Chat delivery
      console.log(`[Zoom] Would deliver post-meeting nudge to ${user.zoomUserId}`);
      break;

    case "zoom_meeting":
      // TODO: Zoom Apps SDK in-meeting sidebar delivery
      console.log(`[Zoom Meeting] Would deliver in-meeting nudge to ${user.zoomUserId}`);
      break;

    case "email":
      // Handled by sendWeeklyDigest in email.ts
      console.log(`[Email] Would send digest to ${user.email}`);
      break;

    case "push":
      // TODO: Expo push notification
      console.log(`[Push] Would send push to ${userId}`);
      break;

    case "in_app":
      // No delivery needed — nudge is stored in DB and shown in app
      break;

    default:
      console.warn(`[Unknown channel] ${channel}`);
  }
}
