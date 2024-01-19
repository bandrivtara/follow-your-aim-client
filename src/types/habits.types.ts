export type IValueTypes = "number" | "boolean" | "taskGroup" | "duration";

export interface IHabitData {
  id: string;
  scheduleTime?: string;
  title: string;
  valueType?: IValueTypes;
  description?: string;
  complexity?: number;
  habitsCategoryId?: string;
  measure?: string;
  active?: boolean;
  minToComplete?: number;
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

export interface IHabitDayData {
  [day: number]: IHabitStatus;
}

export interface IHabitStatus {
  value?: number;
  progress?: number;
  isPlanned?: boolean;
  plannedValue?: number;
}
