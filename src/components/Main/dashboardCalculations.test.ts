import dayjs from "dayjs";
import {
  getActivityStreak,
  getDashboardActivitiesForDate,
  getDashboardActivityProgress,
  getDashboardPlanPerformance,
  getDashboardLifeBalance,
  getDashboardWeekData,
  isDashboardActivityPlanned,
} from "./dashboardCalculations";

const julyHistory = {
  unix: dayjs("2026-07").unix(),
  "27": {
    habitA: { progress: 100, isPlanned: true },
  },
  "28": {
    habitA: { progress: 100, isPlanned: true },
    tasks: {
      isPlanned: true,
      tasks: [{ status: "done" }, { status: "pending" }],
    },
  },
};

describe("dashboard calculations", () => {
  it("derives progress from explicit progress, tasks and status", () => {
    expect(getDashboardActivityProgress({ progress: 120 })).toBe(100);
    expect(
      getDashboardActivityProgress({
        tasks: [{ status: "done" }, { status: "pending" }],
      }),
    ).toBe(50);
    expect(getDashboardActivityProgress({ status: "done" })).toBe(100);
  });

  it("derives measured progress from the current habit target", () => {
    const activities = getDashboardActivitiesForDate(
      [
        {
          unix: dayjs("2026-07").unix(),
          "28": {
            water: {
              progress: 0,
              measures: { measure: { value: 500 } },
            },
          },
        },
      ],
      dayjs("2026-07-28"),
      [
        {
          id: "water",
          type: "habit",
          valueType: "measures",
          fields: [{ id: "measure", minToComplete: 2500 }],
        } as any,
      ],
    );

    expect(activities[0].progress).toBe(20);
  });

  it("prefers the value planned for the selected day over the habit default", () => {
    const activities = getDashboardActivitiesForDate(
      [
        {
          unix: dayjs("2026-07").unix(),
          "28": {
            water: {
              progress: 0,
              measures: {
                measure: { value: 500, plannedValue: 1000 },
              },
            },
          },
        },
      ],
      dayjs("2026-07-28"),
      [
        {
          id: "water",
          type: "habit",
          valueType: "measures",
          fields: [{ id: "measure", minToComplete: 2500 }],
        } as any,
      ],
    );

    expect(activities[0].progress).toBe(50);
    expect(activities[0].isPlanned).toBe(true);
  });

  it("recognizes explicit, measured and legacy task-list plans", () => {
    expect(isDashboardActivityPlanned({ isPlanned: true })).toBe(true);
    expect(
      isDashboardActivityPlanned({
        measures: { weight: { plannedValue: 98 } },
      }),
    ).toBe(true);
    expect(isDashboardActivityPlanned({ tasks: [{ title: "План" }] })).toBe(
      true,
    );
    expect(
      isDashboardActivityPlanned({
        isPlanned: false,
        tasks: [{ title: "Поза планом" }],
      }),
    ).toBe(false);
  });

  it("uses planned activities as 100% and allows completed extras above it", () => {
    const performance = getDashboardPlanPerformance([
      { id: "a", progress: 100, isPlanned: true, source: {} },
      { id: "b", progress: 50, isPlanned: true, source: {} },
      { id: "c", progress: 100, isPlanned: false, source: {} },
    ]);

    expect(performance.progress).toBe(125);
    expect(performance.planned).toBe(2);
    expect(performance.completedPlanned).toBe(1);
    expect(performance.completedOutsidePlan).toBe(1);
  });

  it("reads padded and unpadded day keys without duplicating activities", () => {
    const history = [
      {
        unix: dayjs("2026-07").unix(),
        "8": { habitA: { progress: 50 } },
        "08": { habitA: { progress: 100 }, habitB: { progress: 0 } },
      },
    ];

    const activities = getDashboardActivitiesForDate(
      history,
      dayjs("2026-07-08"),
    );
    expect(activities).toHaveLength(2);
    expect(activities.find(({ id }) => id === "habitA")?.progress).toBe(100);
  });

  it("builds a Monday-to-Sunday completion chart", () => {
    const week = getDashboardWeekData([julyHistory], dayjs("2026-07-28"));

    expect(week.map(({ label }) => label)).toEqual([
      "Пн",
      "Вт",
      "Ср",
      "Чт",
      "Пт",
      "Сб",
      "Нд",
    ]);
    expect(week[0].progress).toBe(100);
    expect(week[1].progress).toBe(75);
  });

  it("counts consecutive active days including yesterday when today is empty", () => {
    expect(getActivityStreak([julyHistory], dayjs("2026-07-29"))).toBe(2);
  });

  it("compares planned and actual weekly life-area effort", () => {
    const history = [
      {
        unix: dayjs("2026-07").unix(),
        "27": {
          health: { progress: 100, isPlanned: true },
          learning: { progress: 50, isPlanned: true },
          recovery: { progress: 100, isPlanned: false },
        },
      },
    ];
    const habits = [
      {
        id: "health",
        lifeArea: "health",
        complexity: 8,
        type: "habit",
        title: "Спорт",
      },
      {
        id: "learning",
        lifeArea: "learning",
        complexity: 2,
        type: "habit",
        title: "Навчання",
      },
      {
        id: "recovery",
        lifeArea: "recovery",
        complexity: 5,
        type: "habit",
        title: "Відпочинок",
      },
    ] as any;

    const balance = getDashboardLifeBalance(
      history,
      dayjs("2026-07-27"),
      habits,
    );

    expect(balance.find(({ id }) => id === "health")).toMatchObject({
      plannedShare: 80,
      actualShare: 57,
      completion: 100,
    });
    expect(balance.find(({ id }) => id === "learning")).toMatchObject({
      plannedShare: 20,
      actualShare: 7,
      completion: 50,
    });
    expect(balance.find(({ id }) => id === "recovery")).toMatchObject({
      plannedShare: 0,
      actualShare: 36,
      completion: 100,
    });
  });
});
