import { IHabitData } from "./habits.types";
import { ITask } from "./taskGroups";

export interface IHistoryData {
  [day: string]: {
    [activityId: string]: IActivityHistoryData;
  };
}

export type IActivityTypes = "tasksGroup" | "habit";
export type IValueTypes = "boolean" | "measures" | "todoList";

export interface IActivityHistoryData {
  details: {
    type: "habit" | "tasksGroup";
    valueType?: "measures" | "boolean" | "todoList";
    scheduleTime?: string[] | "allDay";
  };
  measures?: {
    [habitId: string]: {
      plannedValue: number;
      value: number;
    };
  };
  isPlanned?: boolean;
  tasks?: ITask[];
  status: "failed" | "pending" | "done";
  progress: number;
}

export type IHistoryDayRow = {
  [day: string | "id" | "details" | "currentDate"]:
    | IHabitDayValues
    | string
    | IHabitData;
};

export interface IHabitDayValues {
  value?: number;
  progress?: number;
  isPlanned?: boolean;
  plannedValue?: number;
}
