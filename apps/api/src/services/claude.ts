import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface NudgeContext {
  userName: string;
  microBehavior: { name: string; description: string; exampleScripts: string[] };
  scarfProfile: Record<string, number>;
  depth: "essentials" | "informed" | "deep_dive";
  trigger: string;
  meetingContext?: { attendeeName?: string; meetingType?: string };
  streakCount: number;
  recentResponses?: string[];
}

export async function personalizeNudge(ctx: NudgeContext): Promise<{
  question: string;
  context?: string;
  options: string[];
}> {
  const depthInstruction = {
    essentials: "One sentence only. No context. Just the behavior prompt and response options.",
    informed: "2-3 sentences. Include brief context on why this matters right now. Keep it warm and peer-level.",
    deep_dive: "3-5 sentences. Include the neuroscience basis, team data if available, and a peer benchmark.",
  }[ctx.depth];

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 300,
    system: `You are Catalyst, an AI coaching companion for executive leaders building psychological safety. Your tone is peer-level, warm, and never instructional. You speak like a trusted colleague, not a teacher. Never use jargon like "SCARF" or "psychological safety" — use plain, human language.

Rules:
- Maximum 3 sentences for the nudge
- Always end with a specific thing to try
- Frame everything as opportunity, never deficiency
- Use "High-performing leaders often..." or "Teams where leaders..." framing
- ${depthInstruction}`,
    messages: [
      {
        role: "user",
        content: `Generate a nudge for ${ctx.userName}.

Micro-behavior: "${ctx.microBehavior.name}" — ${ctx.microBehavior.description}
Example scripts: ${ctx.microBehavior.exampleScripts.join(" | ")}
Trigger: ${ctx.trigger}
${ctx.meetingContext?.attendeeName ? `Meeting with: ${ctx.meetingContext.attendeeName}` : ""}
${ctx.meetingContext?.meetingType ? `Meeting type: ${ctx.meetingContext.meetingType}` : ""}
Streak: ${ctx.streakCount} days
SCARF sensitivity (highest domain matters most): Status=${ctx.scarfProfile.status}, Certainty=${ctx.scarfProfile.certainty}, Autonomy=${ctx.scarfProfile.autonomy}, Relatedness=${ctx.scarfProfile.relatedness}, Fairness=${ctx.scarfProfile.fairness}

Return JSON: {"question": "...", "context": "...", "options": ["Tried it", "Skip", "Remind me later"]}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const parsed = JSON.parse(text);
    if (
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.options) ||
      parsed.options.length === 0
    ) {
      throw new Error("Invalid nudge structure from Claude");
    }
    return parsed;
  } catch {
    // Fallback to a simple nudge using the example scripts
    return {
      question: ctx.microBehavior.exampleScripts[0],
      context: ctx.microBehavior.description,
      options: ["Tried it", "Skip", "Remind me later"],
    };
  }
}
