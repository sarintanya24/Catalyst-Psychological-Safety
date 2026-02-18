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
