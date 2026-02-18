# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Catalyst is an AI-powered psychological safety coaching platform for executive leaders. It delivers personalized micro-behavior nudges through Slack, Teams, Zoom, email, and mobile — using the SCARF neuroscience model and Edmondson's 7-item psychological safety scale.

## Monorepo Structure

npm workspaces with four packages:

- **apps/api** — Fastify 5 backend (ESM, Drizzle ORM, PostgreSQL, Redis/BullMQ, Claude API)
- **apps/web** — React 19 + Vite + Tailwind marketing landing page
- **apps/mobile** — Expo 54 + React Native + NativeWind + Zustand
- **packages/shared** — Types, constants, micro-behaviors data (no runtime deps)

## Commands

### Development
```bash
npm run api          # tsx watch apps/api/src/server.ts (hot reload)
npm run mobile       # expo start
npm run shared:build # tsc on shared package
cd apps/web && npm run dev   # vite dev server
```

### Testing
```bash
npx vitest run                              # all 189 tests (API + shared)
npx vitest run apps/api                     # API tests only
npx vitest run packages/shared              # shared package tests only
npx vitest run apps/api/src/__tests__/scenarios/onboarding.test.ts  # single file
npx vitest run -t "Step 3"                  # by test name pattern
```

### Build & Type Check
```bash
cd packages/shared && npx tsc --noEmit   # type check shared
cd apps/web && npm run build             # vite build (tsc -b + vite)
cd apps/web && npm run lint              # eslint (web only)
```

### Database
```bash
cd apps/api && npm run db:push      # drizzle-kit push (apply schema)
cd apps/api && npm run db:generate  # generate migrations
cd apps/api && npm run db:studio    # drizzle studio GUI
```

## Architecture

### API Route Pattern

All routes are Fastify plugins registered in `apps/api/src/server.ts` with dynamic imports:

```typescript
await app.register(import("./routes/auth.js"), { prefix: "/api/auth" });
```

Each route file exports a default async function receiving `FastifyInstance`. Auth-protected routes use `{ preHandler: [authenticate] }`. Request bodies validated with Zod's `.parse()` — ZodErrors are caught by the global error handler and returned as 400.

### Database (Drizzle ORM)

Schema at `apps/api/src/db/schema.ts` — 8 enums, 9 tables. Connection at `apps/api/src/db/index.ts` exports `db` and `schema`. All queries use Drizzle's query builder or relational API (`db.query.users.findFirst()`).

### Nudge Engine

`apps/api/src/services/nudge-engine.ts` is the core business logic. It runs 7 safeguard checks before generating a nudge (onboarded, not paused, quiet hours, weekends, daily limit, consecutive skips, active behavior). Then routes to a channel and calls Claude for personalization.

### Edmondson Scoring

Pulse surveys use a 7-item scale where items at indices [0, 2, 4] are reverse-scored (`8 - score` on a 1-7 Likert scale). The `aggregateScores()` function in `apps/api/src/routes/pulse.ts` handles this. Anonymity threshold requires 3+ responses before results are visible.

### Anti-Overwhelm System

Three dials: Frequency (gentle/steady/immersive), Depth (essentials/informed/deep_dive), Channels (toggleable). After 3 consecutive skips, the system auto-dials to gentle and resets the skip counter. Users can pause for 1 week / 2 weeks / 1 month.

## Testing

### Mock DB Infrastructure

`apps/api/src/__tests__/helpers/mock-db.ts` provides a full in-memory Drizzle ORM mock. Tests use:
- `resetStore()` — clear all data between tests
- `seedStore(tableName, id, data)` — populate test data
- `setFindFirstResolver(table, fn)` — control what `db.query.*.findFirst()` returns
- `setSelectFilter(table, fn)` — filter rows for select queries
- `setUpdateFilter(table, fn)` — control which rows get updated

`apps/api/src/__tests__/helpers/setup.ts` exports `buildApp()` (creates Fastify with all routes) and `generateToken(app, { id, email })`.

### Test Organization

- **Scenarios** (`apps/api/src/__tests__/scenarios/`) — 5 integration tests covering full user journeys: onboarding, nudge engagement, pulse surveys, settings, cascade
- **Unit tests** (`apps/api/src/__tests__/nudge-engine.test.ts`) — safeguard checks, channel routing
- **Shared tests** (`packages/shared/src/__tests__/`) — micro-behavior data integrity, constants, scoring

## Key Conventions

- **ESM everywhere**: All packages use `"type": "module"`. Local imports require `.js` extensions even for `.ts` files.
- **Inlined constants**: `nudge-engine.ts`, `pulse.ts`, and `library.ts` inline constants and micro-behaviors from the shared package to avoid cross-package build issues during testing. Keep these in sync with `packages/shared/src/`.
- **Path alias**: API tsconfig maps `@shared/*` → `../../packages/shared/src/*`.
- **Zod 4**: Uses zod ^4.3.6. UUIDs must be RFC 4122 compliant (version digit 1-8, variant 89ab). In tests, use UUIDs like `a0a0a0a0-b1b1-4cc2-9d3d-e4e4e4e4e4e4`.
- **JWT_SECRET required**: Server throws at startup if `JWT_SECRET` env var is missing. Tests use a hardcoded test secret in `setup.ts`.
- **Vitest mock hoisting**: Use `vi.hoisted()` when mock functions are referenced inside `vi.mock()` factories to avoid undefined references from hoisting.
