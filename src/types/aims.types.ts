export interface IAimData extends IAim {
  id: string;
}

export type IAimRelatedList = Record<string, string[]> | string[][];

export interface IAim {
  id?: string;
  title: string;
  description: string;
  complexity: number;
  aimsCategoryId?: string;
  sphereId?: string;
  dateFrom: string;
  dateTo: string;
  progress: number;
  value: any;
  aimType: "number" | "boolean" | "list";
  calculationType: "sum" | "lastMeasureAsc" | "lastMeasureDesc";
  isRelatedWithHabit: boolean;
  finalAim: number;
  startedPoint: number;
  currentValue?: number;
  isArchived?: boolean;
  relatedHabit: string[];
  relatedList: IAimRelatedList;
}
