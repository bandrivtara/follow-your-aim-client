export interface IActivityData {
  id?: string;
  details: IActivityDetails;
  history?: IActivityHistory[];
}

export type IValueTypes = "number" | "boolean" | "array" | "time";

export interface IActivityDetails {
  id: string;
  scheduleTime?: string;
  title: string;
  valueType?: IValueTypes;
  description?: string;
  complexity?: number;
  category?: string;
  measure?: string;
  active?: boolean;
  minToComplete?: number;
  specificId?: string;
}

interface IActivityHistory {
  [year: number]: {
    [month: number]: IActivityDayData;
  };
}

export interface IActivityDayData {
  [day: number]: IActivityStatus;
}

export interface IActivityStatus {
  value?: number;
  progress?: number;
  isPlanned?: boolean;
  plannedValue?: number;
}
