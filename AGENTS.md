# Follow Your Aim repository guidance

## Product and scope

- This is a personal React application for habits, plans, goals, task groups, schedules, and English vocabulary practice.
- The client is a Create React App + TypeScript application backed directly by Firebase Firestore.
- Preserve existing behavior and data compatibility unless the user explicitly requests a migration or breaking change.
- Read the relevant files in docs/codex/ before making cross-cutting changes.

## Non-negotiable Firebase compatibility

- Treat current Firestore collections, document IDs, nested field paths, date formats, and denormalized relationships as an external contract.
- Do not change Firebase structure, data models, security rules, authentication, App Check, project configuration, or the integration approach without explicit user approval.
- Do not run scripts or tests that seed, migrate, delete, or rewrite remote Firebase data.
- Do not interpret the absence of rules in this repository as permission to change deployed rules.
- Before touching services, tracker history, aims, or English data, read docs/codex/firebase-contract.md and trace both readers and writers.

## Git workflow

- Production branch: master.
- Feature work recorded on 2026-07-28: FYA-17-create-chart-analytics. Always verify the current branch and status rather than assuming this remains current.
- Inspect git status, relevant diffs, and recent commits before editing. Preserve unrelated user changes.
- Keep commits focused on one logical change. Do not merge, rebase, push, or switch branches unless requested.

## Working method

1. Diagnose and explain current behavior before changing it.
2. Trace a feature from route/component through hooks and RTK Query service to Firestore and types.
3. Prefer the smallest client-side change that preserves the Firebase contract.
4. Add or update focused tests for pure logic and regressions when practical.
5. Handle mutation failures and loading states explicitly; avoid silent failures.
6. Update docs/codex/ only when an architectural fact, contract, command, or issue status changes.

## Verification

- Typecheck: npx tsc --noEmit
- Lint: npx eslint src --ext .ts,.tsx --max-warnings=0
- Non-interactive tests: npm test -- --watchAll=false
- Production build: npm run build
- Run checks in proportion to the change. For documentation-only changes, validate links, paths, and the skill instead of rebuilding the app.
- Do not install or upgrade dependencies without explicit approval. The project does not currently define an npm run lint script.

## Architecture conventions

- Route constants live in src/config/routes.ts; mounted routes live in src/components/Routes.tsx; navigation lives in src/components/Layout/useMenuItems.tsx.
- Shared Redux state is RTK Query only. The base API and active Firebase initialization live in src/store/api/index.ts; feature endpoints live in src/store/services/.
- Domain interfaces live in src/types/. Check runtime Firestore shapes as well as TypeScript declarations because several services use broad types or disable checking.
- UI state is mostly local React state. Do not introduce global state without a demonstrated cross-component need.
- The application intentionally combines Ant Design, MUI, AG Grid, DevExpress Scheduler, and styled-components; avoid adding another UI system.

## Review priorities

- Data loss or corruption, Firebase path/date compatibility, and accidental remote writes.
- Incorrect progress/history calculations and boundary dates.
- Missing error/loading feedback around RTK Query mutations.
- Unmounted routes, incomplete features, stale code, and duplicated initialization.
- Accessibility, unnecessary Firestore reads, unstable effects, and avoidable rerenders.

## Project context index

- docs/codex/architecture.md - runtime architecture and data flow.
- docs/codex/code-map.md - feature-to-file navigation map.
- docs/codex/firebase-contract.md - observed Firestore contract and safety boundary.
- docs/codex/verification.md - safe validation commands and expectations.
- docs/codex/known-issues.md - confirmed findings and current priorities.
