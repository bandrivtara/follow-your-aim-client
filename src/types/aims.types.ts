export interface IAimData extends IAim {
  id: string;
}

export interface IAim {
  id: string;
  title: string;
  description: string;
  complexity: number;
  category?: string;
  dateFrom: string;
  dateTo: string;
  progress: number;
  value: any;
  aimType: "number" | "boolean";
  calculationType: "sum" | "lastMeasureAsc" | "lastMeasureDesc";
  isRelatedWithHabit: boolean;
  finalAim?: number;
  currentValue?: number;
}
