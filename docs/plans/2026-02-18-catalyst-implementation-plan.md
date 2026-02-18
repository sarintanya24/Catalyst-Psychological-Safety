# Catalyst Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Catalyst psychological safety platform — a React Native app + Fastify backend + bot integrations (Slack/Teams/Zoom/Email) that coaches executives through micro-behavior nudges.

**Architecture:** Monorepo with three packages: `apps/mobile` (React Native + Expo), `apps/api` (Node.js + Fastify), and `packages/shared` (types, constants, micro-behavior data). PostgreSQL for relational data, Redis for scheduling/caching, BullMQ for async jobs, Claude API for nudge personalization.

**Tech Stack:** React Native (Expo SDK 52), NativeWind (Tailwind for RN), React Navigation, Zustand, Fastify, Drizzle ORM, PostgreSQL, Redis, BullMQ, Claude API (Anthropic SDK), Slack Bolt, Zoom API, SendGrid.

**Design Doc:** `docs/plans/2026-02-18-catalyst-product-design.md`

---

## Phase 1: Project Scaffolding & Shared Data

### Task 1: Initialize monorepo

**Files:**
- Create: `package.json` (root workspace)
- Create: `apps/mobile/` (Expo app)
- Create: `apps/api/` (Fastify server)
- Create: `packages/shared/` (shared types/data)

**Step 1: Create root monorepo with npm workspaces**

```bash
cd /Users/Tanya/Documents/Code/Psychological_Safety
mkdir -p apps packages
```

Create root `package.json`:

```json
{
  "name": "catalyst",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "api": "npm run dev --workspace=apps/api",
    "mobile": "npm run start --workspace=apps/mobile",
    "shared:build": "npm run build --workspace=packages/shared"
  }
}
```

**Step 2: Scaffold the Expo app**

```bash
cd /Users/Tanya/Documents/Code/Psychological_Safety
npx create-expo-app@latest apps/mobile --template blank-typescript
```

**Step 3: Install NativeWind (Tailwind for React Native)**

```bash
cd apps/mobile
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
npx tailwindcss init
```

Create `apps/mobile/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#1B2A4A",
        amber: "#E8913A",
        sage: "#4A9E7D",
        coral: "#E07A6B",
        cream: "#F8F7F4",
      },
      fontFamily: {
        inter: ["Inter"],
        "inter-bold": ["Inter-Bold"],
        mono: ["JetBrainsMono"],
      },
    },
  },
  plugins: [],
};
```

Update `apps/mobile/babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

Create `apps/mobile/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Scaffold the Fastify API**

```bash
mkdir -p apps/api/src/{routes,services,db,jobs,integrations,middleware}
cd apps/api
```

Create `apps/api/package.json`:

```json
{
  "name": "@catalyst/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio",
    "test": "vitest"
  }
}
```

```bash
cd /Users/Tanya/Documents/Code/Psychological_Safety/apps/api
npm install fastify @fastify/cors @fastify/jwt @fastify/websocket
npm install drizzle-orm postgres
npm install bullmq ioredis
npm install @anthropic-ai/sdk
npm install @slack/bolt
npm install @sendgrid/mail
npm install dotenv zod uuid
npm install -D tsx typescript vitest drizzle-kit @types/node
```

Create `apps/api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "declaration": true,
    "paths": {
      "@shared/*": ["../../packages/shared/src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

**Step 5: Scaffold the shared package**

```bash
mkdir -p packages/shared/src
```

Create `packages/shared/package.json`:

```json
{
  "name": "@catalyst/shared",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  }
}
```

**Step 6: Commit**

```bash
git init
echo "node_modules/\ndist/\n.env\n.expo/\n*.db\n" > .gitignore
git add package.json apps/mobile apps/api packages/shared .gitignore
git commit -m "feat: scaffold monorepo with Expo mobile app, Fastify API, and shared package"
```

---

### Task 2: Define shared types and micro-behavior data

**Files:**
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/micro-behaviors.ts`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/index.ts`

**Step 1: Write shared TypeScript types**

Create `packages/shared/src/types.ts`:

```typescript
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
```

**Step 2: Write micro-behavior seed data**

Create `packages/shared/src/micro-behaviors.ts`:

```typescript
import { MicroBehavior } from "./types";

