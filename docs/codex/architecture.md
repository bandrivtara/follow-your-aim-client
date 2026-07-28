# Architecture

Last verified: 2026-07-28 on FYA-17-create-chart-analytics at commit 8e8a061.

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

- Main: dashboard and water counter.
- Calendar tracker: planning and completion history for habits and task groups.
- Scheduler: calendar projection of timed habit history entries, with fallback to the current habit schedule for legacy history; appointment edits are currently local UI state.
- Aims: CRUD, categories, life spheres, calendar spans, and progress from direct values, measured habits, or task-group stages.
- Habits: CRUD, categories, measures, schedules, and relationships.
- Task groups: reusable task store, optional stages/subtasks, and per-day todo instances in tracker history.
- Spheres: life-area records whose related habits and aims are derived from child sphereId fields.
- English: vocabulary groups, words, and word tests.

## UI composition

Ant Design supplies navigation/forms, MUI supplies widgets/drawers/charts, AG Grid powers tracker and aim calendars, DevExpress powers the scheduler, and styled-components plus global CSS provide styling. Avoid adding another UI system.

## Boundaries

- src/components/: screens and feature-specific presentation/interaction.
- src/store/services/: Firestore operations exposed through RTK Query.
- src/types/: domain interfaces; these are not always a complete runtime schema.
- src/share/: cross-feature helpers, hooks, forms, and direct Firebase helpers.
- src/config/: navigation and stable application configuration.

Before cross-boundary refactoring, inspect all imports and Firestore readers/writers. Prefer extracting pure calculations before changing data access.
