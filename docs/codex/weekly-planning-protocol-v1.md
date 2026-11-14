# Weekly Planning Protocol v1

Last verified: 2026-08-18.

## Purpose

Produce a realistic plan for the next Monday–Sunday week without inventing facts or adding planning metadata to Firebase. The protocol is a conversation contract: Follow Your Aim provides evidence, Codex asks only the missing questions, performs a qualitative sanity check, and returns a plan for confirmation.

## Evidence supplied by Follow Your Aim

- Detailed tracker facts for the most recent week.
- Aggregated plan completion and habit consistency for the latest four weeks.
- Active aims whose date range intersects the next week.
- Unfinished tasks from the recent tracker and unfinished task-group stages.
- Daily review mood, energy, and answers for the context period.
- Activities already planned for the next week.
- Work completed outside the plan.

The monthly Firestore document layout is storage partitioning, not a retention limit. Older month documents remain part of the available history.

## Interview sequence

Codex asks one question at a time and skips questions already answered by the export. Use at most ten questions.

1. Which three outcomes would make the next week successful?
2. Which known events, meetings, travel, or restrictions must be considered?
3. Which days are expected to be unusually difficult or tiring?
4. For each important unfinished item: carry over, simplify, postpone, or drop?
5. Which habits should keep their current frequency, and which should be reduced temporarily?
6. What will intentionally not be done next week?
7. What is the minimum acceptable plan if the week becomes harder than expected?

When a question is prompted by data, cite the fact briefly. Example: “English was completed twice out of three planned sessions. Keep three sessions or reduce the plan?”

## Sanity checks

- Every Big 3 outcome has at least one concrete action.
- Existing scheduled activities have no obvious time collision.
- No day is qualitatively overloaded with several important activities and no recovery space.
- Unfinished work is never carried over without an explicit decision.
- The plan does not attempt to advance every active aim at once.
- Habit frequency reflects recent completion and energy rather than optimism alone.
- The plan leaves reasonable room for unplanned work.

Do not calculate a synthetic capacity percentage or a single week score. Use factual metrics and qualitative labels such as `light`, `reasonable`, or `potentially overloaded`.

## Reasoning contract

Every material recommendation must separate:

1. **Fact** — directly present in the export or the user's answer.
2. **Observation** — a repeated or relevant relationship in those facts.
3. **Hypothesis** — a possible explanation, explicitly not proven.
4. **Recommendation** — one concrete decision or experiment.

Never present correlation as established causation.

## Final response format

```markdown
# Plan: YYYY-MM-DD — YYYY-MM-DD

## Big 3
1.
2.
3.

## Known constraints
- Events:
- Difficult days:
- Recovery space:

## Daily plan
### Monday
- Main outcome:
- Habits:
- Tasks:
- Reserve:

## Unfinished work decisions
- Carry over:
- Simplify:
- Postpone:
- Drop:

## Habit plan
- Habit: frequency, preferred days, fallback minimum

## Intentionally not doing
-

## Risks and sanity check
- Fact → Observation → Hypothesis → Recommendation

## Plan B
- Minimum version of the week.

## Follow Your Aim change set
- Human-readable summary of tracker planning changes.
- A `fya-plan-v1` JSON block that follows `docs/codex/bridge-api.md` only after the user confirms the plan.
```

Big 3 remains conversational in v1. It is not written to Firebase and does not add `weeklyPriority` fields.
