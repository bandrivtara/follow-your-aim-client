import { Dayjs } from "dayjs";

export interface ITask {
  id?: string;
  createAt: string | Dayjs;
  deadLineDate: string | Dayjs;
  plannedDate: string | Dayjs;
  completeDate: string | Dayjs;
  title: string;
  description: string;
  complexity: number;
  category: string;
  progress: number;
  valueType: "number" | "boolean";
  measure: string;
  minToComplete?: number;
}
