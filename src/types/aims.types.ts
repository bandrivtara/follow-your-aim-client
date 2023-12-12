export interface IAimData extends IAim {
  id: string;
}

export interface IAim {
  id: string;
  title: string;
  description: string;
  category?: string;
  dateFrom: string;
  dateTo: string;
  progress: number;
  value: any;
}
