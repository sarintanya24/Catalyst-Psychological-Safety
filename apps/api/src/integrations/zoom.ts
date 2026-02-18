import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "../db/index.js";

// Process Zoom AI Companion meeting summary
export async function processZoomMeetingSummary(
  userId: string,
  meetingId: string,
  summary: {
    meeting_summary: string;
    action_items: string[];
    participants: Array<{ name: string; email: string }>;
  },
) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const analysis = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 500,
    system: "You analyze meeting summaries for psychological safety signals. Return JSON only.",
    messages: [{
      role: "user",
      content: `Analyze this meeting summary for psychological safety signals:

${summary.meeting_summary}

Participants: ${summary.participants.map(p => p.name).join(", ")}

Return JSON:
{
  "participation_distribution": "balanced" | "concentrated" | "one_person_dominated",
  "questions_vs_statements": "mostly_questions" | "balanced" | "mostly_statements",
  "dissent_present": true/false,
  "ideas_attributed": true/false,
  "concerns_addressed": true/false,
  "quiet_members": ["name1", "name2"],
  "key_insight": "one sentence about the most important safety signal",
  "suggested_nudge": "one specific thing the leader could do differently"
}`,
    }],
  });

  const text = analysis.content[0].type === "text" ? analysis.content[0].text : "{}";
  let signals;
  try {
    signals = JSON.parse(text);
  } catch {
    signals = { key_insight: "Meeting analyzed", suggested_nudge: "Ask more questions next time" };
  }

  // Store the analysis
  await db.insert(schema.meetingAnalyses).values({
    userId,
    meetingId,
    signals,
    leaderAirtimePct: null,
    quietMembers: signals.quiet_members || [],
  });

  return signals;
}