export const MICRO_BEHAVIORS: MicroBehavior[] = [
  // TIER 1 — Start Here (Days 1-30)
  {
    id: "mb-01",
    name: "Ask before you state",
    description: "Ask a genuine question before stating your view.",
    tier: 1,
    rank: 1,
    scarfDomains: ["status", "autonomy"],
    category: "question",
    timeSeconds: "10",
    exampleScripts: [
      "What's your biggest concern about this project?",
      "What's on your mind that we haven't talked about?",
      "How are you thinking about this differently than I am?",
    ],
    neuroscienceBasis:
      "Questions activate the prefrontal cortex and signal respect for the other person's Status and Autonomy. When a leader asks before telling, it creates a reward response in both SCARF domains.",
  },
  {
    id: "mb-02",
    name: "Name your fallibility",
    description: 'Name your own fallibility: "I may be wrong about this."',
    tier: 1,
    rank: 2,
    scarfDomains: ["status", "fairness"],
    category: "vulnerability",
    timeSeconds: "5",
    exampleScripts: [
      "I may be wrong about this, but here's what I'm thinking...",
      "I don't have the full picture here. What am I missing?",
      "I've changed my mind on this before — challenge me if you see it differently.",
    ],
    neuroscienceBasis:
      "When leaders admit fallibility, it equalizes Status threat for team members. It signals Fairness — that the leader doesn't hold themselves to a different standard.",
  },
  {
    id: "mb-03",
    name: "Thank the dissenter",
    description: "Thank someone specifically for raising a concern or disagreeing.",
    tier: 1,
    rank: 3,
    scarfDomains: ["status", "relatedness"],
    category: "acknowledgment",
    timeSeconds: "10",
    exampleScripts: [
      "Thank you for pushing back on that — that's exactly the kind of challenge we need.",
      "I appreciate you raising that concern. It takes courage and I want more of it.",
      "That's a perspective I hadn't considered. I'm glad you said it.",
    ],
    neuroscienceBasis:
      "Public acknowledgment triggers a strong Status reward in the dissenter and signals Relatedness — that challenging the leader strengthens rather than threatens the relationship.",
  },
  {
    id: "mb-04",
    name: 'Respond with curiosity',
    description: 'Respond to bad news with "Help me understand" not "How did this happen?"',
    tier: 1,
    rank: 4,
    scarfDomains: ["status", "certainty"],
    category: "question",
    timeSeconds: "5",
    exampleScripts: [
      "Help me understand what happened here.",
      "Walk me through this — I want to understand the full picture.",
      "What did we learn from this that we can use going forward?",
    ],
    neuroscienceBasis:
      "\"How did this happen?\" triggers Status threat (blame) and Certainty threat (unpredictable consequences). \"Help me understand\" signals genuine curiosity and protects both domains.",
  },
  {
    id: "mb-05",
    name: "The 5-second pause",
    description: "Wait 5-7 seconds after asking a question before speaking again.",
    tier: 1,
    rank: 5,
    scarfDomains: ["autonomy", "certainty"],
    category: "space_making",
    timeSeconds: "7",
    exampleScripts: [
      "[Ask your question, then silently count to 5 before speaking]",
      "Take your time — I want to hear what you think. [wait]",
      "[If silence feels uncomfortable, that's the signal it's working]",
    ],
    neuroscienceBasis:
      "Most leaders fill silence within 1-2 seconds, cutting off the Autonomy people need to formulate a real answer. A 5-second pause gives the brain time to move from threat response to thoughtful response, increasing Certainty that the leader actually wants to hear the answer.",
  },
  // TIER 2 — Deepen (Days 30-90)
  {
    id: "mb-06",
    name: '"What are we missing?"',
    description: 'Ask "What are we missing?" before making a final decision.',
    tier: 2,
    rank: 6,
    scarfDomains: ["autonomy", "fairness"],
    category: "question",
    timeSeconds: "15",
    exampleScripts: [
      "Before we decide — what are we missing?",
      "What's the argument against this that we haven't made?",
      "If this fails, what will we wish we'd thought about now?",
    ],
    neuroscienceBasis:
      "This question signals that all perspectives are valued (Fairness) and that team members have permission to influence the outcome (Autonomy). It's the single highest-leverage question for catching blind spots.",
  },
  {
    id: "mb-07",
    name: "Share a personal mistake",
    description: "Share a personal mistake or learning moment with your team.",
    tier: 2,
    rank: 7,
    scarfDomains: ["status", "relatedness"],
    category: "vulnerability",
    timeSeconds: "30",
    exampleScripts: [
      "I want to share something I got wrong last week and what I learned from it.",
      "Early in my career I made a similar mistake. Here's what happened...",
      "I was wrong about this last quarter. Here's what I should have done differently.",
    ],
    neuroscienceBasis:
      "Leader vulnerability triggers Daniel Coyle's \"vulnerability loop\" — when a high-status person shows vulnerability, it gives permission for others to do the same, rapidly building Relatedness and equalizing Status.",
  },
  {
    id: "mb-08",
    name: "Check in on the person",
    description: "Check in on the person, not the project. Ask how they're doing, not what they're doing.",
    tier: 2,
    rank: 8,
    scarfDomains: ["relatedness", "status"],
    category: "question",
    timeSeconds: "30",
    exampleScripts: [
      "Before we get into the agenda — how are you doing? Really.",
      "I noticed you seemed quieter than usual in the meeting. Is everything okay?",
      "What's on your mind outside of work that's affecting how you show up?",
    ],
    neuroscienceBasis:
      "Personal check-ins activate the Relatedness reward circuit. When a leader shows interest in the whole person (not just their output), it signals that the person's Status isn't contingent on productivity alone.",
  },
  {
    id: "mb-09",
    name: "Credit someone else's idea",
    description: "Credit someone else's idea publicly in a meeting or message.",
    tier: 2,
    rank: 9,
    scarfDomains: ["status", "fairness"],
    category: "acknowledgment",
    timeSeconds: "10",
    exampleScripts: [
      "This was Sarah's insight — she flagged this risk in our 1:1 last week.",
      "I want to give credit where it's due: this approach came from the team, not me.",
      "James raised this idea in our last meeting and I think it's exactly right.",
    ],
    neuroscienceBasis:
      "Public attribution is one of the strongest Status rewards in organizational life. It signals Fairness (credit goes where it's earned) and encourages others to share ideas knowing they'll be recognized.",
  },
  {
    id: "mb-10",
    name: "Separate brainstorm from evaluation",
    description: "Explicitly separate brainstorming from evaluation — make it clear when ideas are being generated vs. judged.",
    tier: 2,
    rank: 10,
    scarfDomains: ["certainty", "autonomy"],
    category: "space_making",
    timeSeconds: "15",
    exampleScripts: [
      "For the next 10 minutes, let's just generate ideas. No evaluation yet.",
      "I want to hear every option before we start narrowing. All ideas welcome.",
      "We're in brainstorm mode — there are no bad ideas right now. We'll evaluate later.",
    ],
    neuroscienceBasis:
      "When brainstorming and evaluation happen simultaneously, team members self-censor to avoid negative judgment. Explicit separation increases Certainty (I know the rules) and Autonomy (I have permission to think freely).",
  },
];
```

**Step 3: Write constants**

Create `packages/shared/src/constants.ts`:

```typescript
// Brand colors
export const COLORS = {
  navy: "#1B2A4A",
  amber: "#E8913A",
  sage: "#4A9E7D",
  coral: "#E07A6B",
  cream: "#F8F7F4",
  white: "#FFFFFF",
  gray: {
    100: "#f0efeb",
    200: "#e0ddd8",
    300: "#c5c1ba",
    500: "#8a8580",
    700: "#4a4640",
  },
} as const;

// Nudge frequency limits
export const FREQUENCY_CONFIG = {
  gentle: { perWeek: 1, description: "1 nudge per week" },
  steady: { perWeek: 3, description: "2-3 nudges per week" },
  immersive: { perWeek: 7, description: "Daily nudges" },
} as const;

// Anti-overwhelm safeguards (hard-coded, not adjustable)
export const SAFEGUARDS = {
  maxNudgesPerDay: 1,
  quietHoursDefault: { start: "08:00", end: "19:00" },
  weekendsOffDefault: true,
  cooldownAfterSkipHours: 48,
  backToBackMeetingThresholdHours: 4,
  autoDialDownAfterSkips: 3,
  onboardingRampWeeks: 4,
  minPulseResponses: 3, // for anonymity
} as const;

// Edmondson 7-item survey questions
export const EDMONDSON_SURVEY = [
  "If I make a mistake on this team, it is held against me.", // reverse scored
  "Members of this team are able to bring up problems and tough issues.",
  "People on this team sometimes reject others for being different.", // reverse scored
  "It is safe to take a risk on this team.",
  "It is difficult to ask other members of this team for help.", // reverse scored
  "No one on this team would deliberately act to undermine my efforts.",
  "Working with members of this team, my unique skills and talents are valued and utilized.",
] as const;

export const REVERSE_SCORED_ITEMS = [0, 2, 4] as const; // indices of reverse-scored items

// Stage thresholds
export const STAGE_THRESHOLDS = {
  1: { minWeeks: 0, label: "Foundation" },
  2: { minWeeks: 6, label: "Building" },
  3: { minWeeks: 12, label: "Expanding" },
  4: { minWeeks: 26, label: "Leading" },
} as const;
```

**Step 4: Create shared index**

Create `packages/shared/src/index.ts`:

```typescript
export * from "./types";
export * from "./micro-behaviors";
export * from "./constants";
```

**Step 5: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared types, micro-behavior data, and constants"
```

---

## Phase 2: Database Schema & Backend Foundation

### Task 3: Set up PostgreSQL schema with Drizzle

**Files:**
- Create: `apps/api/src/db/schema.ts`
- Create: `apps/api/src/db/index.ts`
- Create: `apps/api/drizzle.config.ts`
- Create: `apps/api/.env.example`

**Step 1: Create the database schema**

Create `apps/api/src/db/schema.ts`:

