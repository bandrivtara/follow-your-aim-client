# Codex bridge API

Last verified: 2026-08-18.

## Why this is a local command API

The checked-in application has no backend authentication layer. Exposing a public write endpoint would make the existing direct Firebase integration less safe. The bridge is therefore a narrow local CLI used by Codex from this repository. It uses the same Firebase project and existing collection paths, adds no server, stores no private credential, and relies on deployed Firestore rules.

The bridge never deletes documents, aims, habits, task groups, history, or reviews. Planning writes are restricted to existing activity IDs inside `history/{YYYY-MM}`.

## Commands

Export a raw context bundle for a Monday–Sunday week and the preceding four-week window:

```powershell
npm.cmd run fya:bridge -- export-context --week 2026-08-24 --out .codex-local/fya-context.json
```

Validate and preview an AI-produced plan without writing Firebase:

```powershell
npm.cmd run fya:bridge -- apply-plan --file .codex-local/fya-plan.json
```

Apply the already reviewed plan:

```powershell
npm.cmd run fya:bridge -- apply-plan --file .codex-local/fya-plan.json --apply
```

Preview reviewed habit life-area and complexity metadata without writing:

```powershell
npm.cmd run fya:bridge -- apply-habit-metadata --file .codex-local/habit-metadata-plan.json
```

Apply the exact metadata preview only after explicit confirmation:

```powershell
npm.cmd run fya:bridge -- apply-habit-metadata --file .codex-local/habit-metadata-plan.json --apply
```

`apply-plan` is dry-run by default. Codex must show the preview and obtain a clear user instruction to apply before adding `--apply`.

`apply-habit-metadata` has the same dry-run boundary. Its `fya-habit-metadata-v1` document accepts only an existing non-archived `habitId` (visible or hidden), the matching current `title`, one supported `lifeArea`, and an integer `complexity` from 1 to 10. It cannot change routine categories, history, aims, task groups, or arbitrary habit fields.

## `fya-plan-v1` document

```json
{
  "version": "fya-plan-v1",
  "week": {
    "from": "2026-08-24",
    "to": "2026-08-30"
  },
  "big3": [
    "Finish the most important project milestone",
    "Complete three English sessions",
    "Train three times"
  ],
  "changes": [
    {
      "date": "2026-08-24",
      "activityId": "existing-habit-id",
      "action": "plan",
      "startTime": [8, 0],
      "endTime": [8, 30],
      "plannedMeasures": {
        "existing-measure-id": 30
      }
    },
    {
      "date": "2026-08-25",
      "activityId": "existing-task-group-id",
      "action": "plan",
      "tasks": [
        {
          "title": "Concrete task",
          "description": "Optional context",
          "time": [18, 0]
        }
      ]
    },
    {
      "date": "2026-08-26",
      "activityId": "existing-habit-id",
      "action": "unplan"
    }
  ]
}
```

## Validation and write boundary

- `week.from` must be Monday, `week.to` must be the following Sunday, and every change must fall inside that range.
- `big3` accepts one to three text outcomes but is not persisted.
- `activityId` must resolve to an existing, non-archived habit or task group.
- Times must be integer `[hour, minute]` pairs.
- A measured habit accepts only measure IDs already defined on that habit and non-negative planned values.
- A task-group plan accepts explicit tasks with non-empty titles; new tasks start as `pending`.
- `plan` merges with existing history and preserves recorded progress/values where possible.
- `unplan` only clears planning markers or planned values. It does not delete completion data or task text.
- Arbitrary collections, document IDs, field paths, deletes, aim edits, habit edits, and task-group definition edits are not accepted.

## Expected Codex workflow

1. Run `export-context` read-only.
2. Analyze the context using `weekly-planning-protocol-v1.md`.
3. Conduct the interview and return a human-readable plan.
4. After the user confirms, create a local `fya-plan-v1` JSON file.
5. Run dry-run `apply-plan` and show the exact proposed changes.
6. Run with `--apply` only after a direct user instruction.
7. Re-export or read back the affected week to verify the result.

The local files under `.codex-local/` are ignored and must never be committed.
