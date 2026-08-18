const LIFE_AREAS = new Set([
  "health",
  "mental",
  "learning",
  "workFinance",
  "relationships",
  "creativity",
  "recovery",
]);

const validateHabitMetadataDocument = (document) => {
  if (!document || document.version !== "fya-habit-metadata-v1") {
    throw new Error("Metadata document version must be fya-habit-metadata-v1");
  }
  if (!Array.isArray(document.changes) || !document.changes.length) {
    throw new Error("Metadata document requires at least one change");
  }

  const ids = new Set();
  document.changes.forEach((change, index) => {
    const label = `changes[${index}]`;
    if (!change || typeof change !== "object") {
      throw new Error(`${label} must be an object`);
    }
    if (typeof change.habitId !== "string" || !change.habitId.trim()) {
      throw new Error(`${label}.habitId is required`);
    }
    if (ids.has(change.habitId)) {
      throw new Error(`${label}.habitId is duplicated`);
    }
    ids.add(change.habitId);
    if (typeof change.title !== "string" || !change.title.trim()) {
      throw new Error(`${label}.title is required`);
    }
    if (!LIFE_AREAS.has(change.lifeArea)) {
      throw new Error(`${label}.lifeArea is not supported`);
    }
    if (
      !Number.isInteger(change.complexity) ||
      change.complexity < 1 ||
      change.complexity > 10
    ) {
      throw new Error(`${label}.complexity must be an integer from 1 to 10`);
    }
  });

  return document.changes;
};

const createHabitMetadataPreview = (document, habits) => {
  const changes = validateHabitMetadataDocument(document);
  const habitsById = new Map(habits.map((habit) => [habit.id, habit]));

  return changes.map((change) => {
    const habit = habitsById.get(change.habitId);
    if (!habit) throw new Error(`Habit does not exist: ${change.habitId}`);
    if (habit.title !== change.title) {
      throw new Error(
        `Habit title mismatch for ${change.habitId}: expected "${habit.title}"`,
      );
    }
    if (habit.isArchived) {
      throw new Error(`Habit is archived: ${habit.title}`);
    }

    return {
      habitId: habit.id,
      title: habit.title,
      from: {
        lifeArea: habit.lifeArea || null,
        complexity: habit.complexity ?? null,
      },
      to: {
        lifeArea: change.lifeArea,
        complexity: change.complexity,
      },
    };
  });
};

module.exports = {
  LIFE_AREAS,
  createHabitMetadataPreview,
  validateHabitMetadataDocument,
};
