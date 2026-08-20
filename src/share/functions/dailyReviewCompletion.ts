import { IActivityHistoryData } from "types/history.types";

export const DAILY_REVIEW_START_TIME = [21, 40];
export const DAILY_REVIEW_END_TIME = [21, 55];
export const DAILY_REVIEW_ANSWER_COUNT = 5;

export const isDailyReviewComplete = (
  answers: Record<string, string>,
  summary = "",
) =>
  summary.trim().length > 0 ||
  (Object.values(answers).length >= DAILY_REVIEW_ANSWER_COUNT &&
    Object.values(answers).every((answer) => answer.trim().length > 0));

export const buildDailyReviewHabitCompletion = (
  habitId: string,
): IActivityHistoryData => ({
  id: habitId,
  type: "habit",
  valueType: "boolean",
  isAllDay: false,
  isPlanned: true,
  progress: 100,
  status: "done",
  startTime: [...DAILY_REVIEW_START_TIME],
  endTime: [...DAILY_REVIEW_END_TIME],
  measures: {},
});
