# Architecture

Last verified: 2026-08-28 on Fixes-to-Main-Release.

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

- Main: current-day plan-performance dashboard, a mobile daily agenda combining planned habits with concrete task-list items in a touch-scrollable unfinished-plan list, focus carried from yesterday's review, a "never miss twice" recovery cue, quick voice/text task capture with optional time/category into an existing flat task group, copy-yesterday/copy-same-weekday/manual plan setup, inline completion for boolean/measured habits and task items, a resumable local focus timer for minute-based measured habits that commits actual minutes through the existing history path, calculated active-aim progress in a touch-scrollable list (including the configured planner-consistency aim for days strictly above 50% plan completion), review status, context-aware empty states, three insight cards: weekly rhythm split into planned progress and unplanned bonus (future/no-plan days have no percentage), today's planned versus recorded minutes per minute-based habit, and weekly mood/energy from daily reviews, activity streak, a current-month completed-office-day count against the six-day minimum, full JSON backup download, and separate manual water and steps cards.
- Calendar tracker: current day/week/month navigation plus planning and completion history for habits and task groups. The selected period can be downloaded as a Markdown report with nested todo items and an AI-analysis prompt.
- The former standalone scheduler is no longer active. Its old route redirects to the dashboard; time fields remain part of habits/history and feed the daily agenda and tracker ordering.
- Aims: CRUD, categories, calendar spans, and progress from direct values, measured habits, or task-group stages.
- Habits: CRUD, routine/time categories, independent life-area metadata, complexity, measures, schedules, and relationships.
- Task groups: reusable task store, optional stages/subtasks, and per-day todo instances in tracker history.
- Reviews: the daily reflection keeps mood/energy and provides a copyable ChatGPT interview prompt; one compact pasted summary completes the configured daily-review habit, while legacy reviews with five separate answers remain readable and complete. The “Ранковий компас” flow reuses the former “5 цілей і 5 подяк” habit ID and history, stores the pasted result as an optional activity-history note, and completes that habit only after saving. Tracker and weekly exports include these text records. A separate next-week planning export adds four-week context, active aims, unfinished work, future planned activities, and the Weekly Planning Protocol v1 prompt. The Codex helper page explains the safe read-only → dry-run → confirmed apply workflow and provides copyable prompts without reading or writing Firebase itself.
- Career: a read-only career compass for the current React Tech Lead → AI-native Engineering Lead plan. It combines a fixed 12-month roadmap and evidence-based skill map with existing active aims matched by career category or keywords. Course progress uses a matching aim when available and otherwise shows the explicitly documented starting estimate; it introduces no Firestore collection or write path.
- Life spheres are no longer exposed in navigation, routes, forms, lists, or calendars. Legacy sphere documents, optional sphereId fields, and inert compatibility code remain untouched so existing Firebase data is not migrated or deleted.
- English: vocabulary groups, words, and word tests. A local read-only prestart/prebuild script reads the separate private `english-learning` repository and publishes only its aggregate active/mastered vocabulary count into a generated snapshot for the matching aim.

## UI composition

Ant Design supplies navigation/forms, MUI supplies widgets/drawers/charts, AG Grid powers tracker and aim calendars, and styled-components plus global CSS provide styling. The shared palette and component tokens live in `src/config/uiTheme.ts`; global layout, focus, scrollbar, and AG Grid defaults live in `src/globalStyles.css`. Avoid adding another UI system.

On screens up to 1199px, `useIsCompactLayout` selects a header, fixed bottom navigation (Today, Tracker, Daily Review, Weekly Review, More), and a drawer for the complete menu. This includes both iPad A16 orientations (820×1180 / 1180×820 CSS pixels), without remounting forms on rotation. The separate `useIsMobile` threshold stays at 768px: phones open the daily tracker and use a full-width editor, while tablets keep week/month navigation and a viewport-mounted editor up to 560px wide. Desktop keeps its sidebar. Dashboard cards use two columns on intermediate widths, a full-width agenda in tablet portrait, and a single column at 700px or less. Safe-area insets and dynamic viewport heights accommodate tablet/browser chrome; touch-specific control sizing does not depend on user-agent detection.

The production build registers a small app-shell service worker and ships an installable Ukrainian PWA manifest. This caches the application shell, not Firestore data; registration checks for updates on load, and a newly activated worker reloads the open client once so deployed UI text does not remain stale. The global network/save indicator warns users not to close the app while offline.

## Local Codex bridge

The repository includes a local command API in `scripts/fya-codex-bridge.cjs`; it is not an HTTP server or a second application backend. It can export raw context read-only and validate a narrow `fya-plan-v1` document. Planning updates are dry-run by default and can only merge allowed plan fields into existing activity IDs under `history/{YYYY-MM}` after an explicit `--apply`. Big 3 stays in the conversation and is not persisted.

## Boundaries

- src/components/: screens and feature-specific presentation/interaction.
- src/store/services/: Firestore operations exposed through RTK Query.
- src/types/: domain interfaces; these are not always a complete runtime schema.
- src/share/: cross-feature helpers, hooks, forms, and direct Firebase helpers.
- src/config/: navigation and stable application configuration.

Before cross-boundary refactoring, inspect all imports and Firestore readers/writers. Prefer extracting pure calculations before changing data access.
