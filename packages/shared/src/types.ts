// ============================================================
// Catalyst Shared Types
// ============================================================

// SCARF Model domains
export type ScarfDomain = "status" | "certainty" | "autonomy" | "relatedness" | "fairness";

export interface ScarfProfile {
  status: number;      // 1-10
  certainty: number;
  autonomy: number;
  relatedness: number;
  fairness: number;
}

// Clark's 4 Stages
export type SafetyStage = 1 | 2 | 3 | 4;
export const STAGE_NAMES: Record<SafetyStage, string> = {
  1: "Foundation",
  2: "Building",
  3: "Expanding",
  4: "Leading",
};

// Dial settings
export type NudgeFrequency = "gentle" | "steady" | "immersive";
export type InsightDepth = "essentials" | "informed" | "deep_dive";
export type Channel = "slack" | "teams" | "zoom_meeting" | "zoom_post" | "email" | "push" | "in_app";

// Nudge triggers
export type NudgeTrigger = "pre_meeting" | "post_meeting" | "post_decision" | "weekly" | "monday" | "contextual";

// Nudge responses
export type NudgeResponse = "tried" | "skipped" | "later" | "reflection";

// Micro-behavior categories
export type BehaviorCategory = "question" | "vulnerability" | "acknowledgment" | "space_making";
export type BehaviorTier = 1 | 2;

export interface MicroBehavior {
  id: string;
  name: string;
  description: string;
  tier: BehaviorTier;
  rank: number;
  scarfDomains: ScarfDomain[];
  category: BehaviorCategory;
  timeSeconds: string;
  exampleScripts: string[];
  neuroscienceBasis: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  orgId: string;
  scarfProfile: ScarfProfile | null;
  currentStage: SafetyStage;
  activeMicroBehaviorId: string | null;
  dialFrequency: NudgeFrequency;
  dialDepth: InsightDepth;
  channels: Partial<Record<Channel, boolean>>;
  quietHoursStart: string; // "08:00"
  quietHoursEnd: string;   // "19:00"
  weekendsOff: boolean;
  cohortId: string | null;
  streakCount: number;
  longestStreak: number;
  onboardedAt: string | null;
  pausedUntil: string | null;
}

export interface Nudge {
  id: string;
  userId: string;
  microBehaviorId: string;
  channel: Channel;
  trigger: NudgeTrigger;
  content: {
    question: string;
    context?: string;
    options: string[];
  };
  meetingContext?: Record<string, unknown>;
  deliveredAt: string;
  respondedAt: string | null;
  response: NudgeResponse | null;
  reflectionText: string | null;
}

export interface PulseSurvey {
  id: string;
  teamId: string;
  leaderId: string;
  surveyType: "baseline" | "monthly" | "mirror_moment";
  aggregateScore: number | null;
  domainScores: Partial<Record<ScarfDomain, number>> | null;
  createdAt: string;
  closedAt: string | null;
}

export interface PulseResponse {
  id: string;
  surveyId: string;
  memberId: string;
  scores: number[]; // q1-q7, Edmondson scale (1-7)
  submittedAt: string;
}

export interface MirrorMoment {
  id: string;
  userId: string;
  pulseSurveyId: string;
  selfAssessment: ScarfProfile;
  teamPerception: {
    aggregateScore: number;
    domainScores: Record<ScarfDomain, number>;
    themes: string[];
  };
  gaps: Array<{
    domain: ScarfDomain;
    selfScore: number;
    teamScore: number;
    delta: number;
  }>;
  recommendations: Array<{
    microBehaviorId: string;
    reason: string;
  }>;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  leaderId: string;
  cascadeStatus: "invited" | "onboarded" | "active";
}

export interface PeerCohort {
  id: string;
  name: string;
  memberIds: string[];
  nextSession: string | null;
}

export interface CascadeNode {
  userId: string;
  name: string;
  safetyScore: number | null;
  stage: SafetyStage;
  teamSize: number;
  teamScore: number | null;
  children: CascadeNode[];
}