```typescript
import { pgTable, uuid, text, integer, real, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const nudgeFrequencyEnum = pgEnum("nudge_frequency", ["gentle", "steady", "immersive"]);
export const insightDepthEnum = pgEnum("insight_depth", ["essentials", "informed", "deep_dive"]);
export const channelEnum = pgEnum("channel", ["slack", "teams", "zoom_meeting", "zoom_post", "email", "push", "in_app"]);
export const nudgeTriggerEnum = pgEnum("nudge_trigger", ["pre_meeting", "post_meeting", "post_decision", "weekly", "monday", "contextual"]);
export const nudgeResponseEnum = pgEnum("nudge_response", ["tried", "skipped", "later", "reflection"]);
export const surveyTypeEnum = pgEnum("survey_type", ["baseline", "monthly", "mirror_moment"]);
export const cascadeStatusEnum = pgEnum("cascade_status", ["invited", "onboarded", "active"]);
export const safetyStageEnum = pgEnum("safety_stage", ["1", "2", "3", "4"]);

// Users (Executive Leaders)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  orgId: uuid("org_id").notNull(),
  scarfProfile: jsonb("scarf_profile"), // {status, certainty, autonomy, relatedness, fairness}
  currentStage: safetyStageEnum("current_stage").notNull().default("1"),
  activeMicroBehaviorId: text("active_micro_behavior_id"),
  dialFrequency: nudgeFrequencyEnum("dial_frequency").notNull().default("gentle"),
  dialDepth: insightDepthEnum("dial_depth").notNull().default("informed"),
  channels: jsonb("channels").notNull().default({}), // {slack: true, email: true, ...}
  quietHoursStart: text("quiet_hours_start").notNull().default("08:00"),
  quietHoursEnd: text("quiet_hours_end").notNull().default("19:00"),
  weekendsOff: boolean("weekends_off").notNull().default(true),
  cohortId: uuid("cohort_id"),
  streakCount: integer("streak_count").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  consecutiveSkips: integer("consecutive_skips").notNull().default(0),
  onboardedAt: timestamp("onboarded_at"),
  pausedUntil: timestamp("paused_until"),
  slackUserId: text("slack_user_id"),
  teamsUserId: text("teams_user_id"),
  zoomUserId: text("zoom_user_id"),
  calendarToken: text("calendar_token"), // encrypted
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Team Members (Direct Reports)
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  leaderId: uuid("leader_id").notNull().references(() => users.id),
  cascadeStatus: cascadeStatusEnum("cascade_status").notNull().default("invited"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Nudges
export const nudges = pgTable("nudges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  microBehaviorId: text("micro_behavior_id").notNull(),
  channel: channelEnum("channel").notNull(),
  trigger: nudgeTriggerEnum("trigger").notNull(),
  content: jsonb("content").notNull(), // {question, context, options}
  meetingContext: jsonb("meeting_context"),
  deliveredAt: timestamp("delivered_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
  response: nudgeResponseEnum("response"),
  reflectionText: text("reflection_text"),
});

// Pulse Surveys
export const pulseSurveys = pgTable("pulse_surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaderId: uuid("leader_id").notNull().references(() => users.id),
  surveyType: surveyTypeEnum("survey_type").notNull(),
  aggregateScore: real("aggregate_score"),
  domainScores: jsonb("domain_scores"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Pulse Responses (anonymous)
export const pulseResponses = pgTable("pulse_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").notNull().references(() => pulseSurveys.id),
  scores: jsonb("scores").notNull(), // array of 7 numbers (1-7)
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Mirror Moments
export const mirrorMoments = pgTable("mirror_moments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  pulseSurveyId: uuid("pulse_survey_id").references(() => pulseSurveys.id),
  selfAssessment: jsonb("self_assessment").notNull(),
  teamPerception: jsonb("team_perception").notNull(),
  gaps: jsonb("gaps").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cascade Events
export const cascadeEvents = pgTable("cascade_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaderId: uuid("leader_id").notNull().references(() => users.id),
  reportId: uuid("report_id").references(() => teamMembers.id),
  eventType: text("event_type").notNull(), // invited, onboarded, milestone
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Peer Cohorts
export const peerCohorts = pgTable("peer_cohorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nextSession: timestamp("next_session"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Meeting Analyses (from Zoom AI Companion)
export const meetingAnalyses = pgTable("meeting_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  meetingId: text("meeting_id"),
  signals: jsonb("signals").notNull(), // {participation, questions, dissent, ...}
  leaderAirtimePct: real("leader_airtime_pct"),
  quietMembers: jsonb("quiet_members"),
  nudgeId: uuid("nudge_id").references(() => nudges.id),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});
```

**Step 2: Create DB connection**

Create `apps/api/src/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/catalyst";
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export { schema };
```

**Step 3: Create Drizzle config**

Create `apps/api/drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://localhost:5432/catalyst",
  },
});
```

**Step 4: Create .env.example**

Create `apps/api/.env.example`:

```
DATABASE_URL=postgres://localhost:5432/catalyst
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-jwt-secret-here
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
SENDGRID_API_KEY=SG....
PORT=3000
```

**Step 5: Commit**

```bash
git add apps/api/src/db/ apps/api/drizzle.config.ts apps/api/.env.example
git commit -m "feat: add PostgreSQL schema with Drizzle ORM — users, nudges, surveys, mirror moments, cascade"
```

---

### Task 4: Create Fastify server with core middleware

**Files:**
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/middleware/auth.ts`

**Step 1: Write the Fastify server entry point**

Create `apps/api/src/server.ts`:

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

// Plugins
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || "dev-secret" });

// Health check
app.get("/health", async () => ({ status: "ok", service: "catalyst-api" }));

// Routes will be registered here as we build them
// app.register(import("./routes/onboarding"), { prefix: "/api/onboarding" });
// app.register(import("./routes/dashboard"), { prefix: "/api/dashboard" });
// app.register(import("./routes/nudges"), { prefix: "/api/nudges" });
// app.register(import("./routes/pulse"), { prefix: "/api/pulse" });
// app.register(import("./routes/mirror"), { prefix: "/api/mirror" });
// app.register(import("./routes/cascade"), { prefix: "/api/cascade" });
// app.register(import("./routes/library"), { prefix: "/api/library" });
// app.register(import("./routes/settings"), { prefix: "/api/settings" });
// app.register(import("./routes/webhooks"), { prefix: "/webhooks" });

const start = async () => {
  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Catalyst API running on port ${port}`);
};

start();

export default app;
```

**Step 2: Write auth middleware**

Create `apps/api/src/middleware/auth.ts`:

```typescript
import { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
}
```

**Step 3: Verify server starts**

Run: `cd apps/api && npx tsx src/server.ts`
Expected: "Catalyst API running on port 3000"

**Step 4: Commit**

```bash
git add apps/api/src/server.ts apps/api/src/middleware/
git commit -m "feat: add Fastify server with JWT auth and health check"
```

---

## Phase 3: Core API Routes

### Task 5: Onboarding API routes

**Files:**
- Create: `apps/api/src/routes/onboarding.ts`
- Create: `apps/api/src/routes/auth.ts`

**Step 1: Write auth routes (simplified for MVP — email-based magic link)**

Create `apps/api/src/routes/auth.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export default async function authRoutes(app: FastifyInstance) {
  // Simple login/register for MVP (production would use OAuth)
  app.post("/login", async (request, reply) => {
    const { email, name } = loginSchema.parse(request.body);

    let user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      // Auto-register for MVP
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email,
          name: name || email.split("@")[0],
          orgId: "00000000-0000-0000-0000-000000000000", // default org for MVP
        })
        .returning();
      user = newUser;
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { token, user };
  });

  // Get current user
  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    return user;
  });
}
```

**Step 2: Write onboarding routes**

Create `apps/api/src/routes/onboarding.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const scarfSchema = z.object({
  status: z.number().min(1).max(10),
  certainty: z.number().min(1).max(10),
  autonomy: z.number().min(1).max(10),
  relatedness: z.number().min(1).max(10),
  fairness: z.number().min(1).max(10),
});

const focusSchema = z.object({
  microBehaviorId: z.string(),
});

const channelsSchema = z.object({
  channels: z.record(z.boolean()),
});

