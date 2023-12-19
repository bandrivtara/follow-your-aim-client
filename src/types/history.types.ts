import { IHabitData } from "./habits.types";

export interface IHistoryData {
  [day: string]: {
    [habitId: string]: IHabitDayValues;
  };
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
