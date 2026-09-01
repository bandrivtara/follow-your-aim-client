import dayjs, { Dayjs } from "dayjs";
import { IHabitData } from "types/habits.types";
import { ITask, ITasksGroup } from "types/taskGroups";
import { IDailyReviewMonth } from "types/dailyReview.types";
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

export interface DashboardAgendaItem {
  id: string;
  activityId: string;
  kind: "habit" | "task";
  valueType?: "boolean" | "measures" | "todoList";
  taskIndex?: number;
  title: string;
  parentTitle?: string;
  category?: string;
  progress: number;
  status?: string;
  startTime?: Array<number | string>;
  endTime?: Array<number | string>;
  isAllDay: boolean;
  source: Record<string, any>;
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

export interface RecoveryHabitData {
  id: string;
  title: string;
  todayIsPlanned: boolean;
  startTime?: Array<number | string>;
}

export interface DashboardReviewDayData {
  date: string;
  label: string;
  mood: number | null;
  energy: number | null;
}

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

const isTimeValue = (value: unknown): value is Array<number | string> =>
  Array.isArray(value) &&
  value.length >= 2 &&
  value[0] !== "" &&
  value[1] !== "" &&
  Number.isFinite(Number(value[0])) &&
  Number.isFinite(Number(value[1]));

const getTimeInMinutes = (value?: Array<number | string>) =>
  isTimeValue(value) ? Number(value[0]) * 60 + Number(value[1]) : null;

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
      const candidate = {
        id,
        progress: getDashboardActivityProgress(source),
        source,
        isPlanned: isDashboardActivityPlanned(source),
      };
      const existing = activities.get(id);

      // Some legacy first-of-month writes used `1` while the plan used `01`.
      // Keep the more complete value so a pending canonical plan cannot hide a
      // completion that was already recorded under the legacy key.
      if (!existing || candidate.progress >= existing.progress) {
        activities.set(id, candidate);
      }
    });
  });

  return Array.from(activities.values()).map((activity) =>
    getHabitAdjustedProgress(
      activity,
      habits.find((habit) => habit.id === activity.id),
    ),
  );
};

export const getCompletedHabitDaysInMonth = (
  history: Record<string, any>[] = [],
  currentDate: Dayjs,
  habitId: string,
  habits: IHabitData[] = [],
) => {
  if (!habitId) return 0;

  const lastDay = currentDate.endOf("day");
  let cursor = currentDate.startOf("month");
  let completedDays = 0;

  while (!cursor.isAfter(lastDay, "day")) {
    const activity = getDashboardActivitiesForDate(
      history,
      cursor,
      habits,
    ).find(({ id }) => id === habitId);
    if (activity && activity.progress >= 100) completedDays += 1;
    cursor = cursor.add(1, "day");
  }

  return completedDays;
};

export const getDashboardAgendaItems = (
  activities: DashboardActivity[] = [],
  habits: IHabitData[] = [],
  taskGroups: ITasksGroup[] = [],
): DashboardAgendaItem[] => {
  const habitById = new Map(
    habits
      .filter((habit) => !habit.isHidden && !habit.isArchived)
      .map((habit) => [habit.id, habit]),
  );
  const taskGroupById = new Map(
    taskGroups
      .filter((taskGroup) => !taskGroup.isHidden)
      .map((taskGroup) => [taskGroup.id, taskGroup]),
  );
  const agenda: DashboardAgendaItem[] = [];

  activities
    .filter((activity) => activity.isPlanned)
    .forEach((activity) => {
      const source = activity.source as Record<string, any>;
      const habit = habitById.get(activity.id);
      if (habit) {
        const startTime = isTimeValue(source.startTime)
          ? source.startTime
          : isTimeValue(habit.startTime)
            ? habit.startTime
            : undefined;
        const endTime = isTimeValue(source.endTime)
          ? source.endTime
          : isTimeValue(habit.endTime)
            ? habit.endTime
            : undefined;

        agenda.push({
          id: activity.id,
          activityId: activity.id,
          kind: "habit",
          valueType: habit.valueType,
          title: habit.title,
          progress: activity.progress,
          status: source.status,
          startTime,
          endTime,
          isAllDay: Boolean(source.isAllDay ?? habit.isAllDay ?? !startTime),
          source,
        });
        return;
      }

      const taskGroup = taskGroupById.get(activity.id);
      if (!taskGroup) return;
      const tasks = Array.isArray(source.tasks)
        ? (source.tasks as ITask[])
        : [];
      if (!tasks.length) {
        agenda.push({
          id: activity.id,
          activityId: activity.id,
          kind: "task",
          valueType: "todoList",
          title: taskGroup.title,
          progress: activity.progress,
          status: source.status,
          isAllDay: true,
          source,
        });
        return;
      }

      tasks.forEach((task, index) => {
        const startTime = isTimeValue(task.time) ? task.time : undefined;
        agenda.push({
          id: `${activity.id}:${task.id || index}`,
          activityId: activity.id,
          kind: "task",
          valueType: "todoList",
          taskIndex: index,
          title: task.title,
          parentTitle: taskGroup.title,
          category: task.category,
          progress: task.status === "done" ? 100 : 0,
          status: task.status,
          startTime,
          isAllDay: !startTime,
          source,
        });
      });
    });

  return agenda.sort((left, right) => {
    const leftMinutes = getTimeInMinutes(left.startTime);
    const rightMinutes = getTimeInMinutes(right.startTime);
    if (leftMinutes !== null && rightMinutes !== null) {
      return leftMinutes - rightMinutes;
    }
    if (leftMinutes !== null) return -1;
    if (rightMinutes !== null) return 1;
    if (left.kind !== right.kind) return left.kind === "habit" ? -1 : 1;
    return left.title.localeCompare(right.title, "uk");
  });
};

