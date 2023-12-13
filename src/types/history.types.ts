export interface IHistoryData {
  id?: string;
  details: IHistoryDay;
}

export interface IHistoryDay {
  value?: number;
  progress?: number;
  isPlanned?: boolean;
  plannedValue?: number;
}
