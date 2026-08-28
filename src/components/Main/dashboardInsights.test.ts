import dayjs from "dayjs";
import { IHabitData } from "types/habits.types";
import { DashboardActivity } from "./dashboardCalculations";
import { getDailyHabitMinutes, getWeeklyRhythm } from "./dashboardInsightCalculations";

const habit: IHabitData = {
  id: "english",
  title: "Англійська",
  type: "habit",
  valueType: "measures",
  isAllDay: false,
  startTime: [7, 0],
  endTime: [7, 30],
  fields: [
    { id: "time", name: "Час", unit: "хв", minToComplete: 30, orderIndex: 0 },
  ],
};
const activity = (
  measures: Record<string, unknown> = {},
  isPlanned = true,
): DashboardActivity => ({
  id: "english",
  progress: 100,
  isPlanned,
  source: { measures, status: "done" },
});

describe("weekly rhythm", () => {
  const today = dayjs("2026-08-26");
  const month = (data: Record<string, unknown>) => [
    { unix: today.startOf("month").unix(), ...data },
  ];
  test("splits partial planned progress and bonus without capping the total", () => {
    const result = getWeeklyRhythm(
      month({
        "26": {
          a: { progress: 100, isPlanned: true },
          b: { progress: 50, isPlanned: true },
          c: { progress: 100, isPlanned: false },
        },
      }),
      today,
      [],
    )[2];
    expect(result).toMatchObject({
      plannedPercent: 75,
      bonusPercent: 50,
      totalPercent: 125,
      completedPlanned: 1,
      planned: 2,
      isToday: true,
    });
  });
  test("distinguishes future, no-plan and genuine zero completion", () => {
    const result = getWeeklyRhythm(
      month({
        "24": { a: { progress: 0, isPlanned: true } },
        "25": { a: { progress: 100, isPlanned: false } },
        "27": { a: { progress: 100, isPlanned: true } },
      }),
      today,
      [],
    );
    expect(result[0].totalPercent).toBe(0);
    expect(result[1]).toMatchObject({
      totalPercent: null,
      completed: 1,
      isFuture: false,
    });
    expect(result[3]).toMatchObject({
      totalPercent: null,
      plannedPercent: null,
      bonusPercent: null,
      isFuture: true,
    });
  });
  test("reads across month boundaries and padded legacy day keys", () => {
    const result = getWeeklyRhythm(
      [
        {
          unix: dayjs("2026-08-01").unix(),
          "31": { a: { status: "done", isPlanned: true } },
        },
        {
          unix: dayjs("2026-09-01").unix(),
          "1": { a: { progress: 0, isPlanned: true } },
          "01": { a: { status: "done", isPlanned: true } },
        },
      ],
      dayjs("2026-09-02"),
      [],
    );
    expect(result[0].totalPercent).toBe(100);
    expect(result[1].totalPercent).toBe(100);
  });
  test("handles malformed progress without NaN", () => {
    const result = getWeeklyRhythm(
      month({ "26": { a: { progress: NaN, isPlanned: true } } }),
      today,
      [],
    );
    expect(result[2].totalPercent).toBe(0);
  });
});

describe("daily habit minutes", () => {
  test("uses the daily target, preserving measured time above the target", () => {
    expect(
      getDailyHabitMinutes(
        [activity({ time: { plannedValue: "15", value: "22,5" } })],
        [habit],
      ),
    ).toEqual([
      { id: "english", title: "Англійська", planned: 15, actual: 22.5 },
    ]);
  });
  test("falls back to the habit target but never infers time from completion", () => {
    expect(getDailyHabitMinutes([activity()], [habit])[0]).toMatchObject({
      planned: 30,
      actual: 0,
    });
  });
  test("does not invent planned minutes for unplanned activity", () => {
    expect(
      getDailyHabitMinutes(
        [activity({ time: { plannedValue: 30, value: 10 } }, false)],
        [habit],
      )[0],
    ).toMatchObject({ planned: 0, actual: 10 });
  });
  test("respects an explicit zero daily target", () => {
    expect(
      getDailyHabitMinutes(
        [activity({ time: { plannedValue: 0, value: 10 } })],
        [habit],
      )[0].planned,
    ).toBe(0);
  });
  test("skips absent, hidden, archived and non-minute habits", () => {
    expect(getDailyHabitMinutes([], [habit])).toEqual([]);
    for (const excluded of [
      { ...habit, isHidden: true },
      { ...habit, isArchived: true },
      { ...habit, fields: [{ ...habit.fields![0], unit: "км" }] },
    ]) {
      expect(getDailyHabitMinutes([activity()], [excluded])).toEqual([]);
    }
  });
  test("accepts supported minute units and counts only one duration per habit", () => {
    const multiple = {
      ...habit,
      fields: [
        { ...habit.fields![0], unit: "minutes" },
        { ...habit.fields![0], id: "other" },
      ],
    };
    expect(
      getDailyHabitMinutes(
        [activity({ time: { value: 10 }, other: { value: 20 } })],
        [multiple],
      )[0].actual,
    ).toBe(10);
  });
  test.each([-1, Infinity, "invalid", null, {}])(
    "rejects invalid recorded minutes %p",
    (value) => {
      expect(
        getDailyHabitMinutes([activity({ time: { value } })], [habit])[0]
          .actual,
      ).toBe(0);
    },
  );
});
