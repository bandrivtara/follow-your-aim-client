# Code map

Last verified: 2026-07-28.

| Concern | Primary location | Related locations |
| --- | --- | --- |
| Application entry | src/index.tsx, src/App.tsx | src/globalStyles.css |
| Routes | src/components/Routes.tsx | src/config/routes.ts, src/components/Layout/useMenuItems.tsx |
| Redux and Firebase base | src/store/store.ts | src/store/api/index.ts |
| Firestore services | src/store/services/ | src/types/, src/share/fireBase/ |
| Main dashboard | src/components/Main/ | src/config/habitsIds.json |
| Tracker | src/components/Calendar/Tracker/ | habits, task groups, and history services |
| Tracker filters | src/components/Calendar/Tracker/rowFilters.ts | rowFilters.test.ts, FiltersBar/, tableConfigs.ts |
| Scheduler | src/components/Scheduler/ | history and habits services |
| Aims | src/components/Aims/ | aims services, history helper, task groups |
| Habits | src/components/Habits/ | habit and category services |
| Task groups | src/components/TasksGroups/ | task-group service and tracker editors |
| Spheres | src/components/Spheres/ | spheres service, related aims/habits |
| English | src/components/English/ | src/store/services/english.ts |
| Shared helpers | src/share/ | dates, errors, forms, mobile detection |
| Domain types | src/types/ | runtime Firestore shapes |

## Where to start

- Navigation bug: compare route constant, mounted route, and menu item.
- Loading/error bug: inspect the hook result and service queryFn together.
- Tracker bug: inspect TrackerCalendar.tsx, tableConfigs.ts, cell editor/renderer, and history write path.
- Aim progress bug: inspect AimCellRenderer.tsx, aimRendererConfigs.ts, date helpers, and history document IDs.
- Relationship bug: inspect the form, related-cell renderer, update payload, and both domain types.
- Firebase-related change: read firebase-contract.md, enumerate every read/write, and preserve paths.
- Performance issue: count mounted queries/direct reads and inspect effect dependencies before memoizing.

## Naming cautions

- Collections are not consistently plural: habit, aim, and taskGroup are singular.
- Task-group runtime properties include both task stores and staged subtasks.
- Dates appear as full dates, month document IDs, day field keys, and Unix timestamps. Never normalize them without tracing every consumer.
