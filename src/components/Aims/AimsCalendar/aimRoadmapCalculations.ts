import dayjs, { Dayjs } from "dayjs";
import { IAimData } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import {
  getRelatedHabitValuesBetweenDates,
  IHistoryMonthSnapshot,
} from "./AimCellRenderer/aimHistoryCalculations";
import {
  calculateTargetProgress,
  calculateTaskGroupProgress,
  getAimProgressDateTo,
} from "./AimCellRenderer/aimProgressCalculations";
import entityIds from "config/habitsIds.json";
import { getPlannerConsistencyValues } from "./plannerConsistencyCalculations";

export type AimPaceStatus =
  | "completed"
  | "upcoming"
  | "overdue"
  | "attention"
  | "onTrack";

export interface IAimTrendPoint {
  date: string;
  value: number;
}

export interface IAimProgressSnapshot {
  currentValue: number;
  progress: number;
  expectedProgress: number;
  status: AimPaceStatus;
  trend: IAimTrendPoint[];
}

export interface IAimTimelinePosition {
  left: number;
  width: number;
}

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const clampProgress = (progress: number) =>
  Math.max(0, Math.min(100, progress));

export const getExpectedAimProgress = (
  aim: IAimData,
  currentDate: Dayjs = dayjs(),
) => {
  const dateFrom = dayjs(aim.dateFrom).startOf("day");
  const dateTo = dayjs(aim.dateTo).startOf("day");
  const today = currentDate.startOf("day");

  if (!dateFrom.isValid() || !dateTo.isValid() || dateTo.isBefore(dateFrom)) {
    return 0;
  }
  if (today.isBefore(dateFrom)) return 0;
  if (!today.isBefore(dateTo)) return 100;

  const durationDays = Math.max(1, dateTo.diff(dateFrom, "day"));
  return clampProgress((today.diff(dateFrom, "day") / durationDays) * 100);
};

export const getAimPaceStatus = (
  aim: IAimData,
  progress: number,
  expectedProgress: number,
  currentDate: Dayjs = dayjs(),
): AimPaceStatus => {
  const dateFrom = dayjs(aim.dateFrom).startOf("day");
  const dateTo = dayjs(aim.dateTo).startOf("day");
  const today = currentDate.startOf("day");

  if (progress >= 100) return "completed";
  if (dateFrom.isValid() && today.isBefore(dateFrom)) return "upcoming";
  if (dateTo.isValid() && today.isAfter(dateTo)) return "overdue";
  if (progress + 12 < expectedProgress) return "attention";
  return "onTrack";
};

export const getAimTimelinePosition = (
  aim: IAimData,
  rangeFrom: Dayjs,
  rangeTo: Dayjs,
): IAimTimelinePosition | null => {
  const timelineFrom = rangeFrom.startOf("day");
  const timelineTo = rangeTo.endOf("day");
  const aimFrom = dayjs(aim.dateFrom).startOf("day");
  const aimTo = dayjs(aim.dateTo).endOf("day");

  if (
    !aimFrom.isValid() ||
    !aimTo.isValid() ||
    aimTo.isBefore(timelineFrom) ||
    aimFrom.isAfter(timelineTo)
  ) {
    return null;
  }

  const visibleFrom = aimFrom.isBefore(timelineFrom) ? timelineFrom : aimFrom;
  const visibleTo = aimTo.isAfter(timelineTo) ? timelineTo : aimTo;
  const totalDays = Math.max(1, timelineTo.diff(timelineFrom, "day") + 1);
  const left = (visibleFrom.diff(timelineFrom, "day") / totalDays) * 100;
  const width = ((visibleTo.diff(visibleFrom, "day") + 1) / totalDays) * 100;

  return {
    left: clampProgress(left),
    width: Math.max(1.5, Math.min(100 - left, width)),
  };
};

export const getTodayTimelinePosition = (
  rangeFrom: Dayjs,
  rangeTo: Dayjs,
  currentDate: Dayjs = dayjs(),
) => {
  const timelineFrom = rangeFrom.startOf("day");
  const timelineTo = rangeTo.endOf("day");
  const today = currentDate.startOf("day");

  if (today.isBefore(timelineFrom) || today.isAfter(timelineTo)) return null;

  const totalDays = Math.max(1, timelineTo.diff(timelineFrom, "day") + 1);
  return clampProgress((today.diff(timelineFrom, "day") / totalDays) * 100);
};

const getManualProgress = (aim: IAimData) => {
  if (aim.aimType === "boolean") {
    const progress = toFiniteNumber(aim.progress);
    return {
      currentValue: progress >= 100 ? 1 : 0,
      progress,
    };
  }

  const currentValue = toFiniteNumber(aim.currentValue ?? aim.value);
  return {
    currentValue,
    progress: aim.finalAim ? (currentValue / aim.finalAim) * 100 : 0,
  };
};

export const calculateAimProgressSnapshot = (
  aim: IAimData,
  taskGroups: ITasksGroup[] = [],
  historyMonths: IHistoryMonthSnapshot[] = [],
  currentDate: Dayjs = dayjs(),
): IAimProgressSnapshot => {
  let currentValue = 0;
  let progress = 0;
  let trend: IAimTrendPoint[] = [];
  const isPlannerConsistencyAim =
    aim.id === entityIds.aims.plannerConsistency.details;

  if (isPlannerConsistencyAim || aim.isRelatedWithHabit) {
    const progressDateTo = getAimProgressDateTo(aim.dateTo, currentDate);
    const relatedValues = isPlannerConsistencyAim
      ? getPlannerConsistencyValues(
          historyMonths,
          aim.dateFrom,
          progressDateTo,
          entityIds.aims.plannerConsistency.minimumPlanCompletionExclusive,
        )
      : getRelatedHabitValuesBetweenDates(
          historyMonths,
          aim.dateFrom,
          progressDateTo,
          aim.relatedHabit,
        );

    if (isPlannerConsistencyAim || aim.calculationType === "sum") {
      let total = 0;
      trend = relatedValues.map(({ date, value }) => {
        total += value;
        return { date, value: +total.toFixed(2) };
      });
      currentValue = +total.toFixed(2);
      progress = aim.finalAim ? (currentValue / aim.finalAim) * 100 : 0;
    } else {
      currentValue = relatedValues.length
        ? relatedValues[relatedValues.length - 1].value
        : toFiniteNumber(aim.startedPoint);
      trend = relatedValues;
      progress = calculateTargetProgress(
        toFiniteNumber(aim.startedPoint),
        toFiniteNumber(aim.finalAim),
        currentValue,
      );
    }
  } else if (aim.aimType === "list") {
    progress = calculateTaskGroupProgress(aim, taskGroups);
    currentValue = progress;
  } else {
    const manualProgress = getManualProgress(aim);
    currentValue = manualProgress.currentValue;
    progress = manualProgress.progress;
  }

  const expectedProgress = getExpectedAimProgress(aim, currentDate);

  return {
    currentValue,
    progress: Math.max(0, progress),
    expectedProgress,
    status: getAimPaceStatus(aim, progress, expectedProgress, currentDate),
    trend,
  };
};
