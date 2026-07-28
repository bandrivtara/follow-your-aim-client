import { IActivityHistoryData, IHistoryDayRow } from "types/history.types";
import { IHabitData } from "types/habits.types";
import { ITasksGroup } from "types/taskGroups";

export type TrackerCategoryFilter =
  | "all"
  | "only-planned"
  | "grouped"
  | "daily"
  | "sport";

const hasPlannedActivity = (row: IHistoryDayRow) =>
  Object.entries(row).some(([key, value]) => {
    if (
      key === "id" ||
      key === "details" ||
      key === "currentDate" ||
      !value ||
      typeof value !== "object"
    ) {
      return false;
    }

    const activity = value as IActivityHistoryData;

    if (activity.isPlanned || activity.tasks?.length) {
      return true;
    }

    return Object.values(activity.measures || {}).some(
      (measure) => !!measure.plannedValue,
    );
  });

export const filterTrackerRows = (
  rows: IHistoryDayRow[],
  filter: TrackerCategoryFilter,
) => {
  if (filter === "all") {
    return rows;
  }

  if (filter === "only-planned") {
    return rows.filter(hasPlannedActivity);
  }

  return rows.filter((row) => {
    const details = row.details as IHabitData | ITasksGroup;

    if (filter === "grouped") {
      return details.type === "tasksGroup" || Array.isArray(details.category);
    }

    return details.category === filter;
  });
};