export default async function onboardingRoutes(app: FastifyInstance) {
  // Get onboarding status
  app.get("/status", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) return { step: "not_found" };

    if (!user.scarfProfile) return { step: "scarf_assessment", progress: 1 };
    if (!user.activeMicroBehaviorId) return { step: "choose_focus", progress: 2 };
    if (!Object.values(user.channels as Record<string, boolean>).some(Boolean))
      return { step: "connect_channels", progress: 3 };
    if (!user.onboardedAt) return { step: "complete_onboarding", progress: 4 };

    return { step: "complete", progress: 5 };
  });

  // Submit SCARF assessment
  app.post("/scarf", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const profile = scarfSchema.parse(request.body);

    const [updated] = await db
      .update(schema.users)
      .set({ scarfProfile: profile })
      .where(eq(schema.users.id, id))
      .returning();

    return updated;
  });

  // Choose first micro-behavior focus
  app.post("/focus", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const { microBehaviorId } = focusSchema.parse(request.body);

    const [updated] = await db
      .update(schema.users)
      .set({ activeMicroBehaviorId: microBehaviorId })
      .where(eq(schema.users.id, id))
      .returning();

    return updated;
  });

  // Connect channels
  app.post("/channels", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const { channels } = channelsSchema.parse(request.body);

    const [updated] = await db
      .update(schema.users)
      .set({ channels })
      .where(eq(schema.users.id, id))
      .returning();

    return updated;
  });

  // Complete onboarding
  app.post("/complete", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };

    const [updated] = await db
      .update(schema.users)
      .set({ onboardedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return updated;
  });
}
```

**Step 3: Commit**

```bash
git add apps/api/src/routes/
git commit -m "feat: add auth and onboarding API routes"
```

---

### Task 6: Dashboard, nudges, settings, and library API routes

**Files:**
- Create: `apps/api/src/routes/dashboard.ts`
- Create: `apps/api/src/routes/nudges.ts`
- Create: `apps/api/src/routes/settings.ts`
- Create: `apps/api/src/routes/library.ts`

**Step 1: Write dashboard route**

Create `apps/api/src/routes/dashboard.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, desc, and, gte } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    // Latest pulse survey
    const latestPulse = await db.query.pulseSurveys.findFirst({
      where: eq(schema.pulseSurveys.leaderId, id),
      orderBy: [desc(schema.pulseSurveys.createdAt)],
    });

    // Today's nudge (most recent unresponded)
    const todaysNudge = await db.query.nudges.findFirst({
      where: and(
        eq(schema.nudges.userId, id),
        eq(schema.nudges.response, null as any),
      ),
      orderBy: [desc(schema.nudges.deliveredAt)],
    });

    // Recent nudge history (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentNudges = await db.query.nudges.findMany({
      where: and(
        eq(schema.nudges.userId, id),
        gte(schema.nudges.deliveredAt, weekAgo),
      ),
      orderBy: [desc(schema.nudges.deliveredAt)],
    });

    const respondedCount = recentNudges.filter((n) => n.response === "tried").length;

    return {
      user,
      safetyScore: latestPulse?.aggregateScore || null,
      todaysNudge,
      streak: user?.streakCount || 0,
      weeklyEngagement: {
        delivered: recentNudges.length,
        responded: respondedCount,
      },
    };
  });
}
```

**Step 2: Write nudges routes**

Create `apps/api/src/routes/nudges.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const respondSchema = z.object({
  response: z.enum(["tried", "skipped", "later", "reflection"]),
  reflectionText: z.string().optional(),
});

export default async function nudgeRoutes(app: FastifyInstance) {
  // List nudge history
  app.get("/", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const nudges = await db.query.nudges.findMany({
      where: eq(schema.nudges.userId, id),
      orderBy: [desc(schema.nudges.deliveredAt)],
      limit: 50,
    });
    return nudges;
  });

  // Respond to a nudge
  app.post("/:nudgeId/respond", { preHandler: [authenticate] }, async (request) => {
    const { nudgeId } = request.params as { nudgeId: string };
    const { id: userId } = request.user as { id: string };
    const { response, reflectionText } = respondSchema.parse(request.body);

    // Update nudge
    const [updated] = await db
      .update(schema.nudges)
      .set({
        response,
        reflectionText: reflectionText || null,
        respondedAt: new Date(),
      })
      .where(and(eq(schema.nudges.id, nudgeId), eq(schema.nudges.userId, userId)))
      .returning();

    // Update streak and skip count
    if (response === "tried") {
      await db
        .update(schema.users)
        .set({
          streakCount: db.raw`streak_count + 1` as any,
          consecutiveSkips: 0,
        })
        .where(eq(schema.users.id, userId));
    } else if (response === "skipped") {
      const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
      const newSkips = (user?.consecutiveSkips || 0) + 1;

      const updates: Record<string, any> = {
        consecutiveSkips: newSkips,
        streakCount: 0,
      };

      // Auto-dial down after 3 consecutive skips
      if (newSkips >= 3 && user?.dialFrequency !== "gentle") {
        updates.dialFrequency = "gentle";
      }

      await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));
    }

    return updated;
  });
}
```

**Step 3: Write settings routes**

Create `apps/api/src/routes/settings.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const settingsSchema = z.object({
  dialFrequency: z.enum(["gentle", "steady", "immersive"]).optional(),
  dialDepth: z.enum(["essentials", "informed", "deep_dive"]).optional(),
  channels: z.record(z.boolean()).optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  weekendsOff: z.boolean().optional(),
});

const pauseSchema = z.object({
  duration: z.enum(["1_week", "2_weeks", "1_month"]),
});

export default async function settingsRoutes(app: FastifyInstance) {
  // Get settings
  app.get("/", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    return {
      dialFrequency: user?.dialFrequency,
      dialDepth: user?.dialDepth,
      channels: user?.channels,
      quietHoursStart: user?.quietHoursStart,
      quietHoursEnd: user?.quietHoursEnd,
      weekendsOff: user?.weekendsOff,
      pausedUntil: user?.pausedUntil,
    };
  });

  // Update settings
  app.put("/", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const updates = settingsSchema.parse(request.body);

    const setFields: Record<string, any> = {};
    if (updates.dialFrequency) setFields.dialFrequency = updates.dialFrequency;
    if (updates.dialDepth) setFields.dialDepth = updates.dialDepth;
    if (updates.channels) setFields.channels = updates.channels;
    if (updates.quietHoursStart) setFields.quietHoursStart = updates.quietHoursStart;
    if (updates.quietHoursEnd) setFields.quietHoursEnd = updates.quietHoursEnd;
    if (updates.weekendsOff !== undefined) setFields.weekendsOff = updates.weekendsOff;

    const [updated] = await db
      .update(schema.users)
      .set(setFields)
      .where(eq(schema.users.id, id))
      .returning();

    return updated;
  });

  // Pause all nudges
  app.post("/pause", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const { duration } = pauseSchema.parse(request.body);

    const pauseUntil = new Date();
    if (duration === "1_week") pauseUntil.setDate(pauseUntil.getDate() + 7);
    if (duration === "2_weeks") pauseUntil.setDate(pauseUntil.getDate() + 14);
    if (duration === "1_month") pauseUntil.setMonth(pauseUntil.getMonth() + 1);

    const [updated] = await db
      .update(schema.users)
      .set({ pausedUntil: pauseUntil, dialFrequency: "gentle" })
      .where(eq(schema.users.id, id))
      .returning();

    return updated;
  });
}
```

**Step 4: Write library route**

Create `apps/api/src/routes/library.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { MICRO_BEHAVIORS } from "@catalyst/shared";

export default async function libraryRoutes(app: FastifyInstance) {
  // Get all micro-behaviors
  app.get("/", async () => {
    return {
      tier1: MICRO_BEHAVIORS.filter((b) => b.tier === 1),
      tier2: MICRO_BEHAVIORS.filter((b) => b.tier === 2),
    };
  });

  // Get single micro-behavior
  app.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const behavior = MICRO_BEHAVIORS.find((b) => b.id === id);
    if (!behavior) return { error: "Not found" };
    return behavior;
  });
}
```

**Step 5: Register all routes in server.ts**

Update `apps/api/src/server.ts` to uncomment and register routes.

**Step 6: Commit**

```bash
git add apps/api/src/routes/
git commit -m "feat: add dashboard, nudges, settings, and library API routes"
```

---

### Task 7: Pulse survey and mirror moment API routes

**Files:**
- Create: `apps/api/src/routes/pulse.ts`
- Create: `apps/api/src/routes/mirror.ts`
- Create: `apps/api/src/routes/cascade.ts`

**Step 1: Write pulse survey routes**

Create `apps/api/src/routes/pulse.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth";
import { SAFEGUARDS, REVERSE_SCORED_ITEMS } from "@catalyst/shared";