export const getPendingDashboardAgendaItems = (
  items: DashboardAgendaItem[] = [],
  limit = Number.POSITIVE_INFINITY,
) => items.filter((item) => item.progress < 100).slice(0, limit);

const getMonday = (date: Dayjs) =>
  date.startOf("day").subtract((date.day() + 6) % 7, "day");

export const getDashboardReviewWeekData = (
  reviewMonths: IDailyReviewMonth[] = [],
  currentDate: Dayjs,
): DashboardReviewDayData[] => {
  const weekStart = getMonday(currentDate);
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  return labels.map((label, index) => {
    const date = weekStart.add(index, "day");
    const monthId = date.format("YYYY-MM");
    const month = reviewMonths.find(
      (candidate) =>
        candidate.id === monthId ||
        (typeof candidate.unix === "number" &&
          dayjs.unix(candidate.unix).format("YYYY-MM") === monthId),
    );
    const review = month?.[date.format("DD")] || month?.[date.format("D")];
    const mood =
      review && typeof review === "object" && Number.isFinite(review.mood)
        ? Math.min(5, Math.max(1, Number(review.mood)))
        : null;
    const energy =
      review && typeof review === "object" && Number.isFinite(review.energy)
        ? Math.min(5, Math.max(1, Number(review.energy)))
        : null;

    return {
      date: date.format("YYYY-MM-DD"),
      label,
      mood,
      energy,
    };
  });
};

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

export const getRecoveryHabits = (
  yesterdayActivities: DashboardActivity[] = [],
  todayActivities: DashboardActivity[] = [],
  habits: IHabitData[] = [],
): RecoveryHabitData[] => {
  const missedIds = new Set(
    yesterdayActivities
      .filter((activity) => activity.isPlanned && activity.progress < 100)
      .map((activity) => activity.id),
  );
  const todayById = new Map(todayActivities.map((activity) => [activity.id, activity]));

  return habits
    .filter(
      (habit) =>
        missedIds.has(habit.id) &&
        !habit.isArchived &&
        !habit.isHidden &&
        (todayById.get(habit.id)?.progress || 0) < 100,
    )
    .map((habit) => ({
      id: habit.id,
      title: habit.title,
      todayIsPlanned: Boolean(todayById.get(habit.id)?.isPlanned),
      startTime: isTimeValue(habit.startTime) ? habit.startTime : undefined,
    }))
    .sort((left, right) => {
      if (left.todayIsPlanned !== right.todayIsPlanned) {
        return left.todayIsPlanned ? -1 : 1;
      }
      return (getTimeInMinutes(left.startTime) ?? Number.MAX_SAFE_INTEGER) -
        (getTimeInMinutes(right.startTime) ?? Number.MAX_SAFE_INTEGER);
    });
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
      .filter((habit) => !habit.isArchived && !habit.isHidden && habit.lifeArea)
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
