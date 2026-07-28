---
name: fya-maintenance
description: Safely audit, diagnose, test, refactor, and extend the Follow Your Aim React/Firebase client. Use for work on this repository involving routes, components, tracker, scheduler, aims, habits, task groups, spheres, English vocabulary, RTK Query services, Firestore reads/writes, code review, bug triage, performance, accessibility, or incremental maintenance. Preserve the existing Firebase structure and integration unless the user explicitly authorizes otherwise.
---

# Follow Your Aim maintenance

## Load only relevant context

- Read ../../../docs/codex/code-map.md to locate unfamiliar features.
- Read ../../../docs/codex/architecture.md before cross-module or state-management work.
- Read ../../../docs/codex/firebase-contract.md before touching services, history, tracker persistence, aim calculations, English data, or relationships.
- Read ../../../docs/codex/known-issues.md for audits, refactors, prioritization, or when selecting the next task.
- Read ../../../docs/codex/verification.md before implementing or handing off changes.

Do not load every file automatically. Select references based on the task to keep context lean.

## Follow the workflow

1. Verify checkout, branch, status, and relevant diff. Production is master; never assume the active feature branch.
2. Classify the request as analysis, diagnosis, implementation, or Git operation. Do not broaden authorization.
3. Trace the path from route/component through hooks and service code to types and Firestore.
4. State observed behavior and likely root cause before editing.
5. Preserve collection names, document IDs, nested paths, date encodings, and relationships.
6. Make the smallest coherent client-side change. Preserve unrelated work and avoid dependency additions.
7. Add focused pure tests when changing logic. Never use live Firebase as a test fixture.
8. Run proportional checks from verification.md, inspect the diff, and report residual risks.

## Audit priorities

1. Data corruption, destructive remote writes, and Firebase contract mismatches.
2. Incorrect history/progress/date calculations and incomplete persistence.
3. Missing loading/error handling and unsafe mutation assumptions.
4. Route/navigation gaps, unfinished features, dead code, and duplicated setup.
5. Accessibility, unnecessary reads/rerenders, typing gaps, and maintainability.

Separate confirmed findings from hypotheses. Provide file and line evidence for actionable review findings.

## Maintain project knowledge

- Update docs/codex/ only when implementation changes a documented fact or resolves an issue.
- Keep AGENTS.md concise and durable; put details in targeted documentation.
- Do not duplicate reference content inside this skill.
- Date time-sensitive audit facts so future runs can revalidate them.
