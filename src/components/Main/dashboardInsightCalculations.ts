import { Dayjs } from "dayjs";
import { IHabitData } from "types/habits.types";
import {
  DashboardActivity,
  getDashboardActivitiesForDate,
} from "./dashboardCalculations";
import { isMinuteUnit } from "./focusTimer";

const nonNegativeNumber = (value: unknown): number => {
  if (typeof value !== "number" && typeof value !== "string") return 0;
  const parsed = Number(
    typeof value === "string" ? value.replace(",", ".") : value,
  );
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export const getWeeklyRhythm = (
  history: Record<string, any>[],
  today: Dayjs,
  habits: IHabitData[],
) => {
  const monday = today.startOf("day").subtract((today.day() + 6) % 7, "day");
  return ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((label, index) => {
    const date = monday.add(index, "day");
    const isFuture = date.isAfter(today, "day");
    const activities = isFuture
      ? []
      : getDashboardActivitiesForDate(history, date, habits);
    const planned = activities.filter((activity) => activity.isPlanned);
    const equivalent = (items: DashboardActivity[]) =>
      items.reduce(
        (sum, activity) =>
          sum + Math.min(100, nonNegativeNumber(activity.progress)) / 100,
        0,
      );
    const totalPercent =
      !isFuture && planned.length
        ? Math.round((equivalent(activities) / planned.length) * 100)
        : null;
    const plannedPercent =
      totalPercent !== null
        ? Math.round((equivalent(planned) / planned.length) * 100)
        : null;
    return {
      date: date.format("YYYY-MM-DD"),
      label,
      isFuture,
      isToday: date.isSame(today, "day"),
      planned: planned.length,
      completedPlanned: planned.filter((activity) => activity.progress >= 100)
        .length,
      completed: activities.filter((activity) => activity.progress >= 100)
        .length,
      plannedPercent,
      bonusPercent:
        totalPercent !== null && plannedPercent !== null
          ? totalPercent - plannedPercent
          : null,
      totalPercent,
    };
  });
};

export interface DailyHabitMinutes {
  id: string;
  title: string;
  planned: number;
  actual: number;
}

export const getDailyHabitMinutes = (
  activities: DashboardActivity[],
  habits: IHabitData[],
): DailyHabitMinutes[] =>
  habits
    .flatMap((habit) => {
      if (habit.isHidden || habit.isArchived || habit.valueType !== "measures")
        return [];
      // One duration per habit: secondary minute fields must not double-count it.
      const field = habit.fields?.find(
        (item) => typeof item.unit === "string" && isMinuteUnit(item.unit),
      );
      const activity = activities.find((item) => item.id === habit.id);
      if (!field || !activity) return [];
      const measures = activity.source.measures as
        | Record<string, { value?: unknown; plannedValue?: unknown }>
        | undefined;
      const measure = measures?.[field.id];
      const planned = activity.isPlanned
        ? nonNegativeNumber(measure?.plannedValue ?? field.minToComplete)
        : 0;
      // Saved measurements only: neither a checkmark nor timer drafts imply minutes.
      const actual = nonNegativeNumber(measure?.value);
      return planned > 0 || actual > 0
        ? [{ id: habit.id, title: habit.title, planned, actual }]
        : [];
    })
    .sort(
      (a, b) =>
        b.planned - a.planned ||
        b.actual - a.actual ||
        a.title.localeCompare(b.title, "uk"),
    );
