export interface ITasksGroup {
  id: string;
  type: "tasksGroup";
  valueType: string;
  title: string;
  description: string;
  isHidden?: boolean;
  category?: string;
  isDividedIntoStages?: boolean;
  tasksStore?: ITask[];
  tasksStages?: ITaskStage[];
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
  id?: string;
  title: string;
  description?: string;
  link?: string;
  status: ITaskStatus;
  time: Array<number | string>;
  category?: string;
  failureReason?: string;
  isEditOn?: boolean;
}
