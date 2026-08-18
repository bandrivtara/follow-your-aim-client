# Architecture

Last verified: 2026-08-18 on FYA-17-create-chart-analytics.

## Runtime outline

The runtime path is:

1. src/index.tsx creates the React root.
2. Redux Provider supplies the store from src/store/store.ts.
3. Ant Design ConfigProvider supplies Ukrainian locale.
4. App supplies MUI Dayjs localization.
5. HashRouter mounts AppLayout and the feature routes.
6. Screens call generated RTK Query hooks.
7. Service queryFn implementations call the Firestore SDK directly.

The application is a client-only Create React App deployment. HashRouter supports the GitHub Pages homepage configured in package.json.

## State and data access

- src/store/store.ts configures one RTK Query reducer and middleware.
- src/store/api/index.ts initializes Firebase and defines a shared createApi instance with fakeBaseQuery.
- src/store/services/\*.ts inject Firestore-backed queries and mutations.
- RTK Query tags cache server-derived data. Most view and form state remains local React state.
- There is no separate application backend or client authentication flow in the checked-in source.
- Some calculation helpers bypass RTK Query and read Firestore directly, notably aim progress and shared history lookup.

Typical flow: screen/component -> generated query or mutation hook -> service queryFn -> Firestore SDK -> RTK Query cache/error state.

## Feature domains

- Main: current-day plan-performance dashboard, weekly chart that can exceed 100% for completed work outside the plan, complexity-weighted weekly life balance by habit area, activity streak, active aims, planned timed habits, quick entry to today's tracker, review navigation, and water counter.
- Calendar tracker: current day/week/month navigation plus planning and completion history for habits and task groups. The selected period can be downloaded as a Markdown report with nested todo items and an AI-analysis prompt.
- Scheduler: read-only day/week/month projection of timed habit history entries, with fallback to the current habit schedule for legacy history. Persistent editing remains in the tracker.
- Aims: CRUD, categories, calendar spans, and progress from direct values, measured habits, or task-group stages.
- Habits: CRUD, routine/time categories, independent life-area metadata, complexity, measures, schedules, and relationships.
- Task groups: reusable task store, optional stages/subtasks, and per-day todo instances in tracker history.
- Reviews: five-question daily reflection with mood/energy and optional browser dictation; saving requires all five answers and atomically completes the configured daily-review habit in tracker history. The weekly summary combines tracker facts and reflections. A separate next-week planning export adds four-week context, active aims, unfinished work, future planned activities, and the Weekly Planning Protocol v1 prompt. The Codex helper page explains the safe read-only → dry-run → confirmed apply workflow and provides copyable prompts without reading or writing Firebase itself.
- Life spheres are no longer exposed in navigation, routes, forms, lists, or calendars. Legacy sphere documents, optional sphereId fields, and inert compatibility code remain untouched so existing Firebase data is not migrated or deleted.
- English: vocabulary groups, words, and word tests.

## UI composition

Ant Design supplies navigation/forms, MUI supplies widgets/drawers/charts, AG Grid powers tracker and aim calendars, DevExpress powers the scheduler, and styled-components plus global CSS provide styling. Avoid adding another UI system.

On screens up to 768px, the main workflow uses a fixed bottom navigation: Today, Tracker, Daily Review, Weekly Review, and More. The More action opens the complete application menu. The tracker opens its day view from mobile navigation and uses a full-width editor drawer.

## Local Codex bridge

The repository includes a local command API in `scripts/fya-codex-bridge.cjs`; it is not an HTTP server or a second application backend. It can export raw context read-only and validate a narrow `fya-plan-v1` document. Planning updates are dry-run by default and can only merge allowed plan fields into existing activity IDs under `history/{YYYY-MM}` after an explicit `--apply`. Big 3 stays in the conversation and is not persisted.

## Boundaries

- src/components/: screens and feature-specific presentation/interaction.
- src/store/services/: Firestore operations exposed through RTK Query.
- src/types/: domain interfaces; these are not always a complete runtime schema.
- src/share/: cross-feature helpers, hooks, forms, and direct Firebase helpers.
- src/config/: navigation and stable application configuration.

Before cross-boundary refactoring, inspect all imports and Firestore readers/writers. Prefer extracting pure calculations before changing data access.
