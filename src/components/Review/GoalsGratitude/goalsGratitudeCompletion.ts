import { IHabitData } from "types/habits.types";
import { IActivityHistoryData } from "types/history.types";

export const MORNING_COMPASS_TITLE = "Ранковий компас";
export const MORNING_COMPASS_DESCRIPTION =
  "Короткий ранковий огляд енергії, фокусу, першого кроку, плану «якщо–то» і однієї конкретної вдячності.";

export const buildMorningCompassCompletion = (
  habit: IHabitData,
  note: string,
  source: Partial<IActivityHistoryData> = {},
): IActivityHistoryData => ({
  ...source,
  id: habit.id,
  type: "habit",
  valueType: "boolean",
  isAllDay: habit.isAllDay,
  isPlanned: source.isPlanned ?? true,
  progress: 100,
  status: "done",
  startTime: source.startTime || habit.startTime || [0, 0],
  endTime: source.endTime || habit.endTime || [0, 0],
  measures: source.measures || {},
  note: note.trim(),
});
