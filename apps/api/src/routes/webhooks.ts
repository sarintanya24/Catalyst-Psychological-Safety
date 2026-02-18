import { FastifyInstance } from "fastify";
import { nudgeQueue } from "../jobs/queue.js";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";

export default async function webhookRoutes(app: FastifyInstance) {
  // Zoom webhook handler
  app.post("/zoom", async (request) => {
    const body = request.body as any;
    const event = body.event;

    if (event === "meeting.summary_completed") {
      const meetingId = body.payload?.object?.id;
      const hostEmail = body.payload?.object?.host_email;

      // Find the user by Zoom email
      const user = await db.query.users.findFirst({
        where: eq(schema.users.email, hostEmail),
      });

      if (user) {
        // Queue the post-meeting analysis (2-hour delay per design doc)
        await nudgeQueue.add(
          "post-meeting",
          {
            userId: user.id,
            meetingContext: {
              meetingId,
              meetingType: body.payload?.object?.topic,
            },
          },
          { delay: 2 * 60 * 60 * 1000 }, // 2 hours
        );
      }
    }

    return { status: "ok" };
  });

  // Slack interaction webhook
  app.post("/slack", async (request) => {
    // Handled by Slack Bolt in integrations/slack.ts
    return { status: "ok" };
  });

  // Calendar webhook (Google Calendar push notifications)
  app.post("/calendar", async (request) => {
    const body = request.body as any;
    // Parse calendar event and schedule pre-meeting nudge
    if (body.eventType === "meeting_starting_soon") {
      await nudgeQueue.add("pre-meeting", {
        userId: body.userId,
        meetingContext: {
          attendeeName: body.attendeeName,
          meetingType: body.meetingType,
        },
      });
    }
    return { status: "ok" };
  });
}
