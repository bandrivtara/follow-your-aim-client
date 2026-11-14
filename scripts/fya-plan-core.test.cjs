const assert = require("node:assert/strict");
const {
  buildHistoryEntry,
  createMonthPatches,
  validatePlanDocument,
} = require("./fya-plan-core.cjs");

const plan = {
  version: "fya-plan-v1",
  week: { from: "2026-08-24", to: "2026-08-30" },
  big3: ["English", "Project", "Training"],
  changes: [
    {
      date: "2026-08-24",
      activityId: "habit",
      action: "plan",
      plannedMeasures: { minutes: 30 },
    },
  ],
};

assert.doesNotThrow(() => validatePlanDocument(plan));
assert.throws(
  () => validatePlanDocument({ ...plan, week: { from: "2026-08-25", to: "2026-08-31" } }),
  /Monday/,
);
assert.throws(
  () =>
    validatePlanDocument({
      ...plan,
      changes: [{ ...plan.changes[0], arbitraryPath: "aim/anything" }],
    }),
  /not allowed/,
);

const measuredHabit = {
  id: "habit",
  title: "English",
  type: "habit",
  valueType: "measures",
  isAllDay: false,
  startTime: [8, 0],
  endTime: [8, 30],
  fields: [{ id: "minutes", minToComplete: 20 }],
};
const entry = buildHistoryEntry(plan.changes[0], measuredHabit, {
  measures: { minutes: { value: 12, plannedValue: 20 } },
  progress: 60,
});
assert.equal(entry.measures.minutes.value, 12);
assert.equal(entry.measures.minutes.plannedValue, 30);
assert.equal(entry.progress, 60);

const { patches, preview } = createMonthPatches(
  plan,
  new Map([["habit", measuredHabit]]),
  {},
);
assert.equal(patches["2026-08"]["24"].habit.isPlanned, true);
assert.equal(preview[0].title, "English");

console.log("FYA plan bridge core: 7 assertions passed");
