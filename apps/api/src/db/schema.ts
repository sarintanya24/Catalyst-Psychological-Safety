import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  jsonb,
  boolean,
  integer,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================

export const nudgeFrequencyEnum = pgEnum("nudge_frequency", [
  "gentle",
  "steady",
  "immersive",
]);

export const insightDepthEnum = pgEnum("insight_depth", [
  "essentials",
  "informed",
  "deep_dive",
]);

export const channelEnum = pgEnum("channel", [
  "slack",
  "teams",
  "zoom_meeting",
  "zoom_post",
  "email",
  "push",
  "in_app",
]);

export const nudgeTriggerEnum = pgEnum("nudge_trigger", [
  "pre_meeting",
  "post_meeting",
  "post_decision",
  "weekly",
  "monday",
  "contextual",
]);

export const nudgeResponseEnum = pgEnum("nudge_response", [
  "tried",
  "skipped",
  "later",
  "reflection",
]);

export const surveyTypeEnum = pgEnum("survey_type", [
  "baseline",
  "monthly",
  "mirror_moment",
]);

export const cascadeStatusEnum = pgEnum("cascade_status", [
  "invited",
  "onboarded",
  "active",
]);

export const safetyStageEnum = pgEnum("safety_stage", ["1", "2", "3", "4"]);

// ============================================================
// Tables
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  scarfProfile: jsonb("scarf_profile"),
  currentStage: safetyStageEnum("current_stage").notNull().default("1"),
  activeMicroBehaviorId: varchar("active_micro_behavior_id", { length: 255 }),
  dialFrequency: nudgeFrequencyEnum("dial_frequency").notNull().default("steady"),
  dialDepth: insightDepthEnum("dial_depth").notNull().default("informed"),
  channels: jsonb("channels").default({}),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default("08:00"),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default("19:00"),
  weekendsOff: boolean("weekends_off").default(true),
  cohortId: uuid("cohort_id"),
  streakCount: integer("streak_count").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  consecutiveSkips: integer("consecutive_skips").default(0).notNull(),
  onboardedAt: timestamp("onboarded_at"),
  pausedUntil: timestamp("paused_until"),
  slackUserId: varchar("slack_user_id", { length: 255 }),
  teamsUserId: varchar("teams_user_id", { length: 255 }),
  zoomUserId: varchar("zoom_user_id", { length: 255 }),
  calendarToken: text("calendar_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  leaderId: uuid("leader_id")
    .notNull()
    .references(() => users.id),
  cascadeStatus: cascadeStatusEnum("cascade_status").notNull().default("invited"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nudges = pgTable("nudges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  microBehaviorId: varchar("micro_behavior_id", { length: 255 }).notNull(),
  channel: channelEnum("channel").notNull(),
  trigger: nudgeTriggerEnum("trigger").notNull(),
  content: jsonb("content").notNull(),
  meetingContext: jsonb("meeting_context"),
  deliveredAt: timestamp("delivered_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  response: nudgeResponseEnum("response"),
  reflectionText: text("reflection_text"),
});

export const pulseSurveys = pgTable("pulse_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  leaderId: uuid("leader_id")
    .notNull()
    .references(() => users.id),
  surveyType: surveyTypeEnum("survey_type").notNull(),
  aggregateScore: real("aggregate_score"),
  domainScores: jsonb("domain_scores"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const pulseResponses = pgTable("pulse_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id")
    .notNull()
    .references(() => pulseSurveys.id),
  scores: jsonb("scores").notNull(), // array of 7 numbers
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const mirrorMoments = pgTable("mirror_moments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  pulseSurveyId: uuid("pulse_survey_id")
    .notNull()
    .references(() => pulseSurveys.id),
  selfAssessment: jsonb("self_assessment").notNull(),
  teamPerception: jsonb("team_perception").notNull(),
  gaps: jsonb("gaps").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cascadeEvents = pgTable("cascade_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  leaderId: uuid("leader_id")
    .notNull()
    .references(() => users.id),
  reportId: uuid("report_id")
    .notNull()
    .references(() => teamMembers.id),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const peerCohorts = pgTable("peer_cohorts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nextSession: timestamp("next_session"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingAnalyses = pgTable("meeting_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  meetingId: varchar("meeting_id", { length: 255 }).notNull(),
  signals: jsonb("signals").notNull(),
  leaderAirtimePct: real("leader_airtime_pct"),
  quietMembers: jsonb("quiet_members"),
  nudgeId: uuid("nudge_id").references(() => nudges.id),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});
