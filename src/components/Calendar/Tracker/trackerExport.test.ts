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
                { title: "Забрати посилку", status: "pending", time: [19, 0] },
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
          id: "reflection",
          title: "5 цілей і 5 подяк",
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
    });

    expect(report).toContain("Виконання плану: 100%");
    expect(report).toContain("Купити продукти");
    expect(report).toContain("Забрати посилку");
    expect(report).toContain("Обсяг: факт 1000 мл; план 2000 мл");
    expect(report).toContain("5 ЦІЛЕЙ");
    expect(report).toContain("Завершити важливу задачу");
    expect(report).toContain("# Промпт для AI-аналізу");
    expect(report).toContain("Що заважає");
  });
});
