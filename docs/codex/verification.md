# Verification guide

Last verified: 2026-08-18.

## Baseline

- Package manager: npm with package-lock.json.
- Build system: Create React App / react-scripts 5.
- TypeScript: strict mode, no emit.
- Node/npm versions are not pinned; report local versions for environment failures.
- Focused Jest suites cover tracker filters/date ranges, dashboard calculations, aim progress/date history, relationship updates, and malformed domain-data guards.

## Safe checks

Run from the repository root:

- Typecheck: npx tsc --noEmit
- Lint: npx eslint src --ext .ts,.tsx --max-warnings=0
- Tests: npm test -- --watchAll=false
- Build: npm run build
- Bridge pure validation: npm run test:bridge

Use the smallest adequate set:

- Documentation or skill only: validate links/paths, run the skill validator, and review git diff --check.
- Pure helper: typecheck, lint, and focused tests.
- Component or service: typecheck, lint, tests, and production build.
- Visual interaction: add browser/manual verification after automated checks when a safe local app is available.

## Constraints

- There is no lint script in package.json.
- CRA starts watch mode by default; unattended tests must use --watchAll=false.
- npm run build writes ignored build/ output and should not change tracked source.
- Do not persist CI=true merely to run tests.
- Do not test against or mutate live Firebase. Mock the boundary or extract pure logic.
- A bridge smoke test may use `export-context` or dry-run `apply-plan` only after explicit read-only authorization. Never use `--apply` as a test.
- Do not run npm install, upgrade packages, or regenerate the lockfile unless requested.

## Before handoff

For responsive UI changes, check 820×1180 and 1180×820 (iPad A16 CSS viewports),
600px Split View, 393px phone, and a desktop width above 1200px. Verify no page-level
horizontal overflow (tracker/roadmap may scroll internally), readable forms/charts,
editor overlays above bottom navigation, and preservation of unsaved input on rotation.
`src/components/Layout/AppLayout.test.tsx` covers navigation breakpoints and form identity;
browser viewport emulation does not replace a real iPad Safari/touch-keyboard check.

Tracker mode must stay visible in the header with compact filters closed. Check
Results → Planning → Results on phone/tablet without changing the selected dates;
entering Planning resets the activity filter to all so unplanned habits remain available.
`TrackerCalendar.test.tsx` covers this without remote writes. `dashboardInsights.test.ts`
covers planned/bonus percentages, future/no-plan days, month boundaries, minute targets,
and recorded time without inferring minutes from checkmarks or unsaved timers.

1. Check git status --short --branch.
2. Review git diff --stat, git diff, and git diff --check.
3. Confirm no unrelated files, generated artifacts, credentials, or Firebase changes entered the diff.
4. Report checks run and skipped.
5. Update documentation only when implementation changes a documented fact.
