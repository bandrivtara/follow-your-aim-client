import dayjs from "dayjs";
import {
  buildNutritionDayDraft,
  calculateNutritionTotals,
  isNutritionHabitTitle,
  parseNutritionBundle,
} from "./nutritionUtils";

describe("nutrition utilities", () => {
  it("parses the versioned import contract", () => {
    const bundle = parseNutritionBundle(
      JSON.stringify({
        schemaVersion: "fya-nutrition-v1",
        settings: { calorieTarget: 2000 },
        plan: {
          schemaVersion: "fya-nutrition-v1",
          weekStart: "2026-11-16",
          weekEnd: "2026-11-22",
          days: [],
          recipes: [],
        },
      }),
    );
    expect(bundle.settings.calorieTarget).toBe(2000);
  });

  it("parses v2 meals and preserves portion gram details", () => {
    const bundle = parseNutritionBundle(
      JSON.stringify({
        schemaVersion: "fya-nutrition-v2",
        settings: { calorieTarget: 2000 },
        plan: {
          schemaVersion: "fya-nutrition-v2",
          weekStart: "2026-11-16",
          weekEnd: "2026-11-22",
          days: [{
            date: "2026-11-16",
            meals: [{
              id: "breakfast",
              title: "Вівсяноблин",
              time: "09:00",
              calories: 430,
              protein: 32,
              fat: 13,
              carbs: 48,
              portionDescription: "Вівсянка 50 г сухої; яйце 50 г.",
            }],
          }],
          recipes: [{
            id: "oat-pancake",
            title: "Вівсяноблин",
            portions: 1,
            ingredients: ["вівсянка 50 г"],
            batchIngredients: ["вівсянка 50 г"],
            portionDescription: "Одна порція.",
            steps: ["Приготувати."],
          }],
        },
      }),
    );
    expect(bundle.plan.days[0].meals[0].portionDescription).toContain("50 г");
    expect(bundle.plan.recipes[0].batchIngredients).toEqual(["вівсянка 50 г"]);
  });

  it("preserves meal execution while refreshing the plan", () => {
    const draft = buildNutritionDayDraft(
      dayjs("2026-11-16"),
      {
        date: "2026-11-16",
        meals: [{ id: "breakfast", title: "Сніданок", time: "09:00", calories: 400 }],
      },
      {
        date: "2026-11-16",
        targetCalories: 2000,
        meals: [{ id: "breakfast", title: "Старий", time: "09:00", calories: 390, status: "eaten" }],
      },
      2000,
    );
    expect(draft.meals[0]).toMatchObject({ title: "Старий", status: "eaten" });
  });

  it("counts only eaten meals", () => {
    expect(
      calculateNutritionTotals([
        { id: "1", title: "A", time: "09:00", calories: 400, protein: 30, status: "eaten" },
        { id: "2", title: "B", time: "12:00", calories: 200, protein: 20, status: "skipped" },
      ]),
    ).toMatchObject({ calories: 400, protein: 30, eaten: 1, skipped: 1 });
  });

  it("recognizes the nutrition tracker row", () => {
    expect(isNutritionHabitTitle("Харчування без ручного дублювання")).toBe(true);
  });
});
