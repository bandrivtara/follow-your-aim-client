export type IHabitValueTypes = "measures" | "boolean";

export interface IHabitData {
  id: string;
  scheduleTime?: string[];
  title: string;
  type: "habit";
  valueType: IHabitValueTypes;
  description?: string;
  complexity?: number;
  habitsCategoryId?: string;
  sphereId?: string;
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
