import { App as SlackApp } from "@slack/bolt";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";

const slackApp = new SlackApp({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Deliver a nudge via Slack DM
export async function deliverSlackNudge(slackUserId: string, nudge: {
  id: string;
  question: string;
  context?: string;
  options: string[];
}) {
  await slackApp.client.chat.postMessage({
    channel: slackUserId,
    text: nudge.question,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Catalyst*\n\n${nudge.question}${nudge.context ? `\n\n${nudge.context}` : ""}`,
        },
      },
      {
        type: "actions",
        elements: nudge.options.map((opt, i) => ({
          type: "button",
          text: { type: "plain_text", text: opt },
          action_id: `nudge_response_${i}`,
          value: JSON.stringify({ nudgeId: nudge.id, response: i === 0 ? "tried" : i === 1 ? "skipped" : "later" }),
        })),
      },
    ],
  });
}

// Handle button responses
slackApp.action(/nudge_response_\d+/, async ({ ack, body, action }) => {
  await ack();
  const payload = JSON.parse((action as any).value);
  const { nudgeId, response } = payload;

  await db
    .update(schema.nudges)
    .set({ response, respondedAt: new Date() })
    .where(eq(schema.nudges.id, nudgeId));

  // Update the message to show confirmation
  if ("response_url" in body) {
    await fetch(body.response_url as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        replace_original: true,
        text: response === "tried"
          ? "Great work! Keep building that muscle."
          : response === "skipped"
          ? "No worries. We'll try again when the moment is right."
          : "We'll remind you later.",
      }),
    });
  }
});

export { slackApp };
