# Follow Your Aim planning profile

Last updated: 2026-08-26.

## Purpose

This file stores confirmed recurring planning preferences. Weekly facts such as
office days, travel, appointments, illness, or temporary workload must still be
confirmed for the specific week. Defaults here should not override explicit
instructions from the user or evidence that the week needs a lighter plan.

## English cadence

- Plan English on five weekdays by default.
- Monday, Wednesday, and Friday: one main ChatGPT lesson, 30 minutes.
- Tuesday and Thursday: teacher homework or guided practice, 15 minutes.
- Saturday and Sunday: optional recovery or catch-up only; do not plan English
  automatically.
- Main lessons must remain sequential: Lesson 001, Lesson 002, Lesson 003, and
  so on. Never infer that a skipped lesson was completed.
- For the first four to five completed lessons, keep Follow Your Aim tracking
  manual. Do not enable repository-to-Firebase auto-completion yet.
- When a lesson is recorded manually, store both the actual duration and the
  latest completed lesson number in the existing English habit fields.

## Weekly planning workflow

1. Analyze the previous week and the latest four-week context before proposing
   the next plan.
2. Separate facts, observations, hypotheses, and recommendations.
3. Identify repeated misses, overload, unrealistic times, and unfinished work.
4. Ask only for missing variable constraints: office days, travel, appointments,
   unusually tiring days, and intentional exceptions.
5. Propose Big 3, a realistic daily plan, and a minimum Plan B.
6. Check time collisions and preserve transition and recovery space.
7. Let the user correct the proposal before generating Firebase changes.
8. Run the FYA bridge dry-run, show the exact preview, and apply only after a
   direct confirmation.

## Morning compass

- Use the existing former “5 цілей і 5 подяк” habit as “Ранковий компас”; keep
  its ID and history compatible.
- The daily practice records current energy, one focus, the identity or role it
  supports, the first concrete step, an if–then fallback, and one specific
  gratitude.
- Keep broader goals and Big 3 in weekly planning instead of repeating five
  goals every morning.

## Change discipline

- Treat recurring preferences as defaults, not permanent obligations.
- Update this file only after the user explicitly confirms a new lasting rule.
- Keep one-off events in the weekly plan rather than adding them here.
- If recent evidence conflicts with a default, surface the conflict and ask
  whether to keep, reduce, move, or pause the activity.
