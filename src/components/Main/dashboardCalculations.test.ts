import dayjs from "dayjs";
import {
  getActivityStreak,
  getDashboardActivitiesForDate,
  getDashboardActivityProgress,
  getDashboardAgendaItems,
  getCompletedHabitDaysInMonth,
  getPendingDashboardAgendaItems,
  getDashboardPlanPerformance,
  getDashboardLifeBalance,
  getDashboardReviewWeekData,
  getRecoveryHabits,
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

  it("does not let a pending padded plan hide a legacy completion", () => {
    const history = [
      {
        unix: dayjs("2026-09").unix(),
        "1": { meditation: { progress: 120, status: "done" } },
        "01": {
          meditation: { progress: 0, status: "pending", isPlanned: true },
        },
      },
    ];

    const activities = getDashboardActivitiesForDate(
      history,
      dayjs("2026-09-01"),
    );

    expect(activities).toHaveLength(1);
    expect(activities[0].progress).toBe(100);
  });

  it("counts completed office days in the current month through today", () => {
    const history = [
      {
        unix: dayjs("2026-08").unix(),
        "01": { office: { status: "done" } },
        "2": { office: { progress: 100 } },
        "03": { office: { progress: 50 } },
        "28": { office: { progress: 100 } },
      },
    ];

    expect(
      getCompletedHabitDaysInMonth(
        history,
        dayjs("2026-08-26"),
        "office",
      ),
    ).toBe(2);
  });

  it("builds a daily agenda from planned habits and concrete list tasks", () => {
    const agenda = getDashboardAgendaItems(
      [
        {
          id: "morning",
          progress: 50,
          isPlanned: true,
          source: {},
        },
        {
          id: "errands",
          progress: 50,
          isPlanned: true,
          source: {
            tasks: [
              { id: "later", title: "Купити воду", status: "pending" },
              {
                id: "meeting",
                title: "Зустріч",
                status: "done",
                time: [18, 0],
              },
            ],
          },
        },
        {
          id: "bonus",
          progress: 100,
          isPlanned: false,
          source: {},
        },
      ],
      [
        {
          id: "morning",
          title: "Ранкова рутина",
          startTime: [6, 10],
          endTime: [7, 0],
          isAllDay: false,
        } as any,
        { id: "bonus", title: "Бонус", isAllDay: true } as any,
      ],
      [{ id: "errands", title: "Справи", type: "tasksGroup" } as any],
    );

    expect(agenda.map(({ title }) => title)).toEqual([
      "Ранкова рутина",
      "Зустріч",
      "Купити воду",
    ]);
    expect(agenda[1]).toMatchObject({
      kind: "task",
      parentTitle: "Справи",
      progress: 100,
      startTime: [18, 0],
    });
    expect(agenda[2].isAllDay).toBe(true);
  });

  it("moves the next pending item into the visible agenda after completion", () => {
    const items = [
      { id: "1", progress: 100 },
      { id: "2", progress: 0 },
      { id: "3", progress: 50 },
      { id: "4", progress: 0 },
      { id: "5", progress: 0 },
    ] as any;

    expect(
      getPendingDashboardAgendaItems(items, 3).map(({ id }) => id),
    ).toEqual(["2", "3", "4"]);
    expect(getPendingDashboardAgendaItems(items).map(({ id }) => id)).toEqual([
      "2",
      "3",
      "4",
      "5",
    ]);
  });

  it("removes failed items from the remaining daily agenda", () => {
    expect(
      getPendingDashboardAgendaItems([
        {
          id: "failed",
          activityId: "failed",
          kind: "habit",
          title: "Пропущено",
          progress: 0,
          status: "failed",
          isAllDay: true,
          source: {},
        },
        {
          id: "pending",
          activityId: "pending",
          kind: "habit",
          title: "Наступне",
          progress: 0,
          status: "pending",
          isAllDay: true,
          source: {},
        },
      ]),
    ).toHaveLength(1);
  });

  it("treats a task without a selected time as an all-day item", () => {
    const [item] = getDashboardAgendaItems(
      [
        {
          id: "inbox",
          progress: 0,
          isPlanned: true,
          source: {
            tasks: [
              {
                id: "task",
                title: "Без часу",
                status: "pending",
                time: ["", ""],
              },
            ],
          },
        },
      ],
      [],
      [{ id: "inbox", title: "Справи", type: "tasksGroup" } as any],
    );

    expect(item).toMatchObject({ title: "Без часу", isAllDay: true });
    expect(item.startTime).toBeUndefined();
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

  it("builds a cross-month mood and energy week from daily reviews", () => {
    const week = getDashboardReviewWeekData(
      [
        {
          id: "2026-07",
          unix: dayjs("2026-07").unix(),
          "31": { mood: 3, energy: 2 } as any,
        },
        {
          id: "2026-08",
          unix: dayjs("2026-08").unix(),
          "01": { mood: 4, energy: 5 } as any,
        },
      ],
      dayjs("2026-08-01"),
    );

    expect(week).toHaveLength(7);
    expect(week[4]).toMatchObject({
      date: "2026-07-31",
      mood: 3,
      energy: 2,
    });
    expect(week[5]).toMatchObject({
      date: "2026-08-01",
      mood: 4,
      energy: 5,
    });
    expect(week[6].mood).toBeNull();
  });

  it("counts consecutive active days including yesterday when today is empty", () => {
    expect(getActivityStreak([julyHistory], dayjs("2026-07-29"))).toBe(2);
  });

  it("suggests active missed habits until they are recovered today", () => {
    const recovery = getRecoveryHabits(
      [
        { id: "english", progress: 0, isPlanned: true, source: {} },
        { id: "meditation", progress: 50, isPlanned: true, source: {} },
        { id: "walk", progress: 100, isPlanned: true, source: {} },
      ],
      [
        { id: "meditation", progress: 0, isPlanned: true, source: {} },
        { id: "english", progress: 100, isPlanned: true, source: {} },
      ],
      [
        { id: "english", title: "Англійська", type: "habit" },
        {
          id: "meditation",
          title: "Медитація",
          type: "habit",
          startTime: [6, 25],
        },
        { id: "walk", title: "Ходьба", type: "habit" },
      ] as any,
    );

    expect(recovery).toEqual([
      {
        id: "meditation",
        title: "Медитація",
        todayIsPlanned: true,
        startTime: [6, 25],
      },
    ]);
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
