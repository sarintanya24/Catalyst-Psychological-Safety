import { db, schema } from "../db/index.js";
import { eq, and, gte } from "drizzle-orm";
import { personalizeNudge } from "./claude.js";

// Inline constants to avoid cross-package build issues
const MAX_NUDGES_PER_DAY = 1;
const AUTO_DIAL_DOWN_AFTER_SKIPS = 3;

const MICRO_BEHAVIORS = [
  { id: "mb-01", name: "Ask before you state", description: "Ask a genuine question before stating your view.", tier: 1, rank: 1, scarfDomains: ["status", "autonomy"], category: "question", timeSeconds: "10", exampleScripts: ["What's your biggest concern about this project?", "What's on your mind that we haven't talked about?", "How are you thinking about this differently than I am?"], neuroscienceBasis: "Questions activate the prefrontal cortex and signal respect for the other person's Status and Autonomy. When a leader asks before telling, it creates a reward response in both SCARF domains." },
  { id: "mb-02", name: "Name your fallibility", description: "Name your own fallibility: \"I may be wrong about this.\"", tier: 1, rank: 2, scarfDomains: ["status", "fairness"], category: "vulnerability", timeSeconds: "5", exampleScripts: ["I may be wrong about this, but here's what I'm thinking...", "I don't have the full picture here. What am I missing?", "I've changed my mind on this before — challenge me if you see it differently."], neuroscienceBasis: "When leaders admit fallibility, it equalizes Status threat for team members. It signals Fairness — that the leader doesn't hold themselves to a different standard." },
  { id: "mb-03", name: "Thank the dissenter", description: "Thank someone specifically for raising a concern or disagreeing.", tier: 1, rank: 3, scarfDomains: ["status", "relatedness"], category: "acknowledgment", timeSeconds: "10", exampleScripts: ["Thank you for pushing back on that — that's exactly the kind of challenge we need.", "I appreciate you raising that concern. It takes courage and I want more of it.", "That's a perspective I hadn't considered. I'm glad you said it."], neuroscienceBasis: "Public acknowledgment triggers a strong Status reward in the dissenter and signals Relatedness — that challenging the leader strengthens rather than threatens the relationship." },
  { id: "mb-04", name: "Respond with curiosity", description: "Respond to bad news with \"Help me understand\" not \"How did this happen?\"", tier: 1, rank: 4, scarfDomains: ["status", "certainty"], category: "question", timeSeconds: "5", exampleScripts: ["Help me understand what happened here.", "Walk me through this — I want to understand the full picture.", "What did we learn from this that we can use going forward?"], neuroscienceBasis: "\"How did this happen?\" triggers Status threat (blame) and Certainty threat (unpredictable consequences). \"Help me understand\" signals genuine curiosity and protects both domains." },
  { id: "mb-05", name: "The 5-second pause", description: "Wait 5-7 seconds after asking a question before speaking again.", tier: 1, rank: 5, scarfDomains: ["autonomy", "certainty"], category: "space_making", timeSeconds: "7", exampleScripts: ["[Ask your question, then silently count to 5 before speaking]", "Take your time — I want to hear what you think. [wait]", "[If silence feels uncomfortable, that's the signal it's working]"], neuroscienceBasis: "Most leaders fill silence within 1-2 seconds, cutting off the Autonomy people need to formulate a real answer. A 5-second pause gives the brain time to move from threat response to thoughtful response, increasing Certainty that the leader actually wants to hear the answer." },
  { id: "mb-06", name: "\"What are we missing?\"", description: "Ask \"What are we missing?\" before making a final decision.", tier: 2, rank: 6, scarfDomains: ["autonomy", "fairness"], category: "question", timeSeconds: "15", exampleScripts: ["Before we decide — what are we missing?", "What's the argument against this that we haven't made?", "If this fails, what will we wish we'd thought about now?"], neuroscienceBasis: "This question signals that all perspectives are valued (Fairness) and that team members have permission to influence the outcome (Autonomy). It's the single highest-leverage question for catching blind spots." },
  { id: "mb-07", name: "Share a personal mistake", description: "Share a personal mistake or learning moment with your team.", tier: 2, rank: 7, scarfDomains: ["status", "relatedness"], category: "vulnerability", timeSeconds: "30", exampleScripts: ["I want to share something I got wrong last week and what I learned from it.", "Early in my career I made a similar mistake. Here's what happened...", "I was wrong about this last quarter. Here's what I should have done differently."], neuroscienceBasis: "Leader vulnerability triggers Daniel Coyle's \"vulnerability loop\" — when a high-status person shows vulnerability, it gives permission for others to do the same, rapidly building Relatedness and equalizing Status." },
  { id: "mb-08", name: "Check in on the person", description: "Check in on the person, not the project. Ask how they're doing, not what they're doing.", tier: 2, rank: 8, scarfDomains: ["relatedness", "status"], category: "question", timeSeconds: "30", exampleScripts: ["Before we get into the agenda — how are you doing? Really.", "I noticed you seemed quieter than usual in the meeting. Is everything okay?", "What's on your mind outside of work that's affecting how you show up?"], neuroscienceBasis: "Personal check-ins activate the Relatedness reward circuit. When a leader shows interest in the whole person (not just their output), it signals that the person's Status isn't contingent on productivity alone." },
  { id: "mb-09", name: "Credit someone else's idea", description: "Credit someone else's idea publicly in a meeting or message.", tier: 2, rank: 9, scarfDomains: ["status", "fairness"], category: "acknowledgment", timeSeconds: "10", exampleScripts: ["This was Sarah's insight — she flagged this risk in our 1:1 last week.", "I want to give credit where it's due: this approach came from the team, not me.", "James raised this idea in our last meeting and I think it's exactly right."], neuroscienceBasis: "Public attribution is one of the strongest Status rewards in organizational life. It signals Fairness (credit goes where it's earned) and encourages others to share ideas knowing they'll be recognized." },
  { id: "mb-10", name: "Separate brainstorm from evaluation", description: "Explicitly separate brainstorming from evaluation — make it clear when ideas are being generated vs. judged.", tier: 2, rank: 10, scarfDomains: ["certainty", "autonomy"], category: "space_making", timeSeconds: "15", exampleScripts: ["For the next 10 minutes, let's just generate ideas. No evaluation yet.", "I want to hear every option before we start narrowing. All ideas welcome.", "We're in brainstorm mode — there are no bad ideas right now. We'll evaluate later."], neuroscienceBasis: "When brainstorming and evaluation happen simultaneously, team members self-censor to avoid negative judgment. Explicit separation increases Certainty (I know the rules) and Autonomy (I have permission to think freely)." },
] as const;

