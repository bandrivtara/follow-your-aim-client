export interface ITaskGroups {
  id: string;
  title: string;
  description: string;
  valueType: string;
  isHidden?: boolean;
  category?: string;
  tasksStore: ITask[];
  tasksStages: ITaskStage[];
}

export interface ITaskStage {
  title: string;
  description: string;
  id: string;
  stagePercentage: number;
  subTasks: ITask[];
}

export type ITaskStatus = "pending" | "failed" | "done";

export interface ITask {
  title: string;
  description: string;
  status: ITaskStatus;
  time: string[];
  link: string;
}