const createPulseSchema = z.object({
  surveyType: z.enum(["baseline", "monthly", "mirror_moment"]),
});

const respondPulseSchema = z.object({
  surveyId: z.string().uuid(),
  scores: z.array(z.number().min(1).max(7)).length(7),
});

export default async function pulseRoutes(app: FastifyInstance) {
  // Create a pulse survey
  app.post("/create", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const { surveyType } = createPulseSchema.parse(request.body);

    const [survey] = await db
      .insert(schema.pulseSurveys)
      .values({ leaderId: id, surveyType })
      .returning();

    return survey;
  });

  // Team member submits anonymous response
  app.post("/respond", async (request) => {
    const { surveyId, scores } = respondPulseSchema.parse(request.body);

    await db.insert(schema.pulseResponses).values({ surveyId, scores });

    // Check if we have enough responses to aggregate
    const responses = await db.query.pulseResponses.findMany({
      where: eq(schema.pulseResponses.surveyId, surveyId),
    });

    if (responses.length >= SAFEGUARDS.minPulseResponses) {
      // Aggregate scores
      const allScores = responses.map((r) => r.scores as number[]);
      const avgScores = Array(7)
        .fill(0)
        .map((_, i) => {
          const sum = allScores.reduce((acc, s) => acc + s[i], 0);
          const avg = sum / allScores.length;
          // Reverse-score items 1, 3, 5
          return REVERSE_SCORED_ITEMS.includes(i as any) ? 8 - avg : avg;
        });

      const aggregateScore = avgScores.reduce((a, b) => a + b, 0) / 7;
      const normalized = Math.round((aggregateScore / 7) * 100);

      await db
        .update(schema.pulseSurveys)
        .set({ aggregateScore: normalized, closedAt: new Date() })
        .where(eq(schema.pulseSurveys.id, surveyId));
    }

    return { received: true, responseCount: responses.length + 1 };
  });

  // Get results (leader only, aggregated)
  app.get("/results/:surveyId", { preHandler: [authenticate] }, async (request) => {
    const { surveyId } = request.params as { surveyId: string };
    const { id } = request.user as { id: string };

    const survey = await db.query.pulseSurveys.findFirst({
      where: and(
        eq(schema.pulseSurveys.id, surveyId),
        eq(schema.pulseSurveys.leaderId, id),
      ),
    });

    if (!survey) return { error: "Not found" };

    const responseCount = await db.query.pulseResponses.findMany({
      where: eq(schema.pulseResponses.surveyId, surveyId),
    });

    if (responseCount.length < SAFEGUARDS.minPulseResponses) {
      return {
        survey,
        status: "waiting",
        responsesReceived: responseCount.length,
        responsesNeeded: SAFEGUARDS.minPulseResponses,
      };
    }

    return { survey, status: "ready", responseCount: responseCount.length };
  });
}
```

**Step 2: Write mirror moment routes**

Create `apps/api/src/routes/mirror.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

