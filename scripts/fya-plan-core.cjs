const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dayjs = require("dayjs");

const parseDate = (value, label) => {
  if (!DATE_PATTERN.test(value || "")) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} is not a valid date`);
  }
  return date;
};

const formatDate = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const validateTime = (value, label) => {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !Number.isInteger(value[0]) ||
    !Number.isInteger(value[1]) ||
    value[0] < 0 ||
    value[0] > 23 ||
    value[1] < 0 ||
    value[1] > 59
  ) {
    throw new Error(`${label} must be an integer [hour, minute] pair`);
  }
};

const validatePlanDocument = (plan) => {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
    throw new Error("Plan must be a JSON object");
  }
  if (plan.version !== "fya-plan-v1") {
    throw new Error("version must be fya-plan-v1");
  }
  const weekFrom = parseDate(plan.week?.from, "week.from");
  const weekTo = parseDate(plan.week?.to, "week.to");
  if (weekFrom.getUTCDay() !== 1) {
    throw new Error("week.from must be Monday");
  }
  if (formatDate(addDays(weekFrom, 6)) !== formatDate(weekTo)) {
    throw new Error("week.to must be the following Sunday");
  }
  if (
    !Array.isArray(plan.big3) ||
    plan.big3.length < 1 ||
    plan.big3.length > 3 ||
    plan.big3.some((item) => typeof item !== "string" || !item.trim())
  ) {
    throw new Error("big3 must contain one to three non-empty strings");
  }
  if (!Array.isArray(plan.changes) || plan.changes.length > 100) {
    throw new Error("changes must be an array with at most 100 items");
  }

  const allowedKeys = new Set([
    "date",
    "activityId",
    "action",
    "startTime",
    "endTime",
    "isAllDay",
    "plannedMeasures",
    "tasks",
  ]);
  const uniqueChanges = new Set();
  plan.changes.forEach((change, index) => {
    if (!change || typeof change !== "object" || Array.isArray(change)) {
      throw new Error(`changes[${index}] must be an object`);
    }
    Object.keys(change).forEach((key) => {
      if (!allowedKeys.has(key)) {
        throw new Error(`changes[${index}].${key} is not allowed`);
      }
    });
    const date = parseDate(change.date, `changes[${index}].date`);
    if (date < weekFrom || date > weekTo) {
      throw new Error(`changes[${index}].date must be inside the declared week`);
    }
    if (
      typeof change.activityId !== "string" ||
      !/^[A-Za-z0-9_-]+$/.test(change.activityId)
    ) {
      throw new Error(`changes[${index}].activityId is invalid`);
    }
    if (change.action !== "plan" && change.action !== "unplan") {
      throw new Error(`changes[${index}].action must be plan or unplan`);
    }
    const changeKey = `${change.date}:${change.activityId}`;
    if (uniqueChanges.has(changeKey)) {
      throw new Error(`Duplicate change for ${changeKey}`);
    }
    uniqueChanges.add(changeKey);

    if (change.startTime !== undefined) {
      validateTime(change.startTime, `changes[${index}].startTime`);
    }
    if (change.endTime !== undefined) {
      validateTime(change.endTime, `changes[${index}].endTime`);
    }
    if (change.isAllDay !== undefined && typeof change.isAllDay !== "boolean") {
      throw new Error(`changes[${index}].isAllDay must be boolean`);
    }
    if (change.plannedMeasures !== undefined) {
      if (
        !change.plannedMeasures ||
        typeof change.plannedMeasures !== "object" ||
        Array.isArray(change.plannedMeasures)
      ) {
        throw new Error(`changes[${index}].plannedMeasures must be an object`);
      }
      Object.entries(change.plannedMeasures).forEach(([measureId, value]) => {
        if (!/^[A-Za-z0-9_-]+$/.test(measureId)) {
          throw new Error(`changes[${index}] contains an invalid measure ID`);
        }
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
          throw new Error(`changes[${index}].plannedMeasures values must be non-negative numbers`);
        }
      });
    }
    if (change.tasks !== undefined) {
      if (!Array.isArray(change.tasks) || change.tasks.length > 100) {
        throw new Error(`changes[${index}].tasks must be an array with at most 100 items`);
      }
      change.tasks.forEach((task, taskIndex) => {
        if (!task || typeof task.title !== "string" || !task.title.trim()) {
          throw new Error(`changes[${index}].tasks[${taskIndex}].title is required`);
        }
        if (task.time !== undefined) {
          validateTime(task.time, `changes[${index}].tasks[${taskIndex}].time`);
        }
      });
    }
  });

  return { weekFrom, weekTo };
};

const normalizeTime = (override, current, fallback) =>
  override || current || fallback || [0, 0];

const buildHistoryEntry = (change, definition, existing = {}) => {
  const isPlanning = change.action === "plan";
  if (definition.type === "habit") {
    const common = {
      ...existing,
      id: definition.id,
      type: "habit",
      valueType: definition.valueType,
      isAllDay:
        change.isAllDay ?? existing.isAllDay ?? definition.isAllDay ?? true,
      startTime: normalizeTime(change.startTime, existing.startTime, definition.startTime),
      endTime: normalizeTime(change.endTime, existing.endTime, definition.endTime),
      status: existing.status || "pending",
      progress: Number(existing.progress) || 0,
      isPlanned: isPlanning,
    };
    if (definition.valueType === "boolean") {
      return { ...common, measures: existing.measures || {} };
    }

    const allowedMeasures = new Set((definition.fields || []).map((field) => field.id));
    Object.keys(change.plannedMeasures || {}).forEach((measureId) => {
      if (!allowedMeasures.has(measureId)) {
        throw new Error(`Unknown measure ${measureId} for habit ${definition.title}`);
      }
    });
    const measures = { ...(existing.measures || {}) };
    (definition.fields || []).forEach((field) => {
      const current = measures[field.id] || {};
      measures[field.id] = {
        value: Number(current.value) || 0,
        plannedValue: isPlanning
          ? Number(change.plannedMeasures?.[field.id] ?? current.plannedValue ?? field.minToComplete ?? 0)
          : 0,
      };
    });
    return { ...common, measures };
  }

  if (definition.type !== "tasksGroup") {
    throw new Error(`Unsupported activity type for ${definition.id}`);
  }
  if (isPlanning && !change.tasks?.length && !existing.tasks?.length) {
    throw new Error(`Task group ${definition.title} needs explicit tasks`);
  }
  const tasks = [...(existing.tasks || [])];
  (change.tasks || []).forEach((newTask) => {
    const existingIndex = tasks.findIndex(
      (task) =>
        (newTask.id && task.id === newTask.id) ||
        task.title.trim().toLocaleLowerCase() ===
          newTask.title.trim().toLocaleLowerCase(),
    );
    const normalizedTask = {
      ...(existingIndex >= 0 ? tasks[existingIndex] : {}),
      ...newTask,
      title: newTask.title.trim(),
      description: newTask.description || "",
      time: newTask.time || [0, 0],
      status: existingIndex >= 0 ? tasks[existingIndex].status : "pending",
      isEditOn: false,
    };
    if (existingIndex >= 0) tasks[existingIndex] = normalizedTask;
    else tasks.push(normalizedTask);
  });
  const completed = tasks.filter((task) => task.status === "done").length;
  return {
    ...existing,
    id: definition.id,
    type: "tasksGroup",
    valueType: "todoList",
    isPlanned: isPlanning,
    tasks,
    progress: tasks.length ? (completed / tasks.length) * 100 : 0,
  };
};

const createMonthPatches = (plan, definitions, historyByMonth = {}) => {
  validatePlanDocument(plan);
  const patches = {};
  const preview = [];
  plan.changes.forEach((change) => {
    const definition = definitions.get(change.activityId);
    if (!definition || definition.isArchived) {
      throw new Error(`Activity ${change.activityId} does not exist or is archived`);
    }
    const monthId = change.date.slice(0, 7);
    const day = change.date.slice(8, 10);
    const existing = historyByMonth[monthId]?.[day]?.[change.activityId] || {};
    const entry = buildHistoryEntry(change, definition, existing);
    patches[monthId] ||= {
      unix: historyByMonth[monthId]?.unix ?? dayjs(monthId).unix(),
    };
    patches[monthId][day] ||= {};
    patches[monthId][day][change.activityId] = entry;
    preview.push({
      date: change.date,
      activityId: change.activityId,
      title: definition.title,
      action: change.action,
      type: definition.type,
    });
  });
  return { patches, preview };
};

module.exports = {
  addDays,
  buildHistoryEntry,
  createMonthPatches,
  formatDate,
  parseDate,
  validatePlanDocument,
};
