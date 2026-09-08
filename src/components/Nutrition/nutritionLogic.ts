import dayjs from "dayjs";
import {
  MacroTargets,
  NutritionPlanDay,
  NutritionPreferences,
  PlannedMeal,
} from "./nutritionTypes";

export const splitList = (value: string): string[] =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const sumMeals = (meals: PlannedMeal[]): MacroTargets =>
  meals.reduce(
    (total, meal) => ({
      calories: total.calories + (meal.calories || 0),
      protein: total.protein + (meal.protein || 0),
      fat: total.fat + (meal.fat || 0),
      carbs: total.carbs + (meal.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

export const createWeek = (start = dayjs().startOf("week").add(1, "day")):
  NutritionPlanDay[] =>
  Array.from({ length: 7 }, (_, index) => ({
    date: start.add(index, "day").format("YYYY-MM-DD"),
    meals: [],
  }));

const formatList = (values: string[]) =>
  values.length ? values.join(", ") : "не вказано";

export const buildNutritionPrompt = (
  preferences: NutritionPreferences,
  week: NutritionPlanDay[],
) => `Ти — помічник із планування харчування. Створи практичний план на 7 днів.

Моя ціль: ${preferences.goalNote || "не вказано"}
Денна ціль: ${preferences.targets.calories || "?"} ккал; білки ${preferences.targets.protein || "?"} г; жири ${preferences.targets.fat || "?"} г; вуглеводи ${preferences.targets.carbs || "?"} г.
Люблю продукти: ${formatList(preferences.likedFoods)}.
Не люблю / не хочу: ${formatList(preferences.dislikedFoods)}.
Люблю страви: ${formatList(preferences.likedMeals)}.
Не люблю страви: ${formatList(preferences.dislikedMeals)}.
Дати: ${week.map((day) => day.date).join(", ")}.

Вимоги:
- тримай денні калорії та БЖВ якомога ближче до цілей;
- не використовуй небажані продукти й страви;
- повторюй інгредієнти розумно, щоб закупи й приготування були простими;
- не став медичний діагноз і явно познач припущення щодо порцій;
- поверни ЛИШЕ JSON-масив без Markdown у форматі:
[{"date":"YYYY-MM-DD","meals":[{"name":"Назва і порція","meal":"breakfast|lunch|dinner|other","calories":0,"protein":0,"fat":0,"carbs":0}]}]`;

export const parseNutritionPlan = (
  value: string,
  expectedDates: string[],
): NutritionPlanDay[] => {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("План має бути JSON-масивом.");

  const allowedMeals = new Set(["breakfast", "lunch", "dinner", "other"]);
  const days = parsed.map((item): NutritionPlanDay => {
    if (!item || typeof item !== "object") throw new Error("Некоректний день у плані.");
    const day = item as Record<string, unknown>;
    if (typeof day.date !== "string" || !expectedDates.includes(day.date)) {
      throw new Error(`Дата ${String(day.date)} не входить у вибраний тиждень.`);
    }
    if (!Array.isArray(day.meals)) throw new Error(`Для ${day.date} немає meals.`);
    const meals = day.meals.map((raw): PlannedMeal => {
      if (!raw || typeof raw !== "object") throw new Error("Некоректна страва.");
      const meal = raw as Record<string, unknown>;
      if (typeof meal.name !== "string" || !meal.name.trim())
        throw new Error("Кожна страва повинна мати name.");
      if (typeof meal.meal !== "string" || !allowedMeals.has(meal.meal))
        throw new Error(`Некоректний meal для «${meal.name}».`);
      const result: PlannedMeal = {
        name: meal.name.trim(),
        meal: meal.meal as PlannedMeal["meal"],
      };
      (["calories", "protein", "fat", "carbs"] as const).forEach((key) => {
        const number = meal[key];
        if (number !== undefined && (typeof number !== "number" || number < 0))
          throw new Error(`${key} для «${meal.name}» має бути невід'ємним числом.`);
        if (typeof number === "number") result[key] = number;
      });
      return result;
    });
    return { date: day.date, meals };
  });

  const byDate = new Map(days.map((day) => [day.date, day]));
  return expectedDates.map((date) => byDate.get(date) || { date, meals: [] });
};
