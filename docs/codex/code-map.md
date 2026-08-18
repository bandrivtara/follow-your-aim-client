# Code map

Last verified: 2026-08-18.

| Concern                 | Primary location                                 | Related locations                                                           |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Application entry       | src/index.tsx, src/App.tsx                       | src/globalStyles.css                                                        |
| Routes                  | src/components/Routes.tsx                        | src/config/routes.ts, src/components/Layout/useMenuItems.tsx                |
| Redux and Firebase base | src/store/store.ts                               | src/store/api/index.ts                                                      |
| Firestore services      | src/store/services/                              | src/types/, src/share/fireBase/                                             |
| Main dashboard          | src/components/Main/Main.tsx                     | dashboardCalculations.ts, WaterCounter/, history, habits, and aims services |
| Life-area definitions   | src/config/lifeAreas.ts                          | habit form/list, dashboard calculations                                     |
| Daily/weekly reviews    | src/components/Review/                            | dailyReviews service, tracker export, dashboard calculations                |
| Codex helper page       | src/components/Review/CodexGuide/                 | ready prompts, weekly protocols, local bridge safety flow                    |
| Weekly planning export  | src/components/Review/WeeklyReview/weeklyPlanningExport.ts | weekly planning protocol, aims, four-week tracker/review context     |
| Local Codex bridge      | scripts/fya-codex-bridge.cjs                      | fya-plan-core.cjs, docs/codex/bridge-api.md                                 |
| Tracker date ranges     | src/components/Calendar/Tracker/calendarRange.ts | FiltersBar/, TrackerCalendar.tsx                                            |
| Tracker and export      | src/components/Calendar/Tracker/                 | trackerExport.ts, habits, task groups, and history services                 |
| Tracker filters         | src/components/Calendar/Tracker/rowFilters.ts    | rowFilters.test.ts, FiltersBar/, tableConfigs.ts                            |
| Scheduler               | src/components/Scheduler/                        | history and habits services                                                 |
| Aims                    | src/components/Aims/                             | aims services, history helper, task groups                                  |
| Habits                  | src/components/Habits/                           | habit and category services                                                 |
| Task groups             | src/components/TasksGroups/                      | task-group service and tracker editors                                      |
| Legacy spheres          | src/components/Spheres/                          | unmounted compatibility code; no active route or UI                         |
| English                 | src/components/English/                          | src/store/services/english.ts                                               |
| Shared helpers          | src/share/                                       | dates, errors, forms, mobile detection                                      |
| Domain types            | src/types/                                       | runtime Firestore shapes                                                    |

## Where to start

- Navigation bug: compare route constant, mounted route, and menu item.
- Loading/error bug: inspect the hook result and service queryFn together.
- Tracker bug: inspect TrackerCalendar.tsx, tableConfigs.ts, cell editor/renderer, and history write path.
- Review/export bug: inspect DailyReview or WeeklyReview, dailyReviews service, weeklyReviewExport, and the tracker report builder.
- Codex guide bug: inspect CodexGuide, codexPrompts.ts, the review routes, and the Reviews menu group.
- Codex planning bug: inspect weeklyPlanningExport, weekly-planning-protocol-v1.md, bridge-api.md, and run the bridge core test before any live dry-run.
- Aim progress bug: inspect AimCellRenderer.tsx, aimRendererConfigs.ts, date helpers, and history document IDs.
- Relationship bug: inspect the form, related-cell renderer, update payload, and both domain types.
- Firebase-related change: read firebase-contract.md, enumerate every read/write, and preserve paths.
- Performance issue: count mounted queries/direct reads and inspect effect dependencies before memoizing.

## Naming cautions

- Collections are not consistently plural: habit, aim, and taskGroup are singular.
- Task-group runtime properties include both task stores and staged subtasks.
- Dates appear as full dates, month document IDs, day field keys, and Unix timestamps. Never normalize them without tracing every consumer.
