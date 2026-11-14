const assert = require("node:assert/strict");
const {
  createHabitMetadataPreview,
  validateHabitMetadataDocument,
} = require("./fya-habit-metadata-core.cjs");

const validDocument = {
  version: "fya-habit-metadata-v1",
  changes: [
    {
      habitId: "habit-1",
      title: "Медитація",
      lifeArea: "mental",
      complexity: 4,
    },
  ],
};

assert.equal(validateHabitMetadataDocument(validDocument).length, 1);

assert.throws(
  () =>
    validateHabitMetadataDocument({
      ...validDocument,
      changes: [{ ...validDocument.changes[0], lifeArea: "unknown" }],
    }),
  /lifeArea is not supported/,
);

assert.throws(
  () =>
    validateHabitMetadataDocument({
      ...validDocument,
      changes: [{ ...validDocument.changes[0], complexity: 11 }],
    }),
  /integer from 1 to 10/,
);

const preview = createHabitMetadataPreview(validDocument, [
  { id: "habit-1", title: "Медитація", complexity: 3 },
]);
assert.deepEqual(preview[0].to, { lifeArea: "mental", complexity: 4 });
assert.deepEqual(preview[0].from, { lifeArea: null, complexity: 3 });

assert.throws(
  () =>
    createHabitMetadataPreview(validDocument, [
      { id: "habit-1", title: "Інша звичка" },
    ]),
  /title mismatch/,
);

assert.throws(
  () =>
    createHabitMetadataPreview(validDocument, [
      { id: "habit-1", title: "Медитація", isArchived: true },
    ]),
  /is archived/,
);

console.log("Habit metadata core: 6 assertions passed.");
