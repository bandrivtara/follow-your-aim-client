import { IHabitData } from "types/habits.types";
import { ITasksGroup } from "types/taskGroups";

export const isTrackerActivityArchived = (
  activity: IHabitData | ITasksGroup,
) => "isArchived" in activity && activity.isArchived === true;
