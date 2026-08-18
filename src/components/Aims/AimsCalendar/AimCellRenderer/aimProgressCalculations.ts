import { IAim } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import dayjs, { Dayjs } from "dayjs";

const clampProgress = (progress: number) =>
  Math.min(100, Math.max(0, progress));

export const getAimProgressDateTo = (
  dateTo: string,
  currentDate: Dayjs = dayjs(),
) => {
  const aimEndDate = dayjs(dateTo);
  if (!aimEndDate.isValid()) return dateTo;

  return (aimEndDate.isAfter(currentDate, "day") ? currentDate : aimEndDate)
    .startOf("day")
    .format("YYYY/MM/DD");
};

export const calculateTargetProgress = (
  startedPoint: number,
  finalAim: number,
  currentValue: number,
) => {
  if (startedPoint === finalAim) {
    return currentValue === finalAim ? 100 : 0;
  }

  return clampProgress(
    ((currentValue - startedPoint) / (finalAim - startedPoint)) * 100,
  );
};

export const calculateTaskGroupProgress = (
  data: IAim,
  taskGroups: ITasksGroup[] = [],
) => {
  const stagesProgress: Array<{
    donePercentage: number;
    stageMaxPercentage: number;
  }> = [];

  for (const [, relation] of Object.entries(data.relatedList || {})) {
    const taskGroup = taskGroups.find(({ id }) => id === relation[0]);
    if (!taskGroup) continue;

    const relatedStages = relation[1]
      ? (taskGroup.tasksStages || []).filter(
          (taskStage) => taskStage.id === relation[1],
        )
      : taskGroup.tasksStages || [];

    relatedStages.forEach((taskStage) => {
      const subTasks = taskStage.subTasks || [];
      const doneSubTasks = subTasks.filter(
        (subTask) => subTask.status === "done",
      );
      stagesProgress.push({
        donePercentage: doneSubTasks.length / (subTasks.length || 1),
        stageMaxPercentage: taskStage.stagePercentage || 0,
      });
    });
  }

  const totalStageMaxPercentage = stagesProgress.reduce(
    (sum, stage) => sum + stage.stageMaxPercentage,
    0,
  );
  if (!totalStageMaxPercentage) return 0;

  return (
    stagesProgress.reduce(
      (sum, stage) =>
        sum +
        (stage.stageMaxPercentage / totalStageMaxPercentage) *
          stage.donePercentage,
      0,
    ) * 100
  );
};
