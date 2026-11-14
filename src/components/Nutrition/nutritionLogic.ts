import dayjs from "dayjs";
import {
  NutritionDay,
  NutritionFreezerBatch,
  NutritionMeal,
  NutritionPrepSession,
  NutritionRecipe,
  NutritionShoppingTrip,
  NutritionTargets,
  NutritionWeek,
  StoredNutritionWeek,
} from "./nutritionTypes";

type JsonObject = Record<string, unknown>;

export const stripUndefinedValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedValues(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefinedValues(item)]),
    );
  }
  return value;
};

const isObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;

const asStringList = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => asString(item)).filter(Boolean)
    : [];

const requireDate = (value: unknown, label: string) => {
  const date = asString(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dayjs(date).isValid()) {
    throw new Error(`${label} має бути датою YYYY-MM-DD.`);
  }
  return date;
};

const parseMeal = (
  value: unknown,
  date: string,
  index: number,
): NutritionMeal => {
  if (!isObject(value)) throw new Error(`Некоректна страва для ${date}.`);
  const title = asString(value.title) || asString(value.name);
  if (!title) throw new Error(`Страва №${index + 1} для ${date} не має title.`);
  const sourceId = asString(value.id) || `${date}-meal-${index + 1}`;
  const status = ["pending", "eaten", "skipped"].includes(
    asString(value.status),
  )
    ? (asString(value.status) as NutritionMeal["status"])
    : "pending";
  return {
    id: `${date}-${sourceId}`,
    title,
    time: asString(value.time, "—"),
    calories: asNumber(value.calories),
    protein: asNumber(value.protein),
    fat: value.fat === undefined ? undefined : asNumber(value.fat),
    carbs: value.carbs === undefined ? undefined : asNumber(value.carbs),
    fiber: value.fiber === undefined ? undefined : asNumber(value.fiber),
    description: asString(value.description) || undefined,
    recipeId: asString(value.recipeId) || undefined,
    status,
    failureReason: asString(value.failureReason) || undefined,
  };
};

const parseRecipe = (value: unknown, index: number): NutritionRecipe => {
  if (!isObject(value)) throw new Error(`Некоректний рецепт №${index + 1}.`);
  const id = asString(value.id);
  const title = asString(value.title);
  if (!id || !title)
    throw new Error(`Рецепт №${index + 1} не має id або title.`);
  return {
    id,
    title,
    portions: Math.max(1, asNumber(value.portions, 1)),
    caloriesPerPortion:
      value.caloriesPerPortion === undefined
        ? undefined
        : asNumber(value.caloriesPerPortion),
    activeMinutes:
      value.activeMinutes === undefined
        ? undefined
        : asNumber(value.activeMinutes),
    totalMinutes:
      value.totalMinutes === undefined
        ? undefined
        : asNumber(value.totalMinutes),
    equipment: asStringList(value.equipment),
    ingredients: asStringList(value.ingredients),
    steps: asStringList(value.steps),
    storage: asStringList(value.storage),
    prepNotes: asStringList(value.prepNotes),
  };
};

const parseShoppingTrips = (value: unknown): NutritionShoppingTrip[] =>
  Array.isArray(value)
    ? value.map((rawTrip, tripIndex) => {
        if (!isObject(rawTrip)) {
          throw new Error(`Некоректний список закупів №${tripIndex + 1}.`);
        }
        const id = asString(rawTrip.id) || `trip-${tripIndex + 1}`;
        const rawItems = Array.isArray(rawTrip.items) ? rawTrip.items : [];
        return {
          id,
          title: asString(rawTrip.title, `Закупи №${tripIndex + 1}`),
          plannedDate: asString(rawTrip.plannedDate) || undefined,
          store: asString(rawTrip.store) || undefined,
          items: rawItems.map((rawItem, itemIndex) => {
            if (!isObject(rawItem)) {
              throw new Error(`Некоректна позиція закупів у «${id}».`);
            }
            const name = asString(rawItem.name);
            if (!name)
              throw new Error(`Позиція закупів у «${id}» не має name.`);
            return {
              id: asString(rawItem.id) || `${id}-item-${itemIndex + 1}`,
              name,
              quantity:
                rawItem.quantity === undefined
                  ? undefined
                  : asNumber(rawItem.quantity),
              unit: asString(rawItem.unit) || undefined,
              category: asString(rawItem.category) || undefined,
              estimatedPrice:
                rawItem.estimatedPrice === undefined
                  ? undefined
                  : asNumber(rawItem.estimatedPrice),
              checked: rawItem.checked === true,
            };
          }),
        };
      })
    : [];

