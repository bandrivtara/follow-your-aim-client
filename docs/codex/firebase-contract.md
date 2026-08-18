# Observed Firebase contract

Last verified from client code: 2026-07-28. This describes the existing integration; it does not authorize schema or rule changes.

## Safety boundary

- Preserve collection names, document IDs, nested field paths, date encodings, and relationship IDs.
- Do not migrate data, change Firestore rules, introduce Auth/App Check, move configuration, or replace direct-client integration without explicit approval.
- Never run exploratory writes against the live project. Prefer pure unit tests and mocked data.
- Firebase web configuration is in source, but access control depends on deployed rules that are not tracked here.

## Initialization

- Firebase is initialized once in src/store/api/index.ts, exporting fbApp, db, and the shared RTK Query API.
- No client Auth or App Check setup is present in src/.
- No firebase.json, .firebaserc, or Firestore/Storage rules were found during verification.

## Locations

| Firestore location            | Storage pattern                              | Client service                         |
| ----------------------------- | -------------------------------------------- | -------------------------------------- |
| habit/{habitId}               | one habit per document                       | src/store/services/habits.ts           |
| taskGroup/{taskGroupId}       | one task group per document                  | src/store/services/taskGroups.ts       |
| aim/{aimId}                   | one aim per document                         | src/store/services/aims.ts             |
| habitsCategories/{categoryId} | one category per document                    | src/store/services/habitsCategories.ts |
| aimsCategories/{categoryId}   | one category per document                    | src/store/services/aimsCategories.ts   |
| spheres/{sphereId}            | one sphere per document                      | src/store/services/spheres.ts          |
| history/{monthId}             | month with nested day/activity data and unix | src/store/services/history.ts          |
| english/groups                | map fields keyed by group ID                 | src/store/services/english.ts          |
| english/words                 | map fields keyed by word ID                  | src/store/services/english.ts          |

List services usually attach Firestore document IDs as id. English differs: IDs are dynamic field names inside fixed documents.

## History contract

- Month document IDs use YYYY-MM, for example 2026-07.
- Each month document stores unix for range queries.
- Day keys are strings such as DD; activity IDs below them map to habit or task-group history.
- updateHistory accepts id, path, and data and updates the dynamic field path without replacing the month.
- Activity history can contain type, valueType, isPlanned, status, progress, times, measures, or tasks.
- New task-list history entries persist the already-supported isPlanned flag so work added during tracking can be distinguished from the daily plan. Legacy task lists without the flag remain treated as planned for compatibility.
- Measure values are nested under activity and measure IDs. Do not flatten or rename them.
- History is read both by unix range in the RTK Query service and by document ID in src/share/fireBase/getHistoryBetweenDates.ts.

Any date fix must keep both read paths consistent and test first/last-day and cross-month boundaries.

## Relationships

- The effective relationship source is the child record: habits use habitsCategoryId and sphereId; aims use aimsCategoryId and sphereId.
- Sphere documents and sphereId fields are legacy-compatible data. The active client UI no longer reads or edits them, but they remain unchanged in Firestore.
- Category and sphere related-habit/aim arrays are optional legacy data and are not reliable enough to drive lists or initial form selection.
- Relationship screens therefore derive their displayed and selected items from child IDs. Saving a relationship updates selected children and clears the same relationship on deselected children.
- Missing referenced IDs must remain visible as a fallback such as "Не знайдено (ID)" instead of rendering a raw unexplained ID or crashing.
- Aims can reference a habit/measure pair through relatedHabit or task-group/stage selections through relatedList.
- Relationship saves currently issue multiple document updates and are not atomic. Do not replace this with a schema migration or new Firebase integration without explicit approval.

Observed live-data compatibility notes from the read-only audit on 2026-07-28:

- Some habits reference a category document that no longer exists.
- Two habit documents have no usable habit fields and are filtered from client lists rather than deleted.
- Some legacy history activities omit type; tracker and scheduler readers fall back to the current habit/task-group definition.

## Service behavior

- The shared API uses fakeBaseQuery; endpoints implement Firestore work inside queryFn.
- Mutations invalidate broad domain tags.
- Errors are generally converted to error.message and logged. Components still need to unwrap mutations or inspect error state.
- Some files disable TypeScript checking, so runtime Firestore shape is authoritative when it conflicts with an interface.
