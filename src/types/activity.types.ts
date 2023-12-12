export interface IActivityData {
  id?: string;
  details: IActivityDetails;
  history?: IActivityHistory[];
  store?: any[];
}

export type IValueTypes = "number" | "boolean" | "array" | "time" | "duration";

export interface IActivityDetails {
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
