import dayjs from "dayjs";
import { buildTrackerExport } from "./trackerExport";

describe("tracker export", () => {
  it("includes plan performance, task-list details and the AI prompt", () => {
    const report = buildTrackerExport({
      dateFrom: dayjs("2026-07-28"),
      dateTo: dayjs("2026-07-28"),
      history: [
        {
          unix: dayjs("2026-07").unix(),
          "28": {
            water: {
              measures: { amount: { plannedValue: 2000, value: 1000 } },
              progress: 50,
            },
            errands: {
              isPlanned: true,
              tasks: [
                { title: "Купити продукти", status: "done", time: [18, 0] },
                {
                  title: "Забрати посилку",
                  status: "failed",
                  time: [19, 0],
                  failureReason: "Поштомат був недоступний",
                },
              ],
              progress: 50,
            },
            bonus: { isPlanned: false, status: "done", progress: 100 },
            reflection: {
              isPlanned: true,
              status: "done",
              progress: 100,
              note: "5 ЦІЛЕЙ\n1. Завершити важливу задачу",
            },
            workout: {
              isPlanned: true,
              status: "failed",
              progress: 0,
              failureReason: "Погано спав",
            },
          },
        },
      ],
      habits: [
        {
          id: "water",
          title: "Вода",
          type: "habit",
          valueType: "measures",
          fields: [{ id: "amount", name: "Обсяг", unit: "мл" }],
        } as any,
        {
          id: "bonus",
          title: "Додаткова прогулянка",
          type: "habit",
          valueType: "boolean",
        } as any,
        {
          id: "workout",
          title: "Тренування",
          type: "habit",
          valueType: "boolean",
        } as any,
        {
          id: "reflection",
          title: "Ранковий компас",
          type: "habit",
          valueType: "boolean",
        } as any,
      ],
      taskGroups: [
        {
          id: "errands",
          title: "Справи",
          type: "tasksGroup",
          valueType: "todoList",
        } as any,
      ],
      dailyReviews: [
        {
          id: "2026-07",
          unix: dayjs("2026-07").unix(),
          "28": {
            date: "2026-07-28",
            mood: 4,
            energy: 3,
            answers: {},
            summary:
              "СТАН: Спокійний.\nПЕРЕМОГИ: Виконав основне.\nФОКУС ЗАВТРА: Почати з англійської.",
            updatedAt: 1,
          },
        },
      ],
    });

    expect(report).toContain("Виконання плану: 75%");
    expect(report).toContain("Купити продукти");
    expect(report).toContain("Забрати посилку");
    expect(report).toContain("причина невиконання: Поштомат був недоступний");
    expect(report).toContain("Причина невиконання: Погано спав");
    expect(report).toContain("Обсяг: факт 1000 мл; план 2000 мл");
    expect(report).toContain("5 ЦІЛЕЙ");
    expect(report).toContain("Завершити важливу задачу");
    expect(report).toContain("Настрій: 4/5 · енергія: 3/5");
    expect(report).toContain("ФОКУС ЗАВТРА: Почати з англійської");
    expect(report).toContain("# Промпт для AI-аналізу");
    expect(report).toContain("Що заважає");
    expect(report).toContain("Факт → Спостереження → Гіпотеза → Рекомендація");
  });

  it("includes legacy daily-review answers and marks missing reviews", () => {
    const report = buildTrackerExport({
      dateFrom: dayjs("2026-07-28"),
      dateTo: dayjs("2026-07-29"),
      history: [],
      habits: [],
      taskGroups: [],
      dailyReviews: [
        {
          id: "2026-07",
          "28": {
            date: "2026-07-28",
            mood: 2,
            energy: 1,
            answers: { blockers: "Погано спав." },
            updatedAt: 1,
          },
        },
      ],
      includePrompt: false,
    });

    expect(report).toContain("Настрій: 2/5 · енергія: 1/5");
    expect(report).toContain("Погано спав.");
    expect(report).toContain("Щоденного огляду немає.");
  });
});
