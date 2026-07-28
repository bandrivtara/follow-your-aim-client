# Verification guide

Last verified: 2026-07-28.

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
- Do not run npm install, upgrade packages, or regenerate the lockfile unless requested.

## Before handoff

1. Check git status --short --branch.
2. Review git diff --stat, git diff, and git diff --check.
3. Confirm no unrelated files, generated artifacts, credentials, or Firebase changes entered the diff.
4. Report checks run and skipped.
5. Update documentation only when implementation changes a documented fact.