const parsePrepSessions = (value: unknown): NutritionPrepSession[] =>
  Array.isArray(value)
    ? value.map((rawSession, sessionIndex) => {
        if (!isObject(rawSession)) {
          throw new Error(`Некоректна сесія заготовок №${sessionIndex + 1}.`);
        }
        const id = asString(rawSession.id) || `prep-${sessionIndex + 1}`;
        const rawTasks = Array.isArray(rawSession.tasks)
          ? rawSession.tasks
          : [];
        return {
          id,
          plannedDate: asString(rawSession.plannedDate) || undefined,
          plannedTime: asString(rawSession.plannedTime) || undefined,
          title: asString(rawSession.title, `Заготовки №${sessionIndex + 1}`),
          estimatedActiveMinutes:
            rawSession.estimatedActiveMinutes === undefined
              ? undefined
              : asNumber(rawSession.estimatedActiveMinutes),
          equipment: asStringList(rawSession.equipment),
          tasks: rawTasks.map((rawTask, taskIndex) => {
            if (!isObject(rawTask)) {
              throw new Error(`Некоректна задача заготовок у «${id}».`);
            }
            const title = asString(rawTask.title);
            if (!title) {
              throw new Error(`Задача заготовок у «${id}» не має title.`);
            }
            return {
              id: asString(rawTask.id) || `${id}-task-${taskIndex + 1}`,
              title,
              quantity:
                rawTask.quantity === undefined
                  ? undefined
                  : asNumber(rawTask.quantity),
              unit: asString(rawTask.unit) || undefined,
              destination: asString(rawTask.destination) || undefined,
              useDates: asStringList(rawTask.useDates),
              dependsOnShoppingTripId:
                asString(rawTask.dependsOnShoppingTripId) || undefined,
              checked: rawTask.checked === true,
            };
          }),
        };
      })
    : [];

const parseFreezerBatches = (value: unknown): NutritionFreezerBatch[] =>
  Array.isArray(value)
    ? value.map((rawBatch, batchIndex) => {
        if (!isObject(rawBatch)) {
          throw new Error(`Некоректна морозильна партія №${batchIndex + 1}.`);
        }
        const id = asString(rawBatch.id) || `freezer-${batchIndex + 1}`;
        const title = asString(rawBatch.title);
        if (!title) {
          throw new Error(`Морозильна партія «${id}» не має title.`);
        }
        const rawDefrostPlan = Array.isArray(rawBatch.defrostPlan)
          ? rawBatch.defrostPlan
          : [];
        return {
          id,
          recipeId: asString(rawBatch.recipeId) || undefined,
          title,
          plannedPrepDate: asString(rawBatch.plannedPrepDate) || undefined,
          totalPortions: asNumber(rawBatch.totalPortions),
          currentWeekPortions: asNumber(rawBatch.currentWeekPortions),
          reservePortions: asNumber(rawBatch.reservePortions),
          packSizePortions:
            rawBatch.packSizePortions === undefined
              ? undefined
              : asNumber(rawBatch.packSizePortions),
          defrostPlan: rawDefrostPlan.flatMap((rawStep) => {
            if (!isObject(rawStep)) return [];
            const moveToFridgeDate = asString(rawStep.moveToFridgeDate);
            const useDate = asString(rawStep.useDate);
            if (!moveToFridgeDate || !useDate) return [];
            return [
              {
                moveToFridgeDate,
                useDate,
                portions: asNumber(rawStep.portions),
              },
            ];
          }),
          finishAfterDefrost:
            asString(rawBatch.finishAfterDefrost) || undefined,
          inventoryStatus: asString(rawBatch.inventoryStatus) || undefined,
        };
      })
    : [];

