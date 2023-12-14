export interface ITaskGroups {
  id: string;
  title: string;
  description: string;
  category?: string;
  store: ITask[];
}

export type ITaskStatus = "pending" | "failed" | "done";

export interface ITask {
  title: string;
  description: string;
  status: ITaskStatus;
  time: string[];
  link: string;
}
