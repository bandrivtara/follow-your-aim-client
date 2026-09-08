import dayjs from "dayjs";
import {
  buildNutritionPrompt,
  createWeek,
  parseNutritionPlan,
  splitList,
  sumMeals,
} from "./nutritionLogic";
import { DEFAULT_PREFERENCES } from "./nutritionTypes";

describe("nutritionLogic", () => {
  test("creates a Monday to Sunday week", () => {
    const week = createWeek(dayjs("2026-09-07"));
    expect(week).toHaveLength(7);
    expect(week[0].date).toBe("2026-09-07");
    expect(week[6].date).toBe("2026-09-13");
  });

  test("normalizes preference lists", () => {
    expect(splitList("курка, рис\n броколі, ")).toEqual([
      "курка",
      "рис",
      "броколі",
    ]);
  });

  test("sums missing macros as zero", () => {
    expect(
      sumMeals([
        { name: "Сніданок", meal: "breakfast", calories: 400, protein: 25 },
        { name: "Обід", meal: "lunch", calories: 600, fat: 20, carbs: 70 },
      ]),
    ).toEqual({ calories: 1000, protein: 25, fat: 20, carbs: 70 });
  });

  test("validates and orders an imported plan by expected dates", () => {
    const dates = ["2026-09-07", "2026-09-08"];
    const plan = parseNutritionPlan(
      JSON.stringify([
        {
          date: "2026-09-08",
          meals: [
            {
              name: "Омлет",
              meal: "breakfast",
              calories: 420,
              protein: 30,
            },
          ],
        },
      ]),
      dates,
    );
    expect(plan[0]).toEqual({ date: "2026-09-07", meals: [] });
    expect(plan[1].meals[0].name).toBe("Омлет");
  });

  test("rejects dates outside the selected week", () => {
    expect(() =>
      parseNutritionPlan(
        '[{"date":"2026-09-20","meals":[]}]',
        ["2026-09-07"],
      ),
    ).toThrow("не входить");
  });

  test("includes targets and preferences in the AI prompt", () => {
    const prompt = buildNutritionPrompt(
      {
        ...DEFAULT_PREFERENCES,
        targets: { calories: 2000, protein: 140, fat: 60, carbs: 220 },
        likedFoods: ["лосось"],
      },
      createWeek(dayjs("2026-09-07")),
    );
    expect(prompt).toContain("2000 ккал");
    expect(prompt).toContain("лосось");
    expect(prompt).toContain("ЛИШЕ JSON-масив");
  });
});