export const parseNutritionPackage = (value: string): NutritionWeek => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Файл не є валідним JSON.");
  }
  if (!isObject(parsed))
    throw new Error("Коренем пакета має бути JSON-об’єкт.");
  const schemaVersion = asString(parsed.schemaVersion);
  if (!["fya-nutrition-v1", "fya-nutrition-v2"].includes(schemaVersion)) {
    throw new Error("Підтримуються лише fya-nutrition-v1 і fya-nutrition-v2.");
  }
  if (!isObject(parsed.plan)) throw new Error("У пакеті немає об’єкта plan.");
  const plan = parsed.plan;
  const weekStart = requireDate(plan.weekStart, "plan.weekStart");
  const weekEnd = requireDate(plan.weekEnd, "plan.weekEnd");
  if (dayjs(weekEnd).diff(dayjs(weekStart), "day") !== 6) {
    throw new Error("План має охоплювати рівно 7 днів.");
  }
  const rawDays = Array.isArray(plan.days) ? plan.days : [];
  if (rawDays.length !== 7) throw new Error("plan.days має містити 7 днів.");
  const expectedDates = Array.from({ length: 7 }, (_, index) =>
    dayjs(weekStart).add(index, "day").format("YYYY-MM-DD"),
  );
  const days: NutritionDay[] = rawDays.map((rawDay, index) => {
    if (!isObject(rawDay)) throw new Error(`Некоректний день №${index + 1}.`);
    const date = requireDate(rawDay.date, `plan.days[${index}].date`);
    if (date !== expectedDates[index]) {
      throw new Error(
        `Очікувалася дата ${expectedDates[index]}, отримано ${date}.`,
      );
    }
    const rawMeals = Array.isArray(rawDay.meals) ? rawDay.meals : [];
    return {
      date,
      note: asString(rawDay.note) || undefined,
      meals: rawMeals.map((meal, mealIndex) =>
        parseMeal(meal, date, mealIndex),
      ),
    };
  });
  const settings = isObject(parsed.settings) ? parsed.settings : {};
  const recipes = Array.isArray(plan.recipes)
    ? plan.recipes.map(parseRecipe)
    : Array.isArray(parsed.recipes)
      ? parsed.recipes.map(parseRecipe)
      : [];
  const shoppingSource =
    parsed.shoppingTrips ?? plan.shoppingTrips ?? parsed.shopping;
  const targets: NutritionTargets = {
    calories: asNumber(settings.calorieTarget),
    protein: asNumber(settings.proteinTarget),
    fat:
      settings.fatTarget === undefined
        ? undefined
        : asNumber(settings.fatTarget),
    carbs:
      settings.carbsTarget === undefined
        ? undefined
        : asNumber(settings.carbsTarget),
    fiber:
      settings.fiberTarget === undefined
        ? undefined
        : asNumber(settings.fiberTarget),
    saturatedFat:
      settings.saturatedFatTarget === undefined
        ? undefined
        : asNumber(settings.saturatedFatTarget),
  };
  return {
    schemaVersion: schemaVersion as NutritionWeek["schemaVersion"],
    weekStart,
    weekEnd,
    generatedAt: asString(plan.generatedAt) || asString(parsed.exportedAt),
    importedAt: new Date().toISOString(),
    targets,
    approvedProducts: asStringList(settings.approvedProducts),
    excludedProducts: asStringList(settings.excludedProducts),
    candidateProducts: asStringList(settings.candidateProducts),
    days,
    recipes,
    shoppingTrips: parseShoppingTrips(shoppingSource),
    prepSessions: parsePrepSessions(parsed.prepSessions),
    freezerBatches: parseFreezerBatches(parsed.freezerBatches),
  };
};

export const mergeNutritionProgress = (
  incoming: NutritionWeek,
  current?: StoredNutritionWeek,
): NutritionWeek => {
  if (!current || current.weekStart !== incoming.weekStart) return incoming;
  const mealProgress = new Map(
    current.days.flatMap((day) =>
      day.meals.map((meal) => [meal.id, meal] as const),
    ),
  );
  const shoppingProgress = new Map(
    (current.shoppingTrips || []).flatMap((trip) =>
      trip.items.map(
        (item) => [`${trip.id}:${item.id}`, item.checked] as const,
      ),
    ),
  );
  const prepProgress = new Map(
    (current.prepSessions || []).flatMap((session) =>
      session.tasks.map(
        (task) => [`${session.id}:${task.id}`, task.checked] as const,
      ),
    ),
  );
  return {
    ...incoming,
    days: incoming.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => {
        const previous = mealProgress.get(meal.id);
        return previous
          ? {
              ...meal,
              status: previous.status,
              failureReason: previous.failureReason,
            }
          : meal;
      }),
    })),
    shoppingTrips: incoming.shoppingTrips.map((trip) => ({
      ...trip,
      items: trip.items.map((item) => ({
        ...item,
        checked: shoppingProgress.get(`${trip.id}:${item.id}`) ?? item.checked,
      })),
    })),
    prepSessions: incoming.prepSessions.map((session) => ({
      ...session,
      tasks: session.tasks.map((task) => ({
        ...task,
        checked: prepProgress.get(`${session.id}:${task.id}`) ?? task.checked,
      })),
    })),
  };
};

export const sumNutritionMeals = (meals: NutritionMeal[]) =>
  meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      protein: total.protein + meal.protein,
      fat: total.fat + (meal.fat || 0),
      carbs: total.carbs + (meal.carbs || 0),
      fiber: total.fiber + (meal.fiber || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
  );

export const calculateShoppingProgress = (trips: NutritionShoppingTrip[]) => {
  const items = trips.flatMap((trip) => trip.items);
  return {
    checked: items.filter((item) => item.checked).length,
    total: items.length,
    estimatedPrice: items.reduce(
      (total, item) => total + (item.estimatedPrice || 0),
      0,
    ),
  };
};