export default async function mirrorRoutes(app: FastifyInstance) {
  // Get latest mirror moment
  app.get("/latest", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const mirror = await db.query.mirrorMoments.findFirst({
      where: eq(schema.mirrorMoments.userId, id),
      orderBy: [desc(schema.mirrorMoments.createdAt)],
    });
    return mirror || { status: "not_available" };
  });

  // Get all mirror moments (history)
  app.get("/history", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    return db.query.mirrorMoments.findMany({
      where: eq(schema.mirrorMoments.userId, id),
      orderBy: [desc(schema.mirrorMoments.createdAt)],
    });
  });
}
```

**Step 3: Write cascade routes**

Create `apps/api/src/routes/cascade.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const inviteSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export default async function cascadeRoutes(app: FastifyInstance) {
  // Get cascade tree
  app.get("/", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    const members = await db.query.teamMembers.findMany({
      where: eq(schema.teamMembers.leaderId, id),
    });

    // Get latest pulse for the leader
    const latestPulse = await db.query.pulseSurveys.findFirst({
      where: eq(schema.pulseSurveys.leaderId, id),
      orderBy: (ps, { desc }) => [desc(ps.createdAt)],
    });

    return {
      leader: {
        id: user?.id,
        name: user?.name,
        safetyScore: latestPulse?.aggregateScore || null,
        stage: user?.currentStage,
      },
      directReports: members.map((m) => ({
        id: m.id,
        name: m.name,
        cascadeStatus: m.cascadeStatus,
      })),
    };
  });

  // Invite a direct report
  app.post("/invite", { preHandler: [authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const { name, email } = inviteSchema.parse(request.body);

    const [member] = await db
      .insert(schema.teamMembers)
      .values({ name, email, leaderId: id, cascadeStatus: "invited" })
      .returning();

    // Log cascade event
    await db.insert(schema.cascadeEvents).values({
      leaderId: id,
      reportId: member.id,
      eventType: "invited",
    });

    return member;
  });
}
```

**Step 4: Commit**

```bash
git add apps/api/src/routes/
git commit -m "feat: add pulse survey, mirror moment, and cascade API routes"
```

---

## Phase 4: Nudge Engine (Claude AI Personalization + Scheduling)

### Task 8: Build the nudge personalization service

**Files:**
- Create: `apps/api/src/services/nudge-engine.ts`
- Create: `apps/api/src/services/claude.ts`

**Step 1: Write the Claude API integration for nudge personalization**

Create `apps/api/src/services/claude.ts`:

```typescript
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
    return JSON.parse(text);
  } catch {
    // Fallback to a simple nudge using the example scripts
    return {
      question: ctx.microBehavior.exampleScripts[0],
      context: ctx.microBehavior.description,
      options: ["Tried it", "Skip", "Remind me later"],
    };
  }
}
```

**Step 2: Write the nudge engine**

Create `apps/api/src/services/nudge-engine.ts`:

```typescript
import { db, schema } from "../db";
import { eq, and, isNull, lte } from "drizzle-orm";
import { personalizeNudge } from "./claude";
import { MICRO_BEHAVIORS, SAFEGUARDS, FREQUENCY_CONFIG } from "@catalyst/shared";
import type { Channel, NudgeTrigger } from "@catalyst/shared";

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
  const startHour = parseInt(user.quietHoursStart.split(":")[0]);
  const endHour = parseInt(user.quietHoursEnd.split(":")[0]);
  if (currentHour < startHour || currentHour >= endHour) return;

  // Check weekends
  const day = now.getDay();
  if (user.weekendsOff && (day === 0 || day === 6)) return;

  // Check daily limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysNudges = await db.query.nudges.findMany({
    where: and(
      eq(schema.nudges.userId, userId),
      // delivered today check
    ),
  });

  // Find the active micro-behavior
  const behavior = MICRO_BEHAVIORS.find((b) => b.id === user.activeMicroBehaviorId);
  if (!behavior) return;

  // Determine delivery channel
  const channels = user.channels as Record<string, boolean>;
  let channel: Channel = "in_app";
  if (trigger === "pre_meeting" && channels.slack) channel = "slack";
  else if (trigger === "post_meeting" && channels.zoom_post) channel = "zoom_post";
  else if (trigger === "weekly" && channels.email) channel = "email";
  else if (channels.slack) channel = "slack";
  else if (channels.teams) channel = "teams";

  // Personalize the nudge via Claude
  const content = await personalizeNudge({
    userName: user.name,
    microBehavior: behavior,
    scarfProfile: (user.scarfProfile as Record<string, number>) || {
      status: 5, certainty: 5, autonomy: 5, relatedness: 5, fairness: 5,
    },
    depth: user.dialDepth,
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
```

**Step 3: Commit**

```bash
git add apps/api/src/services/
git commit -m "feat: add Claude-powered nudge personalization engine"
```

---

### Task 9: Set up BullMQ job scheduling

**Files:**
- Create: `apps/api/src/jobs/queue.ts`
- Create: `apps/api/src/jobs/nudge-scheduler.ts`
- Create: `apps/api/src/jobs/worker.ts`

**Step 1: Write queue setup**

Create `apps/api/src/jobs/queue.ts`:

```typescript
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const nudgeQueue = new Queue("nudge", { connection });
export const pulseQueue = new Queue("pulse", { connection });
export const meetingQueue = new Queue("meeting", { connection });

export { connection };
```

**Step 2: Write nudge scheduler**

Create `apps/api/src/jobs/nudge-scheduler.ts`:

```typescript
import { nudgeQueue } from "./queue";
import { db, schema } from "../db";
import { isNull, and, lte, or, eq } from "drizzle-orm";

// Schedule Monday morning reflections
export async function scheduleMondayReflections() {
  const users = await db.query.users.findMany({
    where: and(
      isNull(schema.users.pausedUntil),
      eq(schema.users.onboardedAt, schema.users.onboardedAt), // not null check workaround
    ),
  });

  for (const user of users) {
    if (!user.onboardedAt) continue;
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
```

**Step 3: Write worker**

Create `apps/api/src/jobs/worker.ts`:

```typescript
import { Worker } from "bullmq";
import { connection } from "./queue";
import { generateNudge } from "../services/nudge-engine";
import { scheduleMondayReflections } from "./nudge-scheduler";

const nudgeWorker = new Worker(
  "nudge",
  async (job) => {
    switch (job.name) {
      case "weekly-scheduler":
        await scheduleMondayReflections();
        break;
      case "monday-reflection":
        await generateNudge(job.data.userId, "monday");
        break;
      case "pre-meeting":
        await generateNudge(job.data.userId, "pre_meeting", job.data.meetingContext);
        break;
      case "post-meeting":
        await generateNudge(job.data.userId, "post_meeting", job.data.meetingContext);
        break;
      case "contextual":
        await generateNudge(job.data.userId, "contextual");
        break;
      default:
        console.log(`Unknown job: ${job.name}`);
    }
  },
  { connection },
);

nudgeWorker.on("completed", (job) => {
  console.log(`Job ${job.id} (${job.name}) completed`);
});

nudgeWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} (${job?.name}) failed:`, err);
});

export { nudgeWorker };
```

**Step 4: Commit**

```bash
git add apps/api/src/jobs/
git commit -m "feat: add BullMQ job scheduling for nudge delivery pipeline"
```

---

## Phase 5: React Native App — Screens

### Task 10: App navigation and theme setup

**Files:**
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/index.tsx` (Home)
- Create: `apps/mobile/app/(tabs)/mirror.tsx`
- Create: `apps/mobile/app/(tabs)/cascade.tsx`
- Create: `apps/mobile/app/(tabs)/library.tsx`
- Create: `apps/mobile/lib/api.ts`
- Create: `apps/mobile/lib/store.ts`

**Step 1: Set up Expo Router with tab navigation**

Use Expo Router (file-based routing). Create the tab layout with 4 tabs: Home, Mirror, Cascade, Library.

Create `apps/mobile/app/_layout.tsx`:

```tsx
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
```

Create `apps/mobile/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E8913A",
        tabBarInactiveTintColor: "#8a8580",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#e0ddd8",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>&#9679;</Text> }}
      />
      <Tabs.Screen
        name="mirror"
        options={{ title: "Mirror", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>&#9681;</Text> }}
      />
      <Tabs.Screen
        name="cascade"
        options={{ title: "Cascade", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>&#9700;</Text> }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: "Library", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>&#9776;</Text> }}
      />
    </Tabs>
  );
}
```

**Step 2: Set up API client and Zustand store**

Create `apps/mobile/lib/api.ts`:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

let token: string | null = null;

export function setToken(t: string) { token = t; }

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
}
```

Create `apps/mobile/lib/store.ts`:

```typescript
import { create } from "zustand";

interface CatalystStore {
  user: any | null;
  token: string | null;
  dashboard: any | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  setDashboard: (data: any) => void;
}

export const useStore = create<CatalystStore>((set) => ({
  user: null,
  token: null,
  dashboard: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setDashboard: (dashboard) => set({ dashboard }),
}));
```

**Step 3: Commit**

```bash
git add apps/mobile/
git commit -m "feat: set up Expo Router navigation with tabs and Zustand store"
```

---

### Task 11: Build onboarding screens

**Files:**
- Create: `apps/mobile/app/(onboarding)/_layout.tsx`
- Create: `apps/mobile/app/(onboarding)/welcome.tsx`
- Create: `apps/mobile/app/(onboarding)/scarf.tsx`
- Create: `apps/mobile/app/(onboarding)/focus.tsx`
- Create: `apps/mobile/app/(onboarding)/channels.tsx`
- Create: `apps/mobile/components/PerceptionGap.tsx`
- Create: `apps/mobile/components/ScarfSlider.tsx`
- Create: `apps/mobile/components/BehaviorCard.tsx`

**Step 1: Build the Perception Gap reveal (Welcome screen)**

Create `apps/mobile/components/PerceptionGap.tsx`:

```tsx
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

export function PerceptionGap() {
  const execWidth = useSharedValue(0);
  const teamWidth = useSharedValue(0);

  useEffect(() => {
    execWidth.value = withTiming(93, { duration: 1500 });
    teamWidth.value = withTiming(53, { duration: 1500 });
  }, []);

  const execStyle = useAnimatedStyle(() => ({
    width: `${execWidth.value}%`,
  }));

  const teamStyle = useAnimatedStyle(() => ({
    width: `${teamWidth.value}%`,
  }));

  return (
    <View className="px-6 py-4">
      <View className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">YOU</Text>
        <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View style={execStyle} className="h-full bg-sage rounded-full items-end justify-center pr-3">
            <Text className="text-white font-inter-bold text-sm">93%</Text>
          </Animated.View>
        </View>
      </View>
      <View>
        <Text className="text-sm text-gray-500 mb-1">YOUR TEAM</Text>
        <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View style={teamStyle} className="h-full bg-coral rounded-full items-end justify-center pr-3">
            <Text className="text-white font-inter-bold text-sm">53%</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
```

Create `apps/mobile/app/(onboarding)/welcome.tsx`:

```tsx
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PerceptionGap } from "../../components/PerceptionGap";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-inter-bold text-navy text-center mb-2">
          Catalyst
        </Text>
        <Text className="text-lg text-gray-500 text-center mb-12">
          How safe does your team feel to speak up?
        </Text>

        <PerceptionGap />

        <Text className="text-base text-gray-500 text-center mt-8 px-4 leading-6">
          The gap between how leaders and teams experience safety is the #1 blind spot in leadership.
        </Text>

        <Pressable
          className="bg-amber rounded-xl py-4 px-8 mt-12 mx-6"
          onPress={() => router.push("/(onboarding)/scarf")}
        >
          <Text className="text-white font-inter-bold text-center text-lg">
            Close the gap
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Step 2: Build SCARF Assessment screen**

Create `apps/mobile/components/ScarfSlider.tsx`:

```tsx
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

interface Props {
  domain: string;
  question: string;
  value: number;
  onChange: (v: number) => void;
}

const DOMAIN_QUESTIONS: Record<string, string> = {
  Status: "How important is it to you to feel respected and valued for your expertise?",
  Certainty: "How much do you need predictability and clarity to feel comfortable?",
  Autonomy: "How important is having control over your decisions and work?",
  Relatedness: "How connected do you feel to your team on a personal level?",
  Fairness: "How sensitive are you to perceived inequity or inconsistency?",
};

export function ScarfSlider({ domain, question, value, onChange }: Props) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-inter-bold text-navy text-center mb-3">
        {domain.toUpperCase()}
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6 px-4">
        {question}
      </Text>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={1}
        maximumValue={10}
        step={0.1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#E8913A"
        maximumTrackTintColor="#e0ddd8"
        thumbTintColor="#1B2A4A"
      />
      <View className="flex-row justify-between px-2 mt-1">
        <Text className="text-sm text-gray-400">Rarely</Text>
        <Text className="text-lg font-inter-bold text-navy">{value.toFixed(1)}</Text>
        <Text className="text-sm text-gray-400">Deeply</Text>
      </View>
    </View>
  );
}
```

Create `apps/mobile/app/(onboarding)/scarf.tsx`:

```tsx
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { ScarfSlider } from "../../components/ScarfSlider";
import { api } from "../../lib/api";

const DOMAINS = [
  { key: "status", label: "Status", question: "How important is it to you to feel respected and valued for your expertise?" },
  { key: "certainty", label: "Certainty", question: "How much do you need predictability and clarity to feel comfortable?" },
  { key: "autonomy", label: "Autonomy", question: "How important is having control over your decisions and work?" },
  { key: "relatedness", label: "Relatedness", question: "How connected do you feel to your team on a personal level?" },
  { key: "fairness", label: "Fairness", question: "How sensitive are you to perceived inequity or inconsistency?" },
];

export default function ScarfScreen() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    status: 5, certainty: 5, autonomy: 5, relatedness: 5, fairness: 5,
  });

  const domain = DOMAINS[step];

  const handleNext = async () => {
    if (step < DOMAINS.length - 1) {
      setStep(step + 1);
    } else {
      await api("/api/onboarding/scarf", {
        method: "POST",
        body: JSON.stringify(scores),
      });
      router.push("/(onboarding)/focus");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="text-sm text-gray-400 text-center mb-2">
          Assessment {step + 1} of {DOMAINS.length}
        </Text>

        <ScarfSlider
          domain={domain.label}
          question={domain.question}
          value={scores[domain.key]}
          onChange={(v) => setScores({ ...scores, [domain.key]: v })}
        />

        <Pressable
          className="bg-navy rounded-xl py-4 px-8 mx-6 mt-8"
          onPress={handleNext}
        >
          <Text className="text-white font-inter-bold text-center text-lg">
            {step < DOMAINS.length - 1 ? "Next" : "See my profile"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Step 3: Build Focus selection and Channels screens**

Create `apps/mobile/components/BehaviorCard.tsx`:

```tsx
import { View, Text, Pressable } from "react-native";

interface Props {
  name: string;
  description: string;
  timeSeconds: string;
  selected: boolean;
  onPress: () => void;
}

export function BehaviorCard({ name, description, timeSeconds, selected, onPress }: Props) {
  return (
    <Pressable
      className={`border-2 rounded-xl p-4 mb-3 ${selected ? "border-amber bg-amber/5" : "border-gray-200 bg-white"}`}
      onPress={onPress}
    >
      <Text className="text-base font-inter-bold text-navy">{name}</Text>
      <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      <Text className="text-xs text-gray-400 mt-2">~{timeSeconds} sec</Text>
    </Pressable>
  );
}
```

Create `apps/mobile/app/(onboarding)/focus.tsx`:

```tsx
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { BehaviorCard } from "../../components/BehaviorCard";
import { api } from "../../lib/api";
import { MICRO_BEHAVIORS } from "@catalyst/shared";

const TIER_1 = MICRO_BEHAVIORS.filter((b) => b.tier === 1);

export default function FocusScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await api("/api/onboarding/focus", {
      method: "POST",
      body: JSON.stringify({ microBehaviorId: selected }),
    });
    router.push("/(onboarding)/channels");
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-sm text-gray-400 mb-2">Pick one to start</Text>
        <Text className="text-xl font-inter-bold text-navy mb-6">
          Which feels most natural to try this week?
        </Text>

        {TIER_1.map((b) => (
          <BehaviorCard
            key={b.id}
            name={b.name}
            description={b.description}
            timeSeconds={b.timeSeconds}
            selected={selected === b.id}
            onPress={() => setSelected(b.id)}
          />
        ))}
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable
          className={`rounded-xl py-4 px-8 ${selected ? "bg-amber" : "bg-gray-300"}`}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text className="text-white font-inter-bold text-center text-lg">Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

Create `apps/mobile/app/(onboarding)/channels.tsx`:

```tsx
import { View, Text, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { api } from "../../lib/api";

const CHANNEL_OPTIONS = [
  { key: "slack", label: "Slack", description: "Quick nudges in DM" },
  { key: "teams", label: "Microsoft Teams", description: "Nudges via Teams chat" },
  { key: "zoom_post", label: "Zoom (Post-Meeting)", description: "Insights after meetings" },
  { key: "zoom_meeting", label: "Zoom (In-Meeting)", description: "Live sidebar coaching" },
  { key: "email", label: "Email", description: "Weekly digest" },
  { key: "push", label: "Mobile Push", description: "Calendar-timed nudges" },
];

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Record<string, boolean>>({
    slack: false, teams: false, zoom_post: false, zoom_meeting: false, email: true, push: false,
  });

  const handleComplete = async () => {
    await api("/api/onboarding/channels", {
      method: "POST",
      body: JSON.stringify({ channels }),
    });
    await api("/api/onboarding/complete", { method: "POST" });
    router.replace("/(tabs)");
  };

  const anySelected = Object.values(channels).some(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-xl font-inter-bold text-navy mb-2">
          Where should we reach you?
        </Text>
        <Text className="text-base text-gray-500 mb-8">
          Toggle on the channels you use. You can change this anytime.
        </Text>

        {CHANNEL_OPTIONS.map((ch) => (
          <View key={ch.key} className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View>
              <Text className="text-base font-inter-bold text-navy">{ch.label}</Text>
              <Text className="text-sm text-gray-400">{ch.description}</Text>
            </View>
            <Switch
              value={channels[ch.key]}
              onValueChange={(v) => setChannels({ ...channels, [ch.key]: v })}
              trackColor={{ true: "#E8913A", false: "#e0ddd8" }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </View>

      <View className="px-6 pb-8">
        <Pressable
          className={`rounded-xl py-4 px-8 ${anySelected ? "bg-amber" : "bg-gray-300"}`}
          onPress={handleComplete}
          disabled={!anySelected}
        >
          <Text className="text-white font-inter-bold text-center text-lg">
            Start my journey
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Step 4: Commit**

```bash
git add apps/mobile/
git commit -m "feat: build onboarding screens — welcome, SCARF assessment, focus selection, channels"
```

---

### Task 12: Build main app screens (Home, Mirror, Cascade, Library)

**Files:**
- Create: `apps/mobile/app/(tabs)/index.tsx` (Home Dashboard)
- Create: `apps/mobile/app/(tabs)/mirror.tsx` (Mirror Moment)
- Create: `apps/mobile/app/(tabs)/cascade.tsx` (Cascade View)
- Create: `apps/mobile/app/(tabs)/library.tsx` (Nudge Library)
- Create: `apps/mobile/app/(tabs)/settings.tsx` (Settings/Dials)
- Create: `apps/mobile/components/SafetyRing.tsx`
- Create: `apps/mobile/components/NudgeCard.tsx`
- Create: `apps/mobile/components/ScarfRadar.tsx`
- Create: `apps/mobile/components/CascadeTree.tsx`

These screens follow the wireframes from the design doc (Sections 8.3-8.8). Each screen fetches data from the API and renders using the Catalyst brand colors (navy, amber, sage, coral, cream).

**Implementation notes:**
- Home Dashboard: Safety score ring, today's nudge card, streak counter, upcoming meetings
- Mirror Moment: Side-by-side SCARF radar charts (self vs team), gap analysis, recommendation
- Cascade View: Tree visualization of the leader's org with color-coded safety scores
- Library: Scrollable list of all 10 micro-behaviors with tier grouping
- Settings: Three dials (frequency, depth, channels), quiet hours, pause button

Each screen is a standard React Native ScrollView with NativeWind styling. Data is fetched via the `api()` helper and stored in Zustand.

**Step 5: Commit**

```bash
git add apps/mobile/
git commit -m "feat: build main app screens — home dashboard, mirror moment, cascade view, library, settings"
```

---

## Phase 6: Bot Integrations

### Task 13: Slack bot integration

**Files:**
- Create: `apps/api/src/integrations/slack.ts`
- Create: `apps/api/src/integrations/channel-adapter.ts`

**Step 1: Write the Slack bot**

Create `apps/api/src/integrations/slack.ts`:

```typescript
import { App as SlackApp } from "@slack/bolt";
import { db, schema } from "../db";
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
```

**Step 2: Write channel adapter**

Create `apps/api/src/integrations/channel-adapter.ts`:

```typescript
import { deliverSlackNudge } from "./slack";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import type { Channel } from "@catalyst/shared";

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

    case "email":
      // TODO: SendGrid email delivery
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
      console.log(`[Unknown channel] ${channel}`);
  }
}
```

**Step 3: Commit**

```bash
git add apps/api/src/integrations/
git commit -m "feat: add Slack bot integration and multi-channel delivery adapter"
```

---

### Task 14: Email digest and Zoom webhook handlers

**Files:**
- Create: `apps/api/src/integrations/email.ts`
- Create: `apps/api/src/integrations/zoom.ts`
- Create: `apps/api/src/routes/webhooks.ts`

**Step 1: Write email digest service**

Create `apps/api/src/integrations/email.ts`:

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendWeeklyDigest(to: string, data: {
  name: string;
  nudgesEngaged: number;
  nudgesTotal: number;
  safetyScore: number | null;
  scoreDelta: number;
  focusBehavior: string;
  insight: string;
  mirrorReady: boolean;
}) {
  await sgMail.send({
    to,
    from: { email: "nudge@catalyst.coach", name: "Catalyst" },
    subject: `Your Catalyst Brief — Week ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1B2A4A;">
        <h2 style="color: #1B2A4A;">Hi ${data.name},</h2>
        <p>This week's snapshot:</p>
        <ul>
          <li>You engaged with ${data.nudgesEngaged}/${data.nudgesTotal} nudges</li>
          ${data.safetyScore ? `<li>Team safety pulse: ${data.safetyScore} (${data.scoreDelta >= 0 ? "+" : ""}${data.scoreDelta})</li>` : ""}
          <li>Focus: "${data.focusBehavior}"</li>
        </ul>
        <p style="background: #fdf6ef; border-left: 4px solid #E8913A; padding: 12px 16px; border-radius: 0 8px 8px 0;">
          ${data.insight}
        </p>
        ${data.mirrorReady ? '<p><a href="https://app.catalyst.coach/mirror" style="color: #E8913A;">Your Mirror Moment is ready &rarr;</a></p>' : ""}
        <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 24px 0;" />
        <p style="font-size: 12px; color: #8a8580;">
          <a href="https://app.catalyst.coach/settings" style="color: #8a8580;">Adjust your settings</a> &middot;
          <a href="https://app.catalyst.coach/settings/pause" style="color: #8a8580;">Pause nudges</a>
        </p>
      </div>
    `,
  });
}
```

**Step 2: Write Zoom webhook handler**

Create `apps/api/src/integrations/zoom.ts`:

```typescript
import { personalizeNudge } from "../services/claude";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { MICRO_BEHAVIORS } from "@catalyst/shared";

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
  // Use Claude to analyze the summary for psychological safety signals
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
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
```

**Step 3: Write webhook routes**

Create `apps/api/src/routes/webhooks.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { processZoomMeetingSummary } from "../integrations/zoom";
import { nudgeQueue } from "../jobs/queue";
import { db, schema } from "../db";
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
```

**Step 4: Commit**

```bash
git add apps/api/src/integrations/ apps/api/src/routes/webhooks.ts
git commit -m "feat: add email digest, Zoom AI Companion webhook, and calendar integration"
```

---

## Phase 7: Landing Page / Marketing Web

### Task 15: Build a web landing page

**Files:**
- Create: `apps/web/` (Next.js or simple Vite React app)

**Note:** This is a separate web app for the marketing/landing page. Use Vite + React + Tailwind for simplicity. It showcases the Perception Gap reveal, product features, pricing, and a waitlist signup form.

Key sections:
1. Hero with animated Perception Gap bars
2. "How it works" — 3 steps (Assess, Nudge, Cascade)
3. Feature highlights (Dials, Mirror Moments, Zoom integration)
4. Social proof stats (230% ROI, 27% turnover reduction, etc.)
5. Pricing ($50-150/leader/month)
6. Waitlist CTA

Use the Catalyst brand colors and Inter font.

**Step 1: Scaffold the web app**

```bash
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm install tailwindcss @tailwindcss/vite
```

**Step 2: Build the landing page components and sections**

**Step 3: Commit**

```bash
git add apps/web/
git commit -m "feat: add marketing landing page with perception gap reveal and waitlist"
```

---

## Phase 8: Testing & Polish

### Task 16: API tests

**Files:**
- Create: `apps/api/src/__tests__/onboarding.test.ts`
- Create: `apps/api/src/__tests__/nudges.test.ts`
- Create: `apps/api/src/__tests__/settings.test.ts`

Write Vitest tests for each API route. Test:
- Onboarding flow (SCARF submission, focus selection, channel connection)
- Nudge response handling (tried → streak up, skipped → auto-dial-down after 3)
- Settings updates (dials, pause)
- Pulse survey creation and anonymous aggregation (min 3 responses)
- Privacy: users can only access their own data

### Task 17: Mobile app smoke tests

**Files:**
- Create: `apps/mobile/__tests__/`

Write basic component tests with React Native Testing Library:
- Onboarding flow renders correctly
- SCARF slider updates state
- Behavior card selection works
- Dashboard displays data from store

### Task 18: End-to-end flow verification

Manually verify the full flow:
1. Start API server and database
2. Open mobile app → complete onboarding
3. Verify SCARF profile saved in DB
4. Trigger a nudge via API
5. Verify nudge appears in app
6. Respond to nudge → verify streak updates
7. Send a Slack nudge → verify button response works
8. Create pulse survey → submit 3 responses → verify aggregation

---

## Build Order Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Monorepo scaffold + shared types/data |
| 2 | 3-4 | Database schema + Fastify server |
| 3 | 5-7 | Core API routes (auth, onboarding, dashboard, nudges, pulse, cascade) |
| 4 | 8-9 | Nudge engine (Claude personalization + BullMQ scheduling) |
| 5 | 10-12 | React Native app screens (onboarding + main tabs) |
| 6 | 13-14 | Bot integrations (Slack, Email, Zoom, Calendar webhooks) |
| 7 | 15 | Marketing landing page |
| 8 | 16-18 | Testing and end-to-end verification |

**Estimated commits:** 18 incremental commits across 8 phases.

Each phase is independently testable — Phase 2 produces a running API, Phase 5 produces a navigable app, Phase 6 connects the channels.
