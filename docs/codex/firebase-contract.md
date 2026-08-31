# Observed Firebase contract

Last verified from client code: 2026-08-20. This describes the existing integration; it does not authorize further schema or rule changes.

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
| dailyReview/{monthId}         | month with nested day review data and unix   | src/store/services/dailyReviews.ts     |
| english/groups                | map fields keyed by group ID                 | src/store/services/english.ts          |
| english/words                 | map fields keyed by word ID                  | src/store/services/english.ts          |

List services usually attach Firestore document IDs as id. English differs: IDs are dynamic field names inside fixed documents.

## History contract

- Month document IDs use YYYY-MM, for example 2026-07.
- Each month document stores unix for range queries.
- Day keys are strings such as DD; activity IDs below them map to habit or task-group history.
- updateHistory accepts id, path, and data and updates the dynamic field path without replacing the month.
- Activity history can contain type, valueType, isPlanned, status, progress, times, measures, tasks, or an optional text `note`. The note is currently used by the “Ранковий компас” flow, which preserves the former “5 цілей і 5 подяк” habit ID and history and does not introduce a collection or nested activity ID.
- Task objects inside task-group definitions and history keep their existing title/status/time shape and may additionally contain an optional `category` using one of the client life-area IDs. Missing categories and empty times remain valid for legacy and all-day tasks.
- New task-list history entries persist the already-supported isPlanned flag so work added during tracking can be distinguished from the daily plan. Legacy task lists without the flag remain treated as planned for compatibility.
- Dashboard quick completion merges a boolean habit, measured habit, or updated task list back into the same existing day/activity path. Quick task capture appends a pending task to an existing flat task-group activity at that path and marks the activity as planned. Copying yesterday's or the previous same weekday's plan creates current-day activity entries with progress/value/status reset while preserving targets, tasks, times, and IDs.
- Measure values are nested under activity and measure IDs. Do not flatten or rename them.
- The dashboard focus timer is offered only for measured habit fields whose unit is minutes. An unfinished elapsed duration is device-local in `localStorage`; completing a session adds the actual focused minutes to the existing daily measure value and uses the normal dashboard history mutation without introducing a Firestore field.
- The dashboard water and steps counters use the stable existing habit/measure IDs from `src/config/habitsIds.json`; both update only the matching daily measure value and do not introduce duplicate metric fields.
- History is read both by unix range in the RTK Query service and by document ID in src/share/fireBase/getHistoryBetweenDates.ts.

Any date fix must keep both read paths consistent and test first/last-day and cross-month boundaries.

## Daily review contract

- Added with explicit user approval on 2026-08-18; review content remains independent from tracker `history` so reflection fields cannot be mistaken for activity IDs.
- Collection: `dailyReview`; document ID: `YYYY-MM`; month documents keep `unix` for the same month-range query pattern as history.
- Day fields use padded `DD` keys. Each value contains `date` (`YYYY-MM-DD`), `mood` (1–5), `energy` (1–5), `answers` keyed by stable question IDs, and `updatedAt` as Unix seconds.
- A current review is complete when its optional `summary` string is non-empty. Legacy reviews remain complete when all five stable question IDs contain non-empty answers; their existing `answers` object is preserved for compatibility.
- Completing a review uses one batched merge: it saves the selected `dailyReview` day and writes the configured `dailyReview` boolean habit as planned, `done`, and `100%` under the matching `history/{YYYY-MM}.{D}.{habitId}` path. Other days and activities are preserved.
- The dashboard reads yesterday's final `Фокус:`, `Фокус завтра:`, or `Фокус на завтра:` section from `summary` (case-insensitive, with Markdown label support). Reviews without a matching section fall back to legacy `answers.tomorrow`; this is a read-only extraction, not a migration.

## Archive fields

- Habits and aims can contain optional `isArchived: true`. Missing or false means active.
- Archiving updates only that flag. Existing documents and historical tracker records are never deleted; archived items are omitted from active tracker, calendar, and dashboard views and remain available in archive lists.

## Habit life-area metadata

- Habits can contain optional `lifeArea`: `health`, `mental`, `learning`, `workFinance`, `relationships`, `creativity`, or `recovery`.
- `lifeArea` is independent from `habitsCategoryId`. Existing habit categories continue to represent routine/time groupings and are not renamed or migrated.
- `complexity` remains an integer from 1 to 10 and is interpreted as the effort required to perform the habit, not its importance.
- The dashboard life-balance chart uses only non-hidden, non-archived habits with `lifeArea`, comparing the complexity-weighted share of the weekly plan with the complexity-weighted share of actual progress.

## Relationships

- The effective relationship source is the child record: habits use habitsCategoryId and sphereId; aims use aimsCategoryId and sphereId.
- Sphere documents and sphereId fields are legacy-compatible data. The active client UI no longer reads or edits them, but they remain unchanged in Firestore.
- Category and sphere related-habit/aim arrays are optional legacy data and are not reliable enough to drive lists or initial form selection.
- Relationship screens therefore derive their displayed and selected items from child IDs. Saving a relationship updates selected children and clears the same relationship on deselected children.
- Missing referenced IDs must remain visible as a fallback such as "Не знайдено (ID)" instead of rendering a raw unexplained ID or crashing.
- Aims can reference a habit/measure pair through relatedHabit or task-group/stage selections through relatedList.
- The known personal planner-consistency aim is identified by its stable document ID in `src/config/habitsIds.json` and calculated read-only from existing history: a day counts when it has at least one planned activity and dashboard plan completion is strictly greater than 50%. This introduces no new Firestore field and does not rewrite the aim document.
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

## Local Codex bridge boundary

- `scripts/fya-codex-bridge.cjs` uses the same public Firebase configuration and deployed rules; it does not introduce Admin SDK credentials or bypass access control.
- `export-context` reads `habit`, `habitsCategories`, `taskGroup`, `aim`, `history`, and `dailyReview` into an ignored local file.
- `apply-plan` is dry-run unless `--apply` is supplied. It validates Monday–Sunday boundaries, existing activity and measure IDs, allowed fields, times, and task titles.
- `apply-habit-metadata` is also dry-run unless `--apply` is supplied. It can update only `lifeArea` and `complexity` for existing non-archived habits, including hidden compatibility habits, whose IDs and titles both match the reviewed document.
- Applied changes only merge planning data below `history/{YYYY-MM}/{DD}/{activityId}` and keep the existing month `unix` convention. No delete operation is implemented.
- Because repository-only review cannot verify deployed rules, the bridge must remain a local personal tool and must not be exposed as a public API.


## Personal backup export

- `src/share/backup/firebaseBackup.ts` performs read-only `getDocs` calls for every known application collection, including legacy spheres and the fixed English documents.
- The downloaded `follow-your-aim-backup-v1` JSON contains document IDs and raw document data. No restore, migration, delete, or remote write is implemented.
