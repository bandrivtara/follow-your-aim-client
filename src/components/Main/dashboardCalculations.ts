import dayjs, { Dayjs } from "dayjs";
import { IHabitData } from "types/habits.types";
import { LIFE_AREAS, LifeAreaId } from "config/lifeAreas";

export interface DashboardActivity {
  id: string;
  progress: number;
  source: Record<string, unknown>;
  isPlanned: boolean;
}

export interface DashboardDayData {
  date: string;
  label: string;
  progress: number;
  completed: number;
  total: number;
  planned: number;
  completedPlanned: number;
  completedOutsidePlan: number;
}

export interface LifeBalanceAreaData {
  id: LifeAreaId;
  title: string;
  shortTitle: string;
  color: string;
  plannedPoints: number;
  actualPoints: number;
  plannedShare: number;
  actualShare: number;
  completion: number;
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

export const isDashboardActivityPlanned = (activity: Record<string, any>) => {
  if (typeof activity.isPlanned === "boolean") {
    return activity.isPlanned;
  }

  if (
    activity.measures &&
    Object.values(activity.measures).some(
      (measure: any) => Number(measure?.plannedValue) > 0,
    )
  ) {
    return true;
  }

  // Legacy task-group history did not persist isPlanned. Existing task lists
  // therefore remain part of the plan unless a newer entry explicitly says no.
  return Array.isArray(activity.tasks) && activity.tasks.length > 0;
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
    | Record<
        string,
        { value?: number | string; plannedValue?: number | string }
      >
    | undefined;
  const measuredValue = Number(measures?.[primaryField.id]?.value || 0);
  const dailyPlannedValue = Number(
    measures?.[primaryField.id]?.plannedValue || 0,
  );
  const targetValue = dailyPlannedValue || primaryField.minToComplete;
  return {
    ...activity,
    progress: Math.max(
      activity.progress,
      clampProgress((measuredValue / targetValue) * 100),
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
        isPlanned: isDashboardActivityPlanned(source),
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

export const getDashboardPlanPerformance = (
  activities: DashboardActivity[],
) => {
  const plannedActivities = activities.filter(({ isPlanned }) => isPlanned);
  const completedEquivalent = activities.reduce(
    (sum, activity) => sum + clampProgress(activity.progress) / 100,
    0,
  );

  return {
    progress: plannedActivities.length
      ? Math.round((completedEquivalent / plannedActivities.length) * 100)
      : 0,
    planned: plannedActivities.length,
    completedPlanned: plannedActivities.filter(
      (activity) => activity.progress >= 100,
    ).length,
    completedOutsidePlan: activities.filter(
      (activity) => !activity.isPlanned && activity.progress >= 100,
    ).length,
    completed: activities.filter((activity) => activity.progress >= 100).length,
    total: activities.length,
  };
};

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
    const performance = getDashboardPlanPerformance(activities);

    return {
      date: date.format("YYYY-MM-DD"),
      label,
      ...performance,
    };
  });
};

export const getDashboardLifeBalance = (
  history: Record<string, any>[] = [],
  currentDate: Dayjs,
  habits: IHabitData[] = [],
): LifeBalanceAreaData[] => {
  const weekStart = getMonday(currentDate);
  const habitById = new Map(
    habits
      .filter(
        (habit) => !habit.isArchived && !habit.isHidden && habit.lifeArea,
      )
      .map((habit) => [habit.id, habit]),
  );
  const values = new Map<
    LifeAreaId,
    { plannedPoints: number; actualPoints: number }
  >();

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const activities = getDashboardActivitiesForDate(
      history,
      weekStart.add(dayIndex, "day"),
      habits,
    );
    activities.forEach((activity) => {
      const habit = habitById.get(activity.id);
      if (!habit?.lifeArea) return;
      const weight = Math.min(10, Math.max(1, Number(habit.complexity) || 5));
      const current = values.get(habit.lifeArea) || {
        plannedPoints: 0,
        actualPoints: 0,
      };
      if (activity.isPlanned) current.plannedPoints += weight;
      current.actualPoints += weight * (clampProgress(activity.progress) / 100);
      values.set(habit.lifeArea, current);
    });
  }

  const totalPlanned = Array.from(values.values()).reduce(
    (sum, value) => sum + value.plannedPoints,
    0,
  );
  const totalActual = Array.from(values.values()).reduce(
    (sum, value) => sum + value.actualPoints,
    0,
  );

  return LIFE_AREAS.map((area) => {
    const value = values.get(area.id) || {
      plannedPoints: 0,
      actualPoints: 0,
    };
    return {
      ...area,
      ...value,
      plannedShare: totalPlanned
        ? Math.round((value.plannedPoints / totalPlanned) * 100)
        : 0,
      actualShare: totalActual
        ? Math.round((value.actualPoints / totalActual) * 100)
        : 0,
      completion: value.plannedPoints
        ? Math.round((value.actualPoints / value.plannedPoints) * 100)
        : value.actualPoints > 0
          ? 100
          : 0,
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
