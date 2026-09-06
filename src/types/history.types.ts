import { IHabitData } from "./habits.types";
import { ITask } from "./taskGroups";

export interface IHistoryData {
  [day: string]: {
    [activityId: string]: IActivityHistoryData;
  };
}

export type IActivityTypes = "tasksGroup" | "habit";
export type IValueTypes = "boolean" | "measures" | "todoList";

export interface IMeasures {
  [habitId: string]: {
    plannedValue: number;
    value: number;
  };
}

export interface IActivityData {
  startTime: number[];
  endTime: number[];
  measures: IMeasures;
  isAllDay: boolean;
  status: "failed" | "pending" | "done";
  progress: number;
  failureReason?: string;
}

export interface ITasksHistoryData {
  id: string;
  type: string;
  valueType: string;
  tasks: ITask[];
  progress: number;
  isPlanned?: boolean;
  tasksStore?: ITask[];
  failureReason?: string;
}

export interface IActivityHistoryData extends IActivityData {
  id: string;
  type: "habit" | "tasksGroup";
  valueType?: "measures" | "boolean" | "todoList";
  isPlanned?: boolean;
  tasks?: ITask[];
  note?: string;
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
