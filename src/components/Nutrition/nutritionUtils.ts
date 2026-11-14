import dayjs, { Dayjs } from "dayjs";
import {
  INutritionDayLog,
  INutritionImportBundle,
  INutritionMeal,
  INutritionPlanDay,
  INutritionRecipe,
  INutritionWeekPlan,
} from "types/nutrition.types";

export const getNutritionWeekStart = (date: Dayjs) =>
  date.startOf("day").subtract((date.day() + 6) % 7, "day");

export const isNutritionHabitTitle = (title?: string) =>
  String(title || "")
    .trim()
    .toLocaleLowerCase("uk-UA")
    .includes("харчування");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const parseNutritionBundle = (source: string): INutritionImportBundle => {
  const value: unknown = JSON.parse(source);
  if (!isRecord(value) || value.schemaVersion !== "fya-nutrition-v1") {
    throw new Error("Файл повинен мати schemaVersion fya-nutrition-v1.");
  }
  if (!isRecord(value.settings) || !isRecord(value.plan)) {
    throw new Error("У файлі відсутні settings або plan.");
  }
  const plan = value.plan as unknown as INutritionWeekPlan;
  if (
    plan.schemaVersion !== "fya-nutrition-v1" ||
    !dayjs(plan.weekStart, "YYYY-MM-DD", true).isValid() ||
    !dayjs(plan.weekEnd, "YYYY-MM-DD", true).isValid() ||
    !Array.isArray(plan.days) ||
    !Array.isArray(plan.recipes)
  ) {
    throw new Error("План має неправильний тиждень, days або recipes.");
  }
  if (!Number.isFinite(Number(value.settings.calorieTarget))) {
    throw new Error("settings.calorieTarget має бути числом.");
  }
  return value as unknown as INutritionImportBundle;
};

export const getPlanDay = (plan: INutritionWeekPlan | null, date: Dayjs) =>
  plan?.days.find((day) => day.date === date.format("YYYY-MM-DD"));

const normalizeMeal = (meal: INutritionMeal): INutritionMeal => ({
  ...meal,
  calories: Number(meal.calories) || 0,
  protein: Number(meal.protein) || 0,
  status: meal.status || "pending",
});

export const buildNutritionDayDraft = (
  date: Dayjs,
  planDay: INutritionPlanDay | undefined,
  existing: INutritionDayLog | null,
  calorieTarget: number,
): INutritionDayLog => {
  const existingById = new Map((existing?.meals || []).map((meal) => [meal.id, meal]));
  const plannedMeals = (planDay?.meals || []).map((meal) =>
    normalizeMeal({ ...meal, ...existingById.get(meal.id) }),
  );
  const plannedIds = new Set(plannedMeals.map((meal) => meal.id));
  const manualMeals = (existing?.meals || [])
    .filter((meal) => !plannedIds.has(meal.id))
    .map(normalizeMeal);
  return {
    ...existing,
    date: date.format("YYYY-MM-DD"),
    targetCalories: Number(existing?.targetCalories || calorieTarget || 2000),
    meals: [...plannedMeals, ...manualMeals],
  };
};

export const calculateNutritionTotals = (meals: INutritionMeal[] = []) => {
  const eaten = meals.filter((meal) => meal.status === "eaten");
  return {
    calories: eaten.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0),
    protein: eaten.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0),
    eaten: eaten.length,
    skipped: meals.filter((meal) => meal.status === "skipped").length,
    pending: meals.filter((meal) => !meal.status || meal.status === "pending").length,
  };
};

export const hasMissingSkipReason = (meals: INutritionMeal[] = []) =>
  meals.some(
    (meal) => meal.status === "skipped" && !meal.skippedReason?.trim(),
  );

export const buildNutritionAnalysisExport = (options: {
  plan: INutritionWeekPlan;
  logs: INutritionDayLog[];
  trainingDays: string[];
}) => {
  const { plan, logs, trainingDays } = options;
  return {
    schemaVersion: "fya-nutrition-report-v1",
    exportedAt: new Date().toISOString(),
    period: { from: plan.weekStart, to: plan.weekEnd },
    trainingDays,
    days: plan.days.map((day) => {
      const log = logs.find((item) => item.date === day.date);
      const totals = calculateNutritionTotals(log?.meals || []);
      return {
        date: day.date,
        targetCalories: log?.targetCalories,
        ...totals,
        meals: log?.meals || day.meals,
        comment: log?.dailyComment || "",
      };
    }),
  };
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const printDocument = (title: string, body: string) => {
  const popup = window.open("", "_blank");
  if (!popup) throw new Error("Браузер заблокував вікно друку.");
  popup.opener = null;
  popup.document.write(`<!doctype html><html lang="uk"><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;color:#1f2937;margin:32px;line-height:1.45}h1{margin-bottom:4px}h2{margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:6px}.meal{margin:6px 0}.meta{color:#64748b}.recipe{break-inside:avoid;margin-bottom:24px}ul,ol{padding-left:22px}</style></head><body>${body}<script>window.onload=()=>window.print();</script></body></html>`);
  popup.document.close();
};

export const printWeeklyNutritionPlan = (plan: INutritionWeekPlan) => {
  const body = [
    `<h1>Раціон на тиждень</h1><div class="meta">${escapeHtml(plan.weekStart)} — ${escapeHtml(plan.weekEnd)}</div>`,
    ...plan.days.map(
      (day) =>
        `<h2>${escapeHtml(dayjs(day.date).format("DD.MM.YYYY"))}</h2>${
          day.meals.length
            ? day.meals
                .map(
                  (meal) =>
                    `<div class="meal"><strong>${escapeHtml(meal.time)} · ${escapeHtml(meal.title)}</strong> — ${escapeHtml(meal.calories)} ккал${meal.description ? `<br/><span class="meta">${escapeHtml(meal.description)}</span>` : ""}</div>`,
                )
                .join("")
            : "<div>План не заповнений.</div>"
        }`,
    ),
  ].join("");
  printDocument("Раціон на тиждень", body);
};

export const printNutritionRecipes = (recipes: INutritionRecipe[]) => {
  const body = [
    "<h1>Короткі рецепти</h1>",
    ...recipes.map(
      (recipe) =>
        `<section class="recipe"><h2>${escapeHtml(recipe.title)}</h2><div class="meta">${recipe.portions ? `${escapeHtml(recipe.portions)} порц.` : ""}${recipe.caloriesPerPortion ? ` · ${escapeHtml(recipe.caloriesPerPortion)} ккал/порц.` : ""}</div><h3>Інгредієнти</h3><ul>${recipe.ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h3>Як готувати</h3><ol>${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>`,
    ),
  ].join("");
  printDocument("Короткі рецепти", body);
};

export const downloadJson = (value: unknown, fileName: string) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const buildTelegramPlanText = (plan: INutritionWeekPlan) =>
  [
    `Раціон ${plan.weekStart} — ${plan.weekEnd}`,
    ...plan.days.map(
      (day) =>
        `${dayjs(day.date).format("DD.MM")}: ${day.meals.map((meal) => `${meal.time} ${meal.title}`).join("; ") || "без плану"}`,
    ),
  ].join("\n");
