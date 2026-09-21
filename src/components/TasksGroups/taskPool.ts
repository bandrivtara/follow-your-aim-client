import { ITask, ITasksGroup } from "types/taskGroups";

const normalizeTaskTitle = (title = "") =>
  title.trim().toLocaleLowerCase("uk").replace(/\s+/g, " ");

const isSameTask = (stored: ITask, incoming: ITask) => {
  if (stored.id && incoming.id) return stored.id === incoming.id;
  return normalizeTaskTitle(stored.title) === normalizeTaskTitle(incoming.title);
};

const mergeTask = (stored: ITask, incoming: ITask): ITask => {
  const nextTask = {
    ...stored,
    ...incoming,
    id: stored.id || incoming.id,
    title: incoming.title?.trim() || stored.title,
    time: Array.isArray(incoming.time) ? incoming.time : stored.time,
    isEditOn: false,
  };

  if (nextTask.status !== "failed") delete nextTask.failureReason;
  return nextTask;
};

export interface TaskPoolUpdate {
  tasksStore: ITask[];
  tasksStages?: NonNullable<ITasksGroup["tasksStages"]>;
}

/**
 * Keeps taskGroup as the lightweight canonical pool. Daily history remains the
 * schedule/result copy, while matching pool items receive the latest status.
 * Ad-hoc tracker tasks are appended to tasksStore so future active views do not
 * need to scan every history month.
 */
export const reconcileTaskPool = (
  group: ITasksGroup,
  incomingTasks: ITask[],
): TaskPoolUpdate => {
  const tasksStore = (group.tasksStore || []).map((task) => ({ ...task }));
  const tasksStages = (group.tasksStages || []).map((stage) => ({
    ...stage,
    subTasks: (stage.subTasks || []).map((task) => ({ ...task })),
  }));

  incomingTasks
    .filter((task) => task?.title?.trim())
    .forEach((incoming) => {
      const storeIndex = tasksStore.findIndex((task) =>
        isSameTask(task, incoming),
      );
      if (storeIndex >= 0) {
        tasksStore[storeIndex] = mergeTask(tasksStore[storeIndex], incoming);
        return;
      }

      for (const stage of tasksStages) {
        const stageIndex = stage.subTasks.findIndex((task) =>
          isSameTask(task, incoming),
        );
        if (stageIndex >= 0) {
          stage.subTasks[stageIndex] = mergeTask(
            stage.subTasks[stageIndex],
            incoming,
          );
          return;
        }
      }

      tasksStore.push({
        ...incoming,
        title: incoming.title.trim(),
        time: Array.isArray(incoming.time) ? incoming.time : ["", ""],
        status: incoming.status || "pending",
        isEditOn: false,
      });
    });

  return {
    tasksStore,
    ...(group.tasksStages ? { tasksStages } : {}),
  };
};
