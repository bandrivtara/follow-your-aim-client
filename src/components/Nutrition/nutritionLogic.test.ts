import {
  calculateShoppingProgress,
  mergeNutritionProgress,
  parseNutritionPackage,
  stripUndefinedValues,
  sumNutritionMeals,
} from "./nutritionLogic";
import { StoredNutritionWeek } from "./nutritionTypes";

const makePackage = () =>
  JSON.stringify({
    schemaVersion: "fya-nutrition-v2",
    exportedAt: "2026-11-14T12:00:00.000Z",
    settings: {
      calorieTarget: 2000,
      proteinTarget: 155,
      fiberTarget: 32,
    },
    plan: {
      weekStart: "2026-11-16",
      weekEnd: "2026-11-22",
      generatedAt: "2026-11-14T12:00:00.000Z",
      days: Array.from({ length: 7 }, (_, index) => ({
        date: "2026-11-" + String(16 + index).padStart(2, "0"),
        meals:
          index === 0
            ? [
                {
                  id: "breakfast",
                  title: "Сніданок",
                  time: "09:00",
                  calories: 430,
                  protein: 30,
                  recipeId: "breakfast",
                },
              ]
            : [],
      })),
      recipes: [
        {
          id: "breakfast",
          title: "Сніданок",
          portions: 1,
          ingredients: ["skyr"],
          steps: ["Змішати"],
        },
      ],
    },
    shoppingTrips: [
      {
        id: "weekend",
        title: "Основні закупи",
        items: [
          {
            id: "skyr",
            name: "Skyr",
            quantity: 2,
            unit: "шт",
            estimatedPrice: 8,
          },
        ],
      },
    ],
    prepSessions: [
      {
        id: "main-prep",
        plannedDate: "2026-11-15",
        plannedTime: "12:00",
        title: "Основна підготовка",
        estimatedActiveMinutes: 60,
        equipment: ["аерогриль"],
        tasks: [
          {
            id: "shape-cutlets",
            title: "Сформувати котлети",
            quantity: 10,
            unit: "шт",
            destination: "freezer",
            useDates: ["2026-11-17"],
          },
        ],
      },
    ],
    freezerBatches: [
      {
        id: "cutlets-batch",
        title: "Котлети",
        plannedPrepDate: "2026-11-15",
        totalPortions: 10,
        currentWeekPortions: 4,
        reservePortions: 6,
        packSizePortions: 2,
        defrostPlan: [
          {
            moveToFridgeDate: "2026-11-16",
            useDate: "2026-11-17",
            portions: 2,
          },
        ],
      },
    ],
  });

describe("nutritionLogic", () => {
  it("parses the Health package into a normalized week", () => {
    const week = parseNutritionPackage(makePackage());
    expect(week.weekStart).toBe("2026-11-16");
    expect(week.days).toHaveLength(7);
    expect(week.days[0].meals[0]).toMatchObject({
      id: "2026-11-16-breakfast",
      status: "pending",
      calories: 430,
    });
    expect(week.recipes).toHaveLength(1);
    expect(week.shoppingTrips).toHaveLength(1);
    expect(week.prepSessions[0].tasks[0]).toMatchObject({
      id: "shape-cutlets",
      checked: false,
    });
    expect(week.freezerBatches[0]).toMatchObject({
      id: "cutlets-batch",
      reservePortions: 6,
    });
  });

  it("rejects a package that is not exactly seven ordered days", () => {
    const invalid = JSON.parse(makePackage());
    invalid.plan.days[1].date = "2026-11-30";
    expect(() => parseNutritionPackage(JSON.stringify(invalid))).toThrow(
      "Очікувалася дата",
    );
  });

  it("keeps execution and shopping progress on reimport", () => {
    const incoming = parseNutritionPackage(makePackage());
    const current: StoredNutritionWeek = {
      ...incoming,
      id: incoming.weekStart,
      updatedAt: 1,
      days: incoming.days.map((day, index) =>
        index === 0
          ? {
              ...day,
              meals: day.meals.map((meal) => ({
                ...meal,
                status: "eaten" as const,
              })),
            }
          : day,
      ),
      shoppingTrips: incoming.shoppingTrips.map((trip) => ({
        ...trip,
        items: trip.items.map((item) => ({ ...item, checked: true })),
      })),
      prepSessions: incoming.prepSessions.map((session) => ({
        ...session,
        tasks: session.tasks.map((task) => ({ ...task, checked: true })),
      })),
    };
    const merged = mergeNutritionProgress(incoming, current);
    expect(merged.days[0].meals[0].status).toBe("eaten");
    expect(merged.shoppingTrips[0].items[0].checked).toBe(true);
    expect(merged.prepSessions[0].tasks[0].checked).toBe(true);
  });

  it("sums meal macros and shopping state", () => {
    const week = parseNutritionPackage(makePackage());
    expect(sumNutritionMeals(week.days[0].meals)).toMatchObject({
      calories: 430,
      protein: 30,
    });
    expect(calculateShoppingProgress(week.shoppingTrips)).toEqual({
      checked: 0,
      total: 1,
      estimatedPrice: 8,
    });
  });

  it("removes undefined values before a Firestore write", () => {
    expect(
      stripUndefinedValues({
        title: "План",
        optional: undefined,
        meals: [{ title: "Сніданок", fat: undefined }],
      }),
    ).toEqual({ title: "План", meals: [{ title: "Сніданок" }] });
  });
});
