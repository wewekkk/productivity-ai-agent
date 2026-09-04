# Quest Agent — Gamified Adaptive Productivity AI Agent

**You set the goal. The Agent manages the quest.** Quest Agent is a one-day MVP that turns a natural-language goal into an adaptive plan, calendar actions, and a lightweight boss battle.

## Why this is an Agent

It maintains quest state and runs a visible decision loop:

`Goal → Understand → Classify → Plan → Act (calendar) → Observe → Re-plan → Act again`

It is deliberately not a static chatbot. When a planned task is missed, it evaluates unfinished work, remaining time, and buffer; moves/merges the next work session; updates the calendar abstraction; lowers risk status; and presents a **Recovery Quest** / **Boss Enraged** state.

## Architecture

- `lib/agent.ts` — typed Zod task router, deterministic planner, monitor, and replanner.
- `lib/calendar.ts` — `CalendarService` boundary with an honest `MockCalendarService` and Google Calendar REST adapter.
- `lib/types.ts` — persisted quest, schedule, boss, subtask, and activity state.
- `app/page.tsx` — UI and browser-local persistence (`localStorage`).

## API-ready integration framework

The demo deliberately keeps providers behind contracts, so an integration does
not need to rewrite the UI or the agent loop.

- `CalendarService` in `lib/calendar.ts`: implement `create` and `update`.
  `MockCalendarService` is the default; `GoogleCalendarService` is ready for a
  server-side OAuth access token.
- `AiAgentProvider` in `lib/agent-contracts.ts`: implement `classify`,
  `createPlan`, and `replan` with structured `RouterSchema` output. This is the
  seam for OpenAI, Anthropic, or an internal API.

The user flow is intentionally gated:

`Goal -> plan preview -> user confirmation -> calendar adapter -> session report (start / partial / stuck / not started / complete) -> recovery plan`

Calendar adapters must only be invoked after confirmation. The demo uses a
deterministic planner while no provider is connected, so it remains testable
without secrets.

The MVP uses a reliable rule-based router/planner so its demo works without an API key. `RouterSchema` ensures structured classifier output. The service boundary makes an LLM router/planner swap-in straightforward; do not expose chain-of-thought—only concise activity summaries are displayed.

## Game system

- Fixed Event → calendar only, no monster.
- Simple Task → one small monster (100 HP).
- Complex Quest → 100 HP boss; every subtask deals predetermined damage.
- Early completion → Critical Hit + bonus XP; normal completion → Normal Hit.
- Missed work → Boss Enraged, recovery schedule, and DANGER/CRITICAL risk calculation.
- 0 HP → Boss Defeated, XP, and a cosmetic chest reward.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Check quality with:

```bash
npm run lint
npm run build
```

## Demo flow

1. Submit `Lunch tomorrow at 12:00.` — it routes as **Fixed Event** and creates a Demo Calendar event only.
2. Submit `Finish my exchange CV before September 7. I'm tired today, so don't schedule more than 30 minutes tonight.` — it creates a CV boss, four scheduled subtasks, a safe finish, buffer, and activity log.
3. Press **Didn't finish** on a planned session — the Agent creates a Recovery Quest and marks the boss enraged.
4. Press **Complete** for scheduled work — HP falls and XP rises. Finish all work to unlock a chest.

## Calendar and environment

Without credentials, the product visibly labels events as **Demo Calendar**. It never claims those mock events reached Google.

Copy `.env.example` to `.env.local` and fill the Google OAuth values to use `GoogleCalendarService` from a server-side OAuth callback. The adapter supports `create` and `update`; an OAuth route/token store is intentionally left to the deployer because refresh tokens must never be exposed to the browser or committed. `.env*` is ignored by Git.

Variables:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`
- `OPENAI_API_KEY` (reserved for an optional model-backed planner)

## Limitations

This is intentionally a one-day MVP: it persists locally per browser, has one active quest screen, uses deterministic planning for predictable demos, and defaults to a mock calendar. A production version would add authenticated server-side OAuth, encrypted persistence, real availability reads, timezone-aware availability optimization, and an evaluated structured LLM planner.
