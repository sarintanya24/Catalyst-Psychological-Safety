# Catalyst — Product Design Document

**Date:** 2026-02-18
**Status:** Draft for approval
**Product:** Catalyst — AI-Powered Psychological Safety Platform for Executive Leaders

---

## Table of Contents

1. [The Core Problem](#1-the-core-problem)
2. [Why This Approach](#2-why-this-approach)
3. [The Invisible Coaching Philosophy](#3-the-invisible-coaching-philosophy)
4. [Key Benefits](#4-key-benefits)
5. [The Dial System: Intensity Controls](#5-the-dial-system-intensity-controls)
6. [Product Architecture](#6-product-architecture)
7. [User Journey](#7-user-journey)
8. [App Screens](#8-app-screens)
9. [Bot Interactions](#9-bot-interactions)
10. [Zoom AI Companion Integration](#10-zoom-ai-companion-integration)
11. [Data Architecture](#11-data-architecture)
12. [Backend & API Design](#12-backend--api-design)
13. [Visual Design Direction](#13-visual-design-direction)
14. [Privacy Architecture](#14-privacy-architecture)
15. [Tech Stack](#15-tech-stack)
16. [Risks & Mitigations](#16-risks--mitigations)

---

## 1. The Core Problem

### The Perception Gap

87% of executives report positive perceptions of psychological safety at work, compared to just 69% of individual contributors (Perceptyx, 2025 Benchmark). On risk-taking specifically, only 53% of individual contributors feel safe taking risks, versus 76% of executives (Wiley Survey). This perception gap is the most dangerous blind spot in modern leadership — because leaders genuinely believe their teams feel safe, while their teams are silently withholding ideas, hiding mistakes, and avoiding risk.

### Why This Gap Exists

Executives operate at the top of the power hierarchy. People naturally filter what they share upward. The higher a leader rises, the less unfiltered truth they hear — and the more they assume silence means agreement. This isn't a character flaw. It's a structural reality of organizational power dynamics that neuroscience confirms: the brain's threat detection system (amygdala) is constantly scanning for social danger, and speaking truth to power triggers the same neural circuits as physical threat (Lieberman, 2013).

### The Cost of Inaction

- **$8.8 trillion** in lost productivity globally from disengagement (Gallup)
- **Boeing**: 346 deaths and $58B in debt from a culture where engineers were afraid to raise safety concerns
- **Wells Fargo**: $3B+ in fines from a culture where branch workers couldn't push back on fraudulent sales practices
- **Nokia**: Lost $143B in market cap because middle managers were too afraid to tell leadership that their strategy was failing

### Why Training Doesn't Work

The traditional approach — send leaders to a 2-day workshop on psychological safety — fails for three reasons:

1. **The forgetting curve**: People forget 70% of training content within 24 hours and 90% within a week (Ebbinghaus). A workshop creates awareness but not behavior change.
2. **Context collapse**: Skills learned in a workshop room don't transfer to the pressure of a real meeting with real stakes. The moment an executive is stressed, tired, or under time pressure, they revert to default behaviors.
3. **No feedback loop**: A workshop gives you knowledge but no mirror. Leaders have no way to see whether their behavior is actually changing how their team experiences them.

The research is unambiguous: **sustained behavior change requires repeated, contextual, small interventions over time** — not one-time knowledge transfer. This is the scientific basis for Catalyst's approach.

---

## 2. Why This Approach

### The Science Behind Nudging Leaders

Catalyst is built on the convergence of five research streams, each of which independently points to the same conclusion: **the most effective way to change executive behavior is through tiny, contextual prompts delivered in the flow of work.**

#### 2.1 Behavioral Economics: Nudge Theory (Thaler & Sunstein)

People don't make decisions rationally — they follow defaults, respond to social proof, and are influenced by how choices are framed. Nudges work by making the desired behavior the path of least resistance. For executives, this means: don't ask them to learn a new system. Instead, put the right prompt in front of them at the right moment in a tool they already use.

**Why this matters for Catalyst:** We don't ask executives to change their behavior. We help them do what they already do — run meetings, have 1:1s, make decisions — with one micro-adjustment that takes 5-60 seconds.

#### 2.2 Neuroscience: SCARF Model (David Rock)

The brain processes social threats (to Status, Certainty, Autonomy, Relatedness, Fairness) using the same circuits as physical threats. A single threatened SCARF domain can collapse a team member's ability to think creatively, collaborate, or speak up. Leaders unknowingly trigger these threat responses dozens of times a day through tone, word choice, and meeting dynamics.

**Why this matters for Catalyst:** We don't teach executives a model. We surface the specific moment they triggered a threat response (or could have created a reward response) and give them one concrete alternative. Over time, their neural pathways rewire through repetition, not instruction.

#### 2.3 Habit Science: Tiny Habits (BJ Fogg) + Atomic Habits (James Clear)

Behavior change doesn't come from motivation — it comes from making the behavior tiny enough that it requires no willpower, and anchoring it to an existing routine. Fogg's research shows the optimal structure is: **Existing Habit + Tiny New Behavior + Immediate Reinforcement**.

**Why this matters for Catalyst:** Every nudge is anchored to something the executive is already doing (a meeting, a 1:1, a decision). The behavior takes 5-60 seconds. The reinforcement is immediate (a team score improvement, a streak counter, a peer benchmark). We never ask leaders to add a new habit — we enhance an existing one.

#### 2.4 Learning Science: AGES Model (NeuroLeadership Institute)

Lasting learning requires four conditions: **Attention** (the content grabs focus), **Generation** (the learner creates their own meaning), **Emotion** (the content evokes feeling), and **Spacing** (repeated exposure over time, not cramming). Traditional training nails Attention but fails on Generation, Emotion, and Spacing.

**Why this matters for Catalyst:** Nudges are spaced across weeks and months (Spacing). They ask reflective questions, not give instructions (Generation). They surface real team data that creates an emotional response (Emotion). They arrive at the moment of highest relevance — right before a meeting or right after a decision (Attention). Catalyst is the AGES model operationalized.

#### 2.5 Psychological Safety Research: Edmondson + Clark + Humu/Perceptyx

Amy Edmondson's research proves psychological safety is the #1 predictor of team performance (Google's Project Aristotle, 180+ teams). Timothy Clark's 4 Stages provide the developmental pathway. Humu/Perceptyx proved that nudges delivered in workflow tools produce 8-12 point improvements in manager effectiveness scores within 12 weeks.

**Why this matters for Catalyst:** We're not inventing a new theory. We're operationalizing 30 years of validated research into a delivery mechanism that actually changes behavior. The research exists. The frameworks exist. The measurement tools exist. What's missing is the **bridge between knowing and doing** — and that bridge is Catalyst.

### Why No Product Does This Today

The research identified 10 critical market gaps. The three most significant:

1. **No integrated measure-coach-cascade platform exists.** Current tools either measure (Culture Amp, Perceptyx) OR coach (BetterUp, CoachHub) OR nudge (Humu). None close the full loop: measure the gap → coach the leader → nudge the behavior → re-measure the impact → cascade to the team.
2. **No product is designed for C-suite executives.** Every coaching platform is manager-focused. Executives have fundamentally different constraints (less time, higher stakes, more visibility, stronger ego-protective instincts) and need a fundamentally different approach.
3. **The cascade mechanism doesn't exist.** Even if you change one leader's behavior, there's no mechanism to propagate that change to their direct reports and through the organization. Culture change requires cascade — and no product enables it.

Catalyst fills all three gaps.

---

## 3. The Invisible Coaching Philosophy

### The #1 Design Principle: Don't Add to the To-Do List

Executives are the most time-constrained people in any organization. They run from meeting to meeting, manage stakeholders in every direction, and carry the weight of decisions that affect hundreds or thousands of people. The absolute worst thing Catalyst can do is feel like another obligation.

**Catalyst's core promise: We don't add to what you do. We help you do what you already do, better.**

This means:

- **No new meetings** — Catalyst embeds into meetings you already have
- **No required reading** — Nudges are 15-30 words, one sentence
- **No homework** — Responding to a nudge takes one tap
- **No login required for value** — The bot brings value to you in Slack/Teams/Zoom/Email
- **No guilt** — Missing a nudge has zero consequence. No streaks that shame. No "you missed 3 days!" alerts
- **No jargon** — No "SCARF domains" or "psychological safety frameworks" in the UI. Just plain, human language

### The Right Moment, Not More Moments

The power of Catalyst isn't volume — it's timing. A generic reminder to "ask more questions" on a random Tuesday morning is noise. The same suggestion arriving 15 minutes before a 1:1 with an underperforming team member — with context about that person's recent silence in meetings — is transformative.

Catalyst's value is **contextual relevance**:

- **Pre-meeting**: "You have a 1:1 with James. He hasn't spoken up in the last 3 team meetings. Try opening with: 'What's something you've been thinking about that we haven't discussed?'"
- **Post-meeting**: Zoom AI Companion detected you spoke for 72% of the all-hands. "In your next meeting, try asking 'What are we missing?' and waiting 7 seconds."
- **Post-decision**: "You just made a big call on the product roadmap. One question: did anyone disagree? If not, that's the signal to watch."

Each of these takes 10 seconds to read and 5 seconds to act on. The executive doesn't learn a framework — they get a single, specific thing to do in a moment that already exists in their day.

### The Stimulus Threshold: Less Is Always More

The research on executive attention is clear: **the moment something feels overwhelming, they disengage completely.** Unlike managers who might push through a learning program because it's required, executives have the authority to simply stop using anything that doesn't earn its place in their day.

This creates a hard design constraint:

| Principle | Implementation |
|---|---|
| **Earn every interaction** | Every nudge must feel valuable on its own. If it feels generic, it's a failure |
| **One thing at a time** | Never present two behaviors, two insights, or two actions simultaneously |
| **Silence is respect** | If there's nothing contextually relevant to say, say nothing. No "check-in" nudges for the sake of engagement |
| **Gradual deepening** | Start with 1 nudge/week. Only increase if the executive engages. Never push |
| **Easy exit, easy return** | Pausing for a week should feel natural, not like failure. Re-engaging should be seamless |
| **Zero cognitive load** | The nudge should be understood in under 3 seconds. If it requires thinking to parse, it's too complex |

### How Catalyst Differs from Everything Else

| Aspect | Traditional Coaching | Generic AI Coaching | Catalyst |
|---|---|---|---|
| **Time required** | 1-2 hrs/month | 15-30 min/week | 30 seconds/day, in existing workflow |
| **Context** | Scheduled sessions, decontextualized | Chat-based, generic prompts | Triggered by real meetings, real data |
| **Behavior change** | Knowledge transfer | Conversation-based | Micro-behavior at point of action |
| **Feedback loop** | Quarterly 360 reviews | Self-reported | Live team pulse + meeting analysis |
| **Feels like** | Another obligation | Another app | A smarter version of your existing tools |
| **Cognitive load** | High (remember and apply) | Medium (engage in conversation) | Near-zero (one sentence, one action) |
| **Cost** | $500-1,500/hr | $50-200/month | $50-150/month |

---

## 4. Key Benefits

### For the Executive

1. **Close the blind spot** — See the gap between how you think your team feels and how they actually feel, with real data, not guesswork
2. **Become a better leader in the moments that matter** — Not through abstract training, but through a specific prompt right before a specific meeting with a specific person
3. **Compound returns** — Each micro-behavior practiced 2-3 times per week rewires neural pathways within 6-8 weeks. The behavior becomes automatic, not effortful
4. **Peer benchmarking without exposure** — See how you compare to other executives in your cohort without anyone seeing your data
5. **Legacy and reputation** — Teams with high psychological safety have 230% ROI. Leaders who build this culture are the ones people want to work for
6. **AI-era imperative** — 83% of leaders say psychological safety directly impacts AI initiative success. In the age of disruption, the leaders whose teams can speak freely will out-adapt everyone else

### For the Team

1. **Actually being heard** — When their leader starts asking genuine questions and waiting for answers, team members notice within 2-3 weeks
2. **Permission to take risks** — Teams with psychologically safe leaders show 31% more innovation and 50% higher productivity
3. **Retention** — Psychologically safe teams have 27% less turnover. For underrepresented groups (BIPOC, LGBTQ+, women), the effect is 4-6x stronger
4. **Cascade effect** — When the executive models safety, their direct reports learn by observation and begin replicating those behaviors with their own teams. Culture propagates downward

### For the Organization

1. **230% ROI** on every dollar invested in psychological safety (Niagara Institute)
2. **Reduced risk** — Boeing, Nokia, Wells Fargo: the cost of cultures where people can't speak up runs into billions
3. **Innovation velocity** — Google's Project Aristotle proved psychological safety is the #1 factor distinguishing high-performing teams from average ones
4. **Talent magnet** — In a market where top talent has options, culture is the differentiator. "My leader actually listens" is the most powerful retention tool
5. **AI transformation readiness** — Organizations undertaking AI transformation need teams that can surface concerns, challenge assumptions, and experiment without fear

---

## 5. The Dial System: Intensity Controls

### Why Dials Exist

Executives are not a monolith. A first-time CEO in a 50-person startup has different bandwidth than a Fortune 500 EVP running 3,000 people. A leader in a crisis quarter has different capacity than one in a stable growth period. And the same leader's bandwidth changes week to week.

Catalyst must adapt to the leader's reality — not the other way around.

### The Three Dials

#### Dial 1: Nudge Frequency

| Setting | Cadence | Best For |
|---|---|---|
| **Gentle** (default for new users) | 1 nudge/week + weekly email digest | Leaders who are skeptical, overwhelmed, or just starting. Lowest possible commitment. Proves value before asking for more |
| **Steady** | 2-3 nudges/week, contextually triggered | Leaders who are engaged and seeing early results. This is the sweet spot the research recommends |
| **Immersive** | Daily nudges + real-time meeting companion | Leaders who are fully committed and want maximum growth. Usually Stage 3-4 users |

**Auto-adjustment**: If a leader ignores 3 nudges in a row, Catalyst automatically dials down to Gentle and sends a simple message: "We've quieted things down. Tap here whenever you're ready for more." No guilt. No "you've been inactive" shaming.

**Re-engagement**: After a quiet period, Catalyst doesn't flood — it sends a single, high-relevance nudge tied to a specific upcoming meeting. If the leader engages, frequency gradually returns to their previous setting.

#### Dial 2: Depth of Insight

| Setting | What You See | Best For |
|---|---|---|
| **Essentials** | One-line nudge + one-tap response. No data, no context. Just the behavior prompt | Leaders who want zero cognitive load. "Just tell me one thing to do" |
| **Informed** (default) | Nudge + brief context (why this matters, tied to your SCARF profile or meeting context) + one-tap response | The balance point. Enough context to be compelling, not enough to be a reading assignment |
| **Deep Dive** | Nudge + full context + team data + neuroscience basis + peer benchmarks. Plus Mirror Moments and progress analytics | Leaders who are data-driven and want to understand the "why" behind every recommendation |

Leaders can switch between these at any time. The app remembers the last setting. A leader might use "Essentials" during a busy quarter and switch to "Deep Dive" during a calmer period.

#### Dial 3: Channel Mix

Leaders choose where they want to be reached, and can change this at any time:

| Channel | Toggle | Notes |
|---|---|---|
| **Slack/Teams** | On/Off | Best for quick Q&A nudges. Highest response rate |
| **Zoom (In-Meeting Sidebar)** | On/Off | Real-time coaching. Only visible to the leader. Can be paused mid-meeting |
| **Zoom (Post-Meeting)** | On/Off | Contextual nudge based on AI Companion meeting summary |
| **Email** | On/Off | Weekly digest format. Lowest friction, lowest engagement |
| **Mobile Push** | On/Off | For nudges timed to calendar events |
| **In-App Only** | On/Off | Nudges only appear when the leader opens Catalyst. Zero interruption |

### The Anti-Overwhelm Safeguards

These are hard-coded into the system and cannot be overridden:

1. **Maximum 1 nudge per day** — Even on "Immersive," the system will never send more than 1 bot nudge per day (the in-meeting sidebar is separate since the leader actively opens it)
2. **Quiet hours** — No nudges before 8am or after 7pm in the leader's timezone. No weekends unless explicitly enabled
3. **Meeting density detection** — If the leader has back-to-back meetings for 4+ hours, Catalyst goes silent. They're already overwhelmed
4. **Cool-down after skip** — If a leader taps "Skip" on a nudge, the next nudge is delayed by 48 hours minimum
5. **Onboarding ramp** — Week 1 has exactly 1 nudge. Week 2 has 2. Only reaches full cadence by Week 4, and only if the leader is engaging
6. **Seasonal awareness** — Quarter-end, board prep, earnings week: Catalyst detects calendar density spikes and automatically reduces to Gentle
7. **The "Pause Everything" button** — One tap in the app pauses all nudges for 1 week, 2 weeks, or 1 month. No questions asked. When the pause ends, it resumes at Gentle regardless of previous setting

### What "Dialed Down" Feels Like

At minimum settings, Catalyst is nearly invisible:
- **1 email per week** — a brief Leadership Intelligence Brief with one insight and one suggestion
- **Zero bot messages** — no Slack, no Teams, no Zoom
- **Zero push notifications**
- **The app is there when you want it** — dashboard, progress, Mirror Moments — but it never comes to you

This is the floor. It's enough to maintain awareness without any interruption. A leader at this setting might spend 30 seconds per week with Catalyst — and that's fine.

### What "Dialed Up" Feels Like

At maximum settings, Catalyst is an active coaching companion:
- **1 contextual nudge per day** via preferred bot channel
- **Real-time in-meeting sidebar** during Zoom calls
- **Post-meeting insight** based on AI Companion analysis
- **Weekly email digest** with deeper analytics
- **Monthly Mirror Moment** with full SCARF gap analysis
- **Peer cohort sessions** (monthly, 60 min with 4-6 peers)

Even at maximum, the daily time investment is under 5 minutes. The system is designed so that the leader who does the most still does very little — the product does the work of surfacing the right moment and the right micro-action. The leader's only job is to notice and try.

---

## 6. Product Architecture

### Approach: Unified App + Webhook Bots

The React Native app is the primary experience — onboarding, assessment, dashboard, nudge library, progress tracking, cascade view. The bots (Slack, Teams, Zoom, Email) are lightweight delivery mechanisms that push nudge questions and capture responses, syncing back to the app.

```
                    ┌─────────────────┐
                    │   Claude API    │
                    │  (Personalize)  │
                    └────────┬────────┘
                             │
┌──────────┐    ┌────────────┴────────────┐    ┌──────────────┐
│  React   │◄──►│     Backend API          │◄──►│  PostgreSQL  │
│  Native  │    │  (Node.js / Fastify)     │    │  + Redis     │
│   App    │    └──┬───┬───┬───┬───┬──────┘    └──────────────┘
└──────────┘       │   │   │   │   │
                   │   │   │   │   │
              ┌────┘   │   │   │   └────┐
              ▼        ▼   ▼   ▼        ▼
           ┌─────┐ ┌─────┐┌──────┐ ┌───────┐
           │Slack│ │Teams││ Zoom │ │ Email │
           │ Bot │ │ Bot ││ App  │ │(SMTP) │
           └─────┘ └─────┘│+RTMS │ └───────┘
                          └──────┘
```

**Why this architecture:**
- The app is the brain — rich experience for leaders who want depth
- The bots are the hands — lightweight, fast, zero-friction nudge delivery
- Shared backend ensures one source of truth — a nudge response in Slack shows up in the app dashboard instantly
- Each channel adapter is independent — can add new channels (WhatsApp, SMS) without touching core logic

---

## 7. User Journey

The user journey maps to Timothy Clark's 4 Stages of Psychological Safety, but the leader never sees framework jargon — they experience a natural progression that feels intuitive.

### Onboarding (Week 1) — "Show Me My Blind Spot"

The onboarding is designed to create a single emotional moment: **the realization that your team's experience might be very different from what you assume.** This isn't guilt — it's curiosity. The framing is: "This is what almost every leader discovers. You're not behind. You're starting."

1. **Welcome** — 30 seconds. Animated perception gap reveal. No lengthy explainer
2. **Quick Assessment** — 3 minutes. Five sliders (one per SCARF domain). Feels like a personality quiz, not a test
3. **Baseline Team Pulse** — Edmondson's 7-item survey sent to direct reports. Takes them 2 minutes. Results in 48-72 hours
4. **Choose Your First Focus** — Pick 1 of 5 micro-behaviors from a card deck. Each shows the behavior, an example, and "5-60 seconds per practice"
5. **Connect Your Channels** — Toggle on Slack, Teams, Zoom, Email, Calendar. OAuth flow. 1 minute

**Total onboarding time: Under 8 minutes.**

After onboarding, Catalyst goes quiet until the baseline pulse results come in. No bombardment. The first real nudge arrives 2-3 days later, timed to the leader's first relevant meeting.

### Stage 1: Foundation (Weeks 2-6) — "Try One Small Thing"

- 1-3 nudges per week (based on Dial 1 setting)
- Single micro-behavior focus for the full period
- Nudges are tied to specific upcoming meetings
- Weekly email digest: one insight, one stat, one encouragement
- **Week 4 — First Mirror Moment**: "Here's how your team responded to the pulse. Here's your biggest opportunity." This is the moment most leaders go from curious to committed

### Stage 2: Building (Weeks 7-12) — "See the Impact"

- Stack a second micro-behavior (leader chooses)
- Peer cohort unlocked (optional — 4-6 executives, monthly, 60 min)
- Nudges begin incorporating meeting context (Zoom AI Companion data if connected)
- Mid-point team re-survey — shows movement from baseline
- Scenario-based nudges: "You're about to deliver difficult feedback to your team about Q2 results. Here's how high-safety leaders frame bad news..."

### Stage 3: Expanding (Months 4-6) — "Bring Others In"

- Cascade mode: invite direct reports to start their own Catalyst journey
- Team-level nudges begin (not just the executive, but their leaders too)
- Organization dashboard unlocks — see safety scores across the cascade tree
- Nudge frequency can dial down naturally — many behaviors are now becoming automatic

### Stage 4: Leading (Months 7-12+) — "Shape the Culture"

- Reduced to 1-2 nudges/week — maintenance mode
- Mentor role: anonymized insights from your journey shared with new leaders (with permission)
- Organization-wide culture metrics and trend analysis
- New leader auto-enrollment when they join the executive's org
- Legacy framing: "Your organization's safety score has improved 18 points since you started. Here's the ripple effect."

---

## 8. App Screens

### 8.1 Onboarding — Perception Gap Reveal

```
┌─────────────────────────────────────┐
│                                     │
│           [Catalyst logo]           │
│                                     │
│     "How safe does your team        │
│      feel to speak up?"             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  YOU         ███████████ 87%│   │
│   │  YOUR TEAM   █████████░ 53% │   │
│   └─────────────────────────────┘   │
│                                     │
│   The gap between how leaders       │
│   and teams experience safety is    │
│   the #1 blind spot in leadership.  │
│                                     │
│        [ Close the gap -> ]         │
│                                     │
└─────────────────────────────────────┘
```

### 8.2 SCARF Quick Assessment

```
┌─────────────────────────────────────┐
│ ← Assessment              2 of 5   │
│─────────────────────────────────────│
│                                     │
│         RELATEDNESS                 │
│                                     │
│   "How connected do you feel        │
│    to your team on a personal       │
│    level — beyond work tasks?"      │
│                                     │
│   Rarely ──────●────────── Deeply   │
│                    7.2              │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│             [ Next -> ]             │
│                                     │
└─────────────────────────────────────┘
```

### 8.3 Choose Your Focus

```
┌─────────────────────────────────────┐
│ ← Pick one to start                │
│─────────────────────────────────────│
│                                     │
│  "Which feels most natural to       │
│   try this week?"                   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Ask a genuine question      │    │
│  │  before stating your view    │    │
│  │                     ~10 sec  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Name your own fallibility   │    │
│  │  "I may be wrong about..."   │    │
│  │                      ~5 sec  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Thank someone for raising   │    │
│  │  a concern or disagreeing    │    │
│  │                     ~10 sec  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│    Respond with "Help me           │
│  │ understand" not "How did     │    │
│    this happen?"           ~5 sec  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│    Wait 5-7 seconds after          │
│  │ asking a question            │    │
│                            ~7 sec  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                     │
└─────────────────────────────────────┘
```

### 8.4 Home Dashboard

```
┌─────────────────────────────────────┐
│  Good morning, Sarah         ⚙  ·· │
│─────────────────────────────────────│
│                                     │
│   ┌──────────┐  Stage 2: Building  │
│   │   ╭───╮  │  Team Safety: 76    │
│   │   │76 │  │  +4 from baseline   │
│   │   ╰───╯  │                     │
│   └──────────┘  12-day streak      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  TODAY'S PRACTICE            │   │
│   │                              │   │
│   │  "Ask a genuine question     │   │
│   │   before stating your view"  │   │
│   │                              │   │
│   │  1:1 with James in 45 min   │   │
│   │                              │   │
│   │  Try: "What's your biggest   │   │
│   │  concern about this project?"│   │
│   │                              │   │
│   │  [ I did this ] [ Remind me ]│   │
│   └─────────────────────────────┘   │
│                                     │
│   UPCOMING                          │
│   ├ 1:1 James · 45 min · nudge ◉  │
│   ├ All-hands · 3 hrs · nudge ◉   │
│   └ Mirror Moment · Friday         │
│                                     │
│  ─── ─── ─── ─── ─── ─── ─── ───  │
│  Home    Mirror   Cascade  Library  │
│   ◉                                │
└─────────────────────────────────────┘
```

### 8.5 Mirror Moment

```
┌─────────────────────────────────────┐
│ ← Mirror Moment         March 2026 │
│─────────────────────────────────────│
│                                     │
│   YOUR VIEW     vs    TEAM'S VIEW   │
│                                     │
│       ╱╲                  ╱╲        │
│     ╱ S  ╲              ╱ S  ╲      │
│   ╱  8.2  ╲           ╱  6.1  ╲    │
│  F ── 7.5 ── C      F ── 8.4 ── C  │
│   ╲  7.8  ╱           ╲  5.3  ╱    │
│     ╲ R  ╱              ╲ R  ╱      │
│       ╲╱                  ╲╱        │
│     (You)              (Team)       │
│                                     │
│   BIGGEST OPPORTUNITY               │
│   ┌─────────────────────────────┐   │
│   │  Relatedness: -2.5 gap      │   │
│   │                              │   │
│   │  Your team wants more        │   │
│   │  personal connection.        │   │
│   │                              │   │
│   │  Try this week:              │   │
│   │  "Check in on the person,    │   │
│   │   not the project."          │   │
│   │                              │   │
│   │  [ Add to my practice -> ]   │   │
│   └─────────────────────────────┘   │
│                                     │
│   PROGRESS SINCE BASELINE           │
│   Safety: 68 -> 76 (+8)            │
│   Biggest win: Autonomy (+3.1)     │
│                                     │
└─────────────────────────────────────┘
```

### 8.6 Cascade View

```
┌─────────────────────────────────────┐
│ ← Cascade View         Your Org    │
│─────────────────────────────────────│
│                                     │
│            ┌──────┐                 │
│            │ You  │                 │
│            │  76  │                 │
│            └──┬───┘                 │
│       ┌───────┼───────┐            │
│    ┌──┴──┐ ┌──┴──┐ ┌──┴──┐        │
│    │James│ │Maya │ │Ravi │        │
│    │ 72  │ │ 81  │ │ 68  │        │
│    └──┬──┘ └──┬──┘ └──┬──┘        │
│    ┌──┴──┐ ┌──┴──┐ ┌──┴──┐       │
│    │12ppl│ │8 ppl│ │15ppl│       │
│    │ 74  │ │ 79  │ │ 61  │       │
│    └─────┘ └─────┘ └─────┘       │
│                                     │
│   ORG AVERAGE: 71  (+6 since Jan)  │
│   TEAMS AT RISK: 2 (Ravi's org)   │
│                                     │
│   [ Invite direct reports -> ]      │
│                                     │
└─────────────────────────────────────┘
```

### 8.7 Nudge Library

```
┌─────────────────────────────────────┐
│ ← Nudge Library        10 practices│
│─────────────────────────────────────│
│                                     │
│  TIER 1 — Start Here (5-10 sec)    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 1. Ask before you state      │    │
│  │    SCARF: Status, Autonomy   │    │
│  │    ◉ Active · 18 practices   │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 2. Name your fallibility     │    │
│  │    SCARF: Status, Fairness   │    │
│  │    ○ Available                │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 3. Thank the dissenter       │    │
│  │    SCARF: Status, Relatedness│    │
│  │    ○ Available                │    │
│  └─────────────────────────────┘    │
│                                     │
│  TIER 2 — Deepen (15-60 sec)       │
│  ┌─────────────────────────────┐    │
│  │ 6. "What are we missing?"    │    │
│  │    Unlocks at Stage 2         │    │
│  └─────────────────────────────┘    │
│    ...                              │
│                                     │
│  ─── ─── ─── ─── ─── ─── ─── ───  │
│  Home    Mirror   Cascade  Library  │
│                              ◉     │
└─────────────────────────────────────┘
```

### 8.8 Settings — The Dials

```
┌─────────────────────────────────────┐
│ ← Settings                         │
│─────────────────────────────────────│
│                                     │
│  NUDGE FREQUENCY                    │
│  ○ Gentle (1/week)                  │
│  ◉ Steady (2-3/week)               │
│  ○ Immersive (daily)                │
│                                     │
│  INSIGHT DEPTH                      │
│  ○ Essentials (one line)            │
│  ◉ Informed (with context)          │
│  ○ Deep Dive (full data)            │
│                                     │
│  CHANNELS                           │
│  Slack           [====ON====]       │
│  Teams           [===OFF====]       │
│  Zoom Meeting    [====ON====]       │
│  Zoom Post-Mtg   [====ON====]       │
│  Email Digest    [====ON====]       │
│  Mobile Push     [===OFF====]       │
│                                     │
│  QUIET HOURS                        │
│  No nudges before [8:00 AM]         │
│  No nudges after  [7:00 PM]         │
│  Weekends         [===OFF====]      │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   ⏸  Pause everything       │    │
│  │   1 week · 2 weeks · 1 month│    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## 9. Bot Interactions

All bot interactions follow a **Question -> Response -> Reinforcement** loop. They are designed to feel like a thoughtful colleague, not a system.

### Tone Rules

- **Peer-level, never instructional**: "High-performing leaders often..." not "You should try..."
- **Curious, never judgmental**: "Here's an interesting pattern..." not "You're not doing this enough"
- **Brief, always**: Maximum 3 lines for a nudge. If it needs a scroll, it's too long
- **Actionable**: Every nudge ends with a specific thing to try and a simple response mechanism

### Pre-Meeting Nudge (15 min before 1:1)

```
Catalyst

You have a 1:1 with James in 15 minutes.

Today's micro-practice:
"Ask a genuine question before stating your view."

Try this: "What's on your mind that we haven't talked about?"

[Tried it]  [Skip]  [Later]
```

### Weekly Reflection (Monday morning)

```
Catalyst — Weekly Check-in

Last week you practiced "naming your fallibility" 3 times.
Your team's comfort-with-risk score moved up 2 points.

This week's question:
"When was the last time someone openly disagreed with you?
What made that possible — or not?"

[Share a thought]  [Just reflecting]
```

### Post-Decision Nudge (2 hrs after a big meeting)

```
Catalyst

You just wrapped a strategy session with 8 attendees.

Quick thought:
"Did everyone contribute, or did 2-3 voices dominate?"

Next time, try: "What are we missing?" before the final call.

[I'll try this]  [Already do this]
```

### Post-Meeting Contextual Nudge (Zoom AI Companion)

```
Catalyst — Meeting Insight

Your product review just ended. Based on the meeting summary:
- You spoke for 68% of the meeting
- 3 team members didn't contribute
- Maya raised a timeline concern that wasn't addressed

One thing to try in your next meeting:
"I'd love to hear from everyone — [Name], what's your take?"

[Helpful]  [Not relevant]
```

### Email Weekly Digest

```
Subject: Your Catalyst Brief — Week 4

Hi Sarah,

This week:
  You engaged with 3 of 3 nudges
  Team safety pulse: 74 -> 76 (+2)
  Focus: "Wait 5-7 seconds after asking"

Insight: Leaders who pause 5+ seconds after a question get
2x more responses from quieter team members.

Your Mirror Moment is ready — your team's feedback is in.

[Open Catalyst]
```

### Zoom In-Meeting Sidebar (Real-Time)

```
┌──────────────────┐
│ Catalyst     ◉ ON│
│──────────────────│
│                  │
│  MEETING PULSE   │
│  Good            │
│                  │
│  YOUR AIRTIME    │
│  ██████████ 68%  │
│  Try bringing    │
│  others in       │
│                  │
│  QUIET VOICES    │
│  · Alex (0 min)  │
│  · Priya (1 min) │
│                  │
│ ─────────────── │
│  Maya made a     │
│  point about     │
│  timeline risk   │
│  that wasn't     │
│  acknowledged    │
│                  │
│  Try a 5-second  │
│  pause after     │
│  your next       │
│  question        │
│──────────────────│
│  [Pause nudges]  │
└──────────────────┘
```

---

## 10. Zoom AI Companion Integration

### Capability 1: Post-Meeting Contextual Nudges

**How it works:**
1. Meeting ends -> Zoom fires `meeting.summary_completed` webhook
2. Catalyst receives the AI Companion summary via Zoom REST API
3. An LLM (Claude) analyzes the summary for 7 psychological safety signals:
   - Participation distribution (who spoke, who was silent)
   - Question-to-statement ratio (leader asking vs. telling)
   - Dissent presence (did anyone disagree? was it acknowledged?)
   - Idea attribution (were contributions credited?)
   - Response to concerns (were worries addressed or dismissed?)
   - Silence after questions (did the leader wait for responses?)
   - Topic dominance (did one person control the agenda?)
4. A personalized post-meeting nudge is generated and delivered within 2 hours
5. Over time, the system tracks patterns: "In your last 4 team meetings, participation has been concentrated among 3 of 8 members"

**Privacy**: The leader opts in to Zoom integration. Only the leader sees the analysis. Raw transcripts are never stored — only the safety signal analysis is retained. Team members are never identified by name in stored data, only in real-time nudges that are ephemeral.

### Capability 2: Real-Time In-Meeting Coaching

**How it works:**
1. Leader launches the Catalyst Zoom App before or during a meeting
2. A sidebar appears visible ONLY to the leader
3. Zoom RTMS (Real-Time Media Streams) sends live transcript segments via WebSocket
4. Catalyst analyzes in real-time for 6 signals:
   - Airtime dominance (leader speaking >60% of the time)
   - Question drought (no questions asked in 10+ minutes)
   - Interruptions detected
   - Unacknowledged contributions
   - Silence avoidance (leader fills every pause)
   - Monologue detection (speaking >3 minutes uninterrupted)
5. Ambient, non-distracting nudges appear in the sidebar — color shifts, single-line prompts
6. The leader can pause or dismiss nudges at any time

**Design principles for in-meeting nudges:**
- **Ambient, not interruptive**: A subtle color change or single line of text. Never a popup, never a sound
- **Glanceable**: The leader should be able to check the sidebar with a 1-second glance. If it takes longer to parse, it's too complex
- **Actionable in the moment**: "Pause after your next question" is actionable. "Consider improving your question ratio" is not
- **Pausable**: One tap to silence for the rest of the meeting. No penalty

---

## 11. Data Architecture

### Core Data Model

```
USER (Executive Leader)
├── id, name, email, org_id
├── scarf_profile: {status, certainty, autonomy, relatedness, fairness}
├── current_stage: 1-4
├── active_micro_behavior: FK -> micro_behavior
├── dial_frequency: gentle | steady | immersive
├── dial_depth: essentials | informed | deep_dive
├── channels: {slack, teams, zoom_meeting, zoom_post, email, push}
├── quiet_hours: {start, end, weekends}
├── cohort_id: FK -> peer_cohort
├── streak_count, longest_streak
└── onboarded_at, paused_until

TEAM_MEMBER
├── id, name, email, leader_id (FK -> User)
├── safety_scores: [] (anonymous pulse history)
└── cascade_status: invited | onboarded | active

MICRO_BEHAVIOR
├── id, name, tier (1|2), rank (1-10)
├── description, example_scripts: []
├── scarf_domains: [], time_seconds: 5-60
└── category: question | vulnerability | acknowledgment | space_making

NUDGE
├── id, user_id, micro_behavior_id
├── channel: slack | teams | zoom_sidebar | zoom_post | email | push | in_app
├── trigger: pre_meeting | post_meeting | post_decision | weekly | contextual
├── content: {question, context, options}
├── meeting_context: {} (from Zoom AI Companion, if available)
├── delivered_at, responded_at
├── response: tried | skipped | later | reflection_text
└── dial_depth_at_delivery: essentials | informed | deep_dive

PULSE_SURVEY
├── id, team_id, leader_id
├── survey_type: baseline | monthly | mirror_moment
├── responses: [{member_id, q1_q7_scores}] (anonymous)
├── aggregate_score, domain_scores: {}
└── created_at

MIRROR_MOMENT
├── id, user_id, pulse_survey_id
├── self_assessment: {scarf_scores, behavior_frequency}
├── team_perception: {aggregate_pulse, themes}
├── gaps: [{domain, self_score, team_score, delta}]
└── recommendations: [{micro_behavior_id, reason}]

CASCADE_EVENT
├── id, leader_id, report_id
├── event_type: invited | onboarded | nudge_forwarded | milestone
└── created_at

PEER_COHORT
├── id, name, members: [user_ids] (4-6)
├── next_session, session_history: []
└── shared_benchmarks: {} (anonymized)

MEETING_ANALYSIS (from Zoom AI Companion)
├── id, user_id, meeting_id
├── signals: {participation, questions, dissent, attribution, concerns, silence, dominance}
├── leader_airtime_pct, quiet_members: []
├── nudge_generated: FK -> nudge
└── analyzed_at
```

### Key Data Flows

```
1. NUDGE DELIVERY PIPELINE
   Schedule Engine -> Check calendar/context -> Select micro-behavior
   -> Personalize via Claude API (SCARF profile + stage + history + meeting context)
   -> Deliver via channel adapter -> Capture response
   -> Update streak/progress -> Feed into next nudge selection

2. MEASUREMENT LOOP
   Pulse Survey (monthly) -> Anonymous aggregation (min 3 respondents)
   -> Compare to baseline -> Generate Mirror Moment -> Surface gaps
   -> Recommend micro-behaviors -> Adjust nudge strategy -> Next pulse

3. CASCADE PROPAGATION
   Executive completes Stage 2 -> Unlock cascade -> Invite direct reports
   -> Reports get tailored onboarding -> Their teams get pulse surveys
   -> Cascade View updates with org-wide safety heatmap

4. ZOOM CONTEXT PIPELINE
   Meeting ends -> Zoom webhook fires -> AI Companion summary retrieved
   -> Claude analyzes for 7 safety signals -> Contextual nudge generated
   -> Delivered within 2 hours via preferred channel

5. REAL-TIME MEETING PIPELINE
   Leader opens Zoom sidebar -> RTMS WebSocket connects
   -> Live transcript segments analyzed -> 6-signal detection engine
   -> Ambient nudges rendered in sidebar -> Post-meeting summary generated

6. AUTO-ADJUSTMENT PIPELINE
   3 consecutive skips detected -> Auto-dial to Gentle
   -> Send "We've quieted things down" message
   -> Wait for re-engagement -> Gradually restore previous cadence
```

---

## 12. Backend & API Design

```
RUNTIME: Node.js + Fastify
DATABASE: PostgreSQL (relational) + Redis (scheduling, caching, rate limiting)
AUTH: OAuth 2.0 (Slack, Teams, Zoom, Google Calendar)
AI: Claude API (nudge personalization, meeting analysis)
PUSH: APNs + FCM (mobile push)
QUEUE: BullMQ on Redis (async job processing)
EMAIL: SendGrid / AWS SES

API ROUTES:
POST   /api/auth/slack          OAuth callback
POST   /api/auth/teams          OAuth callback
POST   /api/auth/zoom           OAuth callback
POST   /api/auth/google         OAuth callback (calendar)

GET    /api/onboarding/status   Where the user is in onboarding
POST   /api/onboarding/scarf    Submit SCARF assessment
POST   /api/onboarding/focus    Select first micro-behavior
POST   /api/onboarding/channels Connect channels

GET    /api/dashboard            Home dashboard data
GET    /api/dashboard/upcoming   Calendar-aware upcoming meetings

GET    /api/nudges               Nudge history
POST   /api/nudges/:id/respond   Record response (tried/skipped/later/reflection)
PUT    /api/nudges/settings      Update dials (frequency, depth, channels)

POST   /api/pulse/create         Create a new pulse survey
POST   /api/pulse/respond        Team member submits anonymous response
GET    /api/pulse/results/:id    Aggregated results (min 3 responses)

GET    /api/mirror/latest        Latest mirror moment
GET    /api/mirror/history       All mirror moments

GET    /api/cascade              Cascade tree view
POST   /api/cascade/invite       Invite a direct report
GET    /api/cascade/org-stats    Organization-wide stats

GET    /api/library              All micro-behaviors
GET    /api/library/:id          Single behavior with details

GET    /api/cohort               Peer cohort info
GET    /api/cohort/benchmarks    Anonymized peer benchmarks

POST   /api/webhooks/slack       Slack interaction payloads
POST   /api/webhooks/teams       Teams adaptive card responses
POST   /api/webhooks/zoom        Zoom events + AI Companion data
POST   /api/webhooks/calendar    Meeting start/end triggers

GET    /api/settings             User settings (dials, quiet hours, pause)
PUT    /api/settings             Update settings
POST   /api/settings/pause       Pause all nudges

WEBHOOK HANDLERS:
POST   /webhooks/zoom/meeting.ended       Trigger post-meeting analysis
POST   /webhooks/zoom/summary.completed   Fetch AI Companion summary
POST   /webhooks/zoom/rtms                Real-time transcript stream (WebSocket upgrade)

CRON JOBS (via BullMQ):
- Every day 8am local:       Monday weekly reflections
- Every 15 min:              Calendar scan -> queue pre-meeting nudges
- On meeting end webhook:    Queue post-meeting nudge (2hr delay)
- Weekly:                    Check pulse survey due dates
- Monthly:                   Generate Mirror Moments
- Continuous:                Auto-adjustment checks (skip detection, density detection)
```

---

## 13. Visual Design Direction

### Brand: Catalyst

| Element | Value | Rationale |
|---|---|---|
| Primary | `#1B2A4A` (Deep navy) | Executive gravitas, trust, authority |
| Accent | `#E8913A` (Warm amber) | Catalyst = spark. Energy without aggression |
| Success | `#4A9E7D` (Sage green) | Growth, safety, positive movement |
| Alert | `#E07A6B` (Soft coral) | Attention without alarm. Never red |
| Background | `#F8F7F4` (Warm off-white) | Warm, calm, not clinical |
| Surface | `#FFFFFF` | Clean cards with subtle shadows |
| Headline Font | Inter Bold | Clean, modern, executive-appropriate |
| Body Font | Inter Regular | Readable at small sizes |
| Data Font | SF Mono | Dashboard numbers, metrics |

### Design Principles

1. **Executive-grade**: Think Bloomberg Terminal meets Calm app. No gamification, no cartoons, no confetti. Sophisticated, warm, data-rich
2. **Insight, not judgment**: Every data visualization framed as "opportunity" not "deficiency." Colors are soft (sage, amber), never harsh (red, black warning)
3. **Radically minimal**: One primary action per screen. White space is a feature. If the screen feels busy, remove elements
4. **Warm authority**: The app should feel like a trusted advisor — confident but not cold, data-driven but human
5. **Glanceable**: Any screen should be understood in under 5 seconds. Dashboards use large numbers, clear trends, and minimal text

---

## 14. Privacy Architecture

This is non-negotiable. Executive coaching data is the most sensitive data in any organization. A single breach or misuse would destroy trust permanently.

### Core Privacy Principles

| Principle | Implementation |
|---|---|
| **Executive data sovereignty** | Individual nudge responses, reflections, SCARF profiles, and Mirror Moment data are NEVER visible to anyone else — not HR, not their manager, not admins, not Catalyst staff |
| **Anonymous pulse surveys** | Leaders see aggregated team scores only. Minimum 3 respondents required for results to display. No individual responses ever revealed |
| **Meeting analysis is ephemeral** | Zoom transcript data is processed in real-time and discarded. Only the safety signal analysis (aggregated, anonymized) is retained. Raw transcripts are never stored |
| **Zero cross-account leakage** | Multi-tenant architecture with strict row-level security. No data from one organization can leak to another |
| **Right to delete** | Executives can delete all their data at any time, immediately and completely. No "soft delete" — actual data destruction |
| **No surveillance** | Catalyst coaches the leader. It does NOT report to the organization. No admin dashboard shows individual leader data. This is a coaching tool, not a surveillance tool |
| **Encryption** | Data at rest: AES-256. Data in transit: TLS 1.3. SCARF profiles and pulse responses encrypted with per-user keys |
| **Compliance** | GDPR, CCPA, SOC 2 Type II, EU AI Act compliant by design |

---

## 15. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Mobile App | React Native + Expo | Cross-platform (iOS + Android), fast iteration, good for the card-based UI patterns |
| Styling | Tailwind (via NativeWind) | Consistent design system, rapid prototyping, matches the minimal aesthetic |
| Navigation | React Navigation | Standard for React Native, handles the tab-based + stack navigation pattern |
| State | Zustand | Lightweight, minimal boilerplate, good for the relatively simple state model |
| Backend | Node.js + Fastify | Fast, TypeScript-native, good WebSocket support (for Zoom RTMS) |
| Database | PostgreSQL | Relational data model fits naturally, row-level security for privacy |
| Cache/Queue | Redis + BullMQ | Nudge scheduling, rate limiting, job processing |
| AI | Claude API (Anthropic) | Nudge personalization, meeting summary analysis, contextual content generation |
| Auth | OAuth 2.0 | Slack, Teams, Zoom, Google Calendar integrations |
| Email | SendGrid | Reliable delivery for weekly digests and pulse survey invitations |
| Push | Expo Push + APNs/FCM | Mobile push notifications for calendar-triggered nudges |
| Hosting | Vercel (API) + AWS (DB, Redis) | Or Railway/Render for simpler deployment during MVP |
| Monitoring | Sentry + PostHog | Error tracking + product analytics (privacy-respecting) |

---

## 16. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Executives disengage after Week 1** | High | Critical | The Dial System. Default to Gentle. Auto-reduce on skips. First Mirror Moment at Week 4 is the hook — design for that moment |
| **"This feels like surveillance"** | Medium | Critical | Privacy architecture. Coaching framing, not monitoring. Executive data sovereignty. No admin visibility into individual data |
| **Nudges feel generic** | Medium | High | Claude API personalization using SCARF profile + meeting context + behavior history. Zoom AI Companion for real contextual relevance |
| **Team members don't respond to pulse surveys** | Medium | High | Surveys are 2 minutes (7 items). Anonymous. Sent via the channel they already use. Reminder after 48 hours. Minimum 3 responses to display |
| **Zoom RTMS approval delay** | High | Medium | Phase the rollout. Post-meeting nudges (Capability 1) require only standard Zoom API access. Real-time sidebar (Capability 2) requires RTMS and Marketplace approval (4-6 weeks). Ship Capability 1 first |
| **Executive ego resistance** | Medium | High | Never frame as remediation. "Close the gap" not "fix your behavior." Peer benchmarking normalizes growth. Social proof: "73% of executives in your cohort are practicing..." |
| **Feature creep** | High | Medium | The design document is the scope. The Dial System means we can launch with Gentle + Essentials as default and only build deeper features as engagement warrants |

---

## Summary

Catalyst is an AI-powered coaching platform that helps executive leaders build psychologically safe teams through personalized micro-behavior nudges delivered in the flow of work. It combines a React Native app (assessment, dashboard, progress, cascade) with lightweight bot integrations (Slack, Teams, Zoom, Email) that deliver contextual coaching as simple questions and responses.

The core philosophy is **invisible coaching** — Catalyst never adds to a leader's to-do list. It helps them do what they already do (run meetings, have 1:1s, make decisions) with one small adjustment at the right moment. Everything is controlled by three dials (frequency, depth, channels) that the leader adjusts to fit their bandwidth. The system automatically dials down when a leader is overwhelmed and gently re-engages when they're ready.

Built on 30 years of validated research (Edmondson, Rock, Clark, Fogg, Thaler) and grounded in neuroscience (SCARF model), Catalyst fills the critical gap between knowing about psychological safety and actually building it — one 5-second behavior at a time.