type Channel = "slack" | "teams" | "zoom_meeting" | "zoom_post" | "email" | "push" | "in_app";
type NudgeTrigger = "pre_meeting" | "post_meeting" | "post_decision" | "weekly" | "monday" | "contextual";

export async function generateNudge(
  userId: string,
  trigger: NudgeTrigger,
  meetingContext?: { attendeeName?: string; meetingType?: string },
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user || !user.onboardedAt) return;

  // Check if paused
  if (user.pausedUntil && new Date(user.pausedUntil) > new Date()) return;

  // Check quiet hours
  const now = new Date();
  const currentHour = now.getHours();
  const startHour = parseInt(user.quietHoursStart?.split(":")[0] ?? "8");
  const endHour = parseInt(user.quietHoursEnd?.split(":")[0] ?? "19");
  if (currentHour < startHour || currentHour >= endHour) return;

  // Check weekends
  const day = now.getDay();
  if (user.weekendsOff && (day === 0 || day === 6)) return;

  // Check daily limit
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysNudges = await db.query.nudges.findMany({
    where: and(
      eq(schema.nudges.userId, userId),
      gte(schema.nudges.deliveredAt, todayStart),
    ),
  });

  if (todaysNudges.length >= MAX_NUDGES_PER_DAY) return;

  // Check consecutive skips — auto-dial-down already handled in nudges route
  if (user.consecutiveSkips >= AUTO_DIAL_DOWN_AFTER_SKIPS) return;

  // Find the active micro-behavior
  const behavior = MICRO_BEHAVIORS.find((b) => b.id === user.activeMicroBehaviorId);
  if (!behavior) return;

  // Determine delivery channel
  const channels = (user.channels ?? {}) as Record<string, boolean>;
  let channel: Channel = "in_app";
  if (trigger === "pre_meeting" && channels.slack) channel = "slack";
  else if (trigger === "post_meeting" && channels.zoom_post) channel = "zoom_post";
  else if (trigger === "weekly" && channels.email) channel = "email";
  else if (trigger === "monday" && channels.email) channel = "email";
  else if (channels.slack) channel = "slack";
  else if (channels.teams) channel = "teams";

  // Personalize the nudge via Claude
  const content = await personalizeNudge({
    userName: user.name,
    microBehavior: {
      name: behavior.name,
      description: behavior.description,
      exampleScripts: [...behavior.exampleScripts],
    },
    scarfProfile: (user.scarfProfile as Record<string, number>) || {
      status: 5, certainty: 5, autonomy: 5, relatedness: 5, fairness: 5,
    },
    depth: user.dialDepth ?? "informed",
    trigger,
    meetingContext,
    streakCount: user.streakCount,
  });

  // Store the nudge
  await db.insert(schema.nudges).values({
    userId,
    microBehaviorId: behavior.id,
    channel,
    trigger,
    content,
    meetingContext: meetingContext || null,
  });

  // TODO: Deliver via channel adapter (Slack, Teams, Zoom, Email)
  // This will be implemented in Phase 6 (Bot Integrations)
}
