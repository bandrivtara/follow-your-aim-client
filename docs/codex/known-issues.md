# Known issues and review queue

Last verified: 2026-08-18 on FYA-17-create-chart-analytics.

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

- Mobile navigation now prioritizes Today, today's Tracker, Daily Review, and Weekly Review; the complete menu remains available through More.
- Daily review and weekly report flows now connect subjective reflection to tracker results without embedding an AI provider or API key in the client.
- Goals and habits can be archived and restored without deleting their Firestore documents or historical tracker data.
- Weekly planning now has a versioned evidence/interview contract, a four-week context export, and a local bridge with validation plus dry-run-by-default plan application.

- Dashboard completion is now normalized against explicitly planned tracker activities, while completed work outside the plan can raise the score above 100%.
- Active aim calculations stop at the current date and fall back to the configured starting point when no measurement exists, preventing future placeholder values from completing descending goals.
- Tracker month columns now have a fixed equal width, and the current period can be exported with nested tasks and an AI-analysis prompt.
- Life spheres were removed from the active UI without migrating or deleting legacy Firebase data.

- Scheduler is intentionally a read-only projection of timed tracker history; standalone appointments are not supported by the current Firebase contract.

- Tracker activity filters now affect displayed rows and have focused tests (8e8a061, fix(tracker): apply activity filters).
- Habit-based aim progress now uses YYYY-MM history documents, inclusive date boundaries, and chronological last values (fix(aims): correct habit progress date ranges).
- Aim task-group progress reuses the RTK Query list, avoids direct renderer reads, and guards empty stages (chore: batch safe client fixes).
- Unmounted statistics links, duplicate Firebase initialization, and production debug logs were removed; missing mutation unwraps were added (chore: batch safe client fixes).

## Maintenance rule

Move fixed items to Recently resolved with a commit reference. Add entries only after confirming current code. Keep uncertain hypotheses in audit notes rather than this file.
