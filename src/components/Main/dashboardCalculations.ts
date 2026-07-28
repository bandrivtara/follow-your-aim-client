import dayjs, { Dayjs } from "dayjs";
import { IHabitData } from "types/habits.types";

export interface DashboardActivity {
  id: string;
  progress: number;
  source: Record<string, unknown>;
}

export interface DashboardDayData {
  date: string;
  label: string;
  progress: number;
  completed: number;
  total: number;
}

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

export const getDashboardActivityProgress = (activity: Record<string, any>) => {
  if (typeof activity.progress === "number") {
    return clampProgress(activity.progress);
  }

  if (Array.isArray(activity.tasks) && activity.tasks.length) {
    const completedTasks = activity.tasks.filter(
      (task: { status?: string }) => task.status === "done",
    ).length;
    return clampProgress((completedTasks / activity.tasks.length) * 100);
  }

  return activity.status === "done" ? 100 : 0;
};

const getMonthHistory = (history: Record<string, any>[], date: Dayjs) =>
  history.find((month) => {
    if (typeof month.unix !== "number") return false;
    return dayjs.unix(month.unix).format("YYYY-MM") === date.format("YYYY-MM");
  });

const getHabitAdjustedProgress = (
  activity: DashboardActivity,
  habit?: IHabitData,
) => {
  const primaryField = habit?.fields?.[0];
  if (habit?.valueType !== "measures" || !primaryField?.minToComplete) {
    return activity;
  }

  const measures = activity.source.measures as
    | Record<string, { value?: number | string }>
    | undefined;
  const measuredValue = Number(measures?.[primaryField.id]?.value || 0);
  return {
    ...activity,
    progress: Math.max(
      activity.progress,
      clampProgress((measuredValue / primaryField.minToComplete) * 100),
    ),
  };
};

export const getDashboardActivitiesForDate = (
  history: Record<string, any>[] = [],
  date: Dayjs,
  habits: IHabitData[] = [],
): DashboardActivity[] => {
  const month = getMonthHistory(history, date);
  if (!month) return [];

  const dayKeys = Array.from(new Set([date.format("D"), date.format("DD")]));
  const activities = new Map<string, DashboardActivity>();

  dayKeys.forEach((dayKey) => {
    const dayData = month[dayKey];
    if (!dayData || typeof dayData !== "object") return;

    Object.entries(dayData).forEach(([id, value]) => {
      if (!value || typeof value !== "object") return;
      const source = value as Record<string, unknown>;
      activities.set(id, {
        id,
        progress: getDashboardActivityProgress(source),
        source,
      });
    });
  });

  return Array.from(activities.values()).map((activity) =>
    getHabitAdjustedProgress(
      activity,
      habits.find((habit) => habit.id === activity.id),
    ),
  );
};

const getMonday = (date: Dayjs) =>
  date.startOf("day").subtract((date.day() + 6) % 7, "day");

export const getDashboardWeekData = (
  history: Record<string, any>[] = [],
  currentDate: Dayjs,
  habits: IHabitData[] = [],
): DashboardDayData[] => {
  const weekStart = getMonday(currentDate);
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  return labels.map((label, index) => {
    const date = weekStart.add(index, "day");
    const activities = getDashboardActivitiesForDate(history, date, habits);
    const totalProgress = activities.reduce(
      (sum, activity) => sum + activity.progress,
      0,
    );

    return {
      date: date.format("YYYY-MM-DD"),
      label,
      progress: activities.length
        ? Math.round(totalProgress / activities.length)
        : 0,
      completed: activities.filter((activity) => activity.progress >= 100)
        .length,
      total: activities.length,
    };
  });
};

export const getActivityStreak = (
  history: Record<string, any>[] = [],
  currentDate: Dayjs,
  maxDays = 90,
  habits: IHabitData[] = [],
) => {
  let cursor = currentDate.startOf("day");
  if (
    !getDashboardActivitiesForDate(history, cursor, habits).some(
      (activity) => activity.progress > 0,
    )
  ) {
    cursor = cursor.subtract(1, "day");
  }

  let streak = 0;
  while (streak < maxDays) {
    const hasActivity = getDashboardActivitiesForDate(
      history,
      cursor,
      habits,
    ).some((activity) => activity.progress > 0);
    if (!hasActivity) break;
    streak += 1;
    cursor = cursor.subtract(1, "day");
  }

  return streak;
};
