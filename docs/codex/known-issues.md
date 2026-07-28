# Known issues and review queue

Last verified: 2026-07-28 on FYA-17-create-chart-analytics at commit 8e8a061.

This is a triage aid, not permission to fix items outside the requested scope. Reproduce and re-read current code before implementation. Never solve an item by changing the Firebase contract without explicit approval.

## P0 - security posture cannot be verified here

- No Firebase Auth/App Check client flow or tracked Firestore rules were found.
- This does not prove deployed rules are insecure; repository-only review cannot establish access control.
- Safe next step: inspect deployed configuration read-only with explicit Firebase access. Do not alter rules during ordinary client maintenance.

## P1 - correctness and incomplete behavior

- Mutation failures now propagate from save flows, but consistent loading and user-visible error feedback is still incomplete.
- Relationship saves update multiple child documents separately and are not atomic.
- Live data includes references to a removed habit category and two malformed empty habit documents. The client now shows missing-reference fallbacks and filters malformed habits, but no migration or deletion was performed.
- Some legacy history activities omit type; readers require current-domain fallbacks until or unless a separately approved data migration is performed.

## P2 - maintainability and completeness

- Several central files use @ts-nocheck/@ts-ignore, allowing runtime shape mismatches past strict TypeScript.
- Broad RTK Query tags and direct Firestore reads can cause excess refetching or bypass cache state.
- Accessibility and responsive behavior need focused review, especially grids, drawers, form labels, keyboard use, and status announcements.

## Recently resolved

- Scheduler is intentionally a read-only projection of timed tracker history; standalone appointments are not supported by the current Firebase contract.

- Tracker activity filters now affect displayed rows and have focused tests (8e8a061, fix(tracker): apply activity filters).
- Habit-based aim progress now uses YYYY-MM history documents, inclusive date boundaries, and chronological last values (fix(aims): correct habit progress date ranges).
- Aim task-group progress reuses the RTK Query list, avoids direct renderer reads, and guards empty stages (chore: batch safe client fixes).
- Unmounted statistics links, duplicate Firebase initialization, and production debug logs were removed; missing mutation unwraps were added (chore: batch safe client fixes).

## Maintenance rule

Move fixed items to Recently resolved with a commit reference. Add entries only after confirming current code. Keep uncertain hypotheses in audit notes rather than this file.
