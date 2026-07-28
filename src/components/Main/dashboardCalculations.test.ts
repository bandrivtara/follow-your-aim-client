import dayjs from "dayjs";
import {
  getActivityStreak,
  getDashboardActivitiesForDate,
  getDashboardActivityProgress,
  getDashboardWeekData,
} from "./dashboardCalculations";

const julyHistory = {
  unix: dayjs("2026-07").unix(),
  "27": {
    habitA: { progress: 100 },
  },
  "28": {
    habitA: { progress: 100 },
    tasks: { tasks: [{ status: "done" }, { status: "pending" }] },
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
});
