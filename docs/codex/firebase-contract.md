# Observed Firebase contract

Last verified from client code: 2026-07-28. This describes the existing integration; it does not authorize schema or rule changes.

## Safety boundary

- Preserve collection names, document IDs, nested field paths, date encodings, and relationship IDs.
- Do not migrate data, change Firestore rules, introduce Auth/App Check, move configuration, or replace direct-client integration without explicit approval.
- Never run exploratory writes against the live project. Prefer pure unit tests and mocked data.
- Firebase web configuration is in source, but access control depends on deployed rules that are not tracked here.

## Initialization

- Active initialization: src/store/api/index.ts, exporting fbApp, db, and the shared RTK Query API.
- src/firebase.ts contains a duplicate initializer with the same project configuration and appears unused by current imports.
- No client Auth or App Check setup is present in src/.
- No firebase.json, .firebaserc, or Firestore/Storage rules were found during verification.

## Locations

| Firestore location | Storage pattern | Client service |
| --- | --- | --- |
| habit/{habitId} | one habit per document | src/store/services/habits.ts |
| taskGroup/{taskGroupId} | one task group per document | src/store/services/taskGroups.ts |
| aim/{aimId} | one aim per document | src/store/services/aims.ts |
| habitsCategories/{categoryId} | one category per document | src/store/services/habitsCategories.ts |
| aimsCategories/{categoryId} | one category per document | src/store/services/aimsCategories.ts |
| spheres/{sphereId} | one sphere per document | src/store/services/spheres.ts |
| history/{monthId} | month with nested day/activity data and unix | src/store/services/history.ts |
| english/groups | map fields keyed by group ID | src/store/services/english.ts |
| english/words | map fields keyed by word ID | src/store/services/english.ts |

List services usually attach Firestore document IDs as id. English differs: IDs are dynamic field names inside fixed documents.

## History contract

- Month document IDs use YYYY-MM, for example 2026-07.
- Each month document stores unix for range queries.
- Day keys are strings such as DD; activity IDs below them map to habit or task-group history.
- updateHistory accepts id, path, and data and updates the dynamic field path without replacing the month.
- Activity history can contain type, valueType, isPlanned, status, progress, times, measures, or tasks.
- Measure values are nested under activity and measure IDs. Do not flatten or rename them.
- History is read both by unix range in the RTK Query service and by document ID in src/share/fireBase/getHistoryBetweenDates.ts.

Any date fix must keep both read paths consistent and test first/last-day and cross-month boundaries.

## Relationships

- Habits and aims may reference category and sphere IDs.
- Spheres store related habit and aim ID arrays.
- Aims can reference a habit/measure pair through relatedHabit or task-group/stage selections through relatedList.
- Before changing relationship logic, inspect updates on both sides and missing-reference behavior.

## Service behavior

- The shared API uses fakeBaseQuery; endpoints implement Firestore work inside queryFn.
- Mutations invalidate broad domain tags.
- Errors are generally converted to error.message and logged. Components still need to unwrap mutations or inspect error state.
- Some files disable TypeScript checking, so runtime Firestore shape is authoritative when it conflicts with an interface.
