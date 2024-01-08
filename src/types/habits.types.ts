export type IValueTypes = "number" | "boolean" | "array" | "duration";

export interface IHabitData {
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
  fields?: IHabitField[];
}

export interface IHabitField {
  id: string;
  name: string;
  minToComplete: number;
  unit: string;
  orderIndex: number;
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
