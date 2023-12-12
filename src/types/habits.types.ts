export interface IHabitData {
  id?: string;
  details: IHabitDetails;
  history?: IHabitHistory[];
  store?: any[];
}

export type IValueTypes = "number" | "boolean" | "array" | "time" | "duration";

export interface IHabitDetails {
  id: string;
  scheduleTime?: string;
  title: string;
  valueType?: IValueTypes;
  description?: string;
  complexity?: number;
  category?: string[];
  measure?: string;
  active?: boolean;
  minToComplete?: number;
  specificId?: string;
  isHidden?: boolean;
}

interface IHabitHistory {
  [year: number]: {
    [month: number]: IHabitDayData;
  };
}

export interface IHabitDayData {
  [day: number]: IHabitStatus;
}

export interface IHabitStatus {
  value?: number;
  progress?: number;
  isPlanned?: boolean;
  plannedValue?: number;
}
