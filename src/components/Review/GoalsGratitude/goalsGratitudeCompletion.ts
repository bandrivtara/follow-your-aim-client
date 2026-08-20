import { IHabitData } from "types/habits.types";
import { IActivityHistoryData } from "types/history.types";

export const GOALS_GRATITUDE_TITLE = "5 цілей і 5 подяк";
export const GOALS_GRATITUDE_DESCRIPTION =
  "П'ять конкретних цілей і п'ять подяк, сформульовані через коротке AI-інтерв'ю.";

export const buildGoalsGratitudeCompletion = (
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
