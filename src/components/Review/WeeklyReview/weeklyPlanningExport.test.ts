import dayjs from "dayjs";
import { buildWeeklyPlanningExport } from "./weeklyPlanningExport";

describe("weekly planning export", () => {
  it("includes four-week facts, goals, unfinished work, future plan and protocol", () => {
    const report = buildWeeklyPlanningExport({
      lastWeekFrom: dayjs("2026-08-17"),
      lastWeekTo: dayjs("2026-08-23"),
      history: [
        {
          unix: dayjs("2026-08").unix(),
          "17": {
            tasks: {
              id: "tasks",
              type: "tasksGroup",
              valueType: "todoList",
              isPlanned: true,
              tasks: [{ title: "Перенести мене", status: "pending" }],
              progress: 0,
            },
            habit: {
              id: "habit",
              type: "habit",
              valueType: "boolean",
              isPlanned: true,
              progress: 100,
              status: "done",
              note: "5 ЦІЛЕЙ\n1. Завершити головну задачу",
            },
          },
          "24": {
            habit: {
              id: "habit",
              type: "habit",
              valueType: "boolean",
              isPlanned: true,
              progress: 0,
            },
          },
        },
      ],
      habits: [
        {
          id: "habit",
          title: "Англійська",
          type: "habit",
          valueType: "boolean",
          isAllDay: true,
          startTime: [],
          endTime: [],
        },
      ],
      taskGroups: [
        {
          id: "tasks",
          title: "Проєкт",
          description: "",
          type: "tasksGroup",
          valueType: "todoList",
        },
      ],
      aims: [
        {
          id: "aim",
          title: "Завершити проєкт",
          description: "",
          complexity: 1,
          dateFrom: "2026-08-01",
          dateTo: "2026-09-01",
          progress: 40,
          value: 0,
          aimType: "number",
          calculationType: "sum",
          isRelatedWithHabit: false,
          finalAim: 1,
          startedPoint: 0,
          relatedHabit: [],
          relatedList: [],
        },
      ],
      reviewMonths: [],
    });

    expect(report).toContain("останніх чотирьох тижнів");
    expect(report).toContain("Завершити проєкт: 40%");
    expect(report).toContain("Перенести мене");
    expect(report).toContain("Завершити головну задачу");
    expect(report).toContain("Уже заплановано на наступний тиждень");
    expect(report).toContain("Fact → Observation → Hypothesis → Recommendation");
    expect(report).toContain("fya-plan-v1");
  });
});
