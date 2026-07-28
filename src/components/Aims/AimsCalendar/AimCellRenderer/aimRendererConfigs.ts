import { getHistoryBetweenDates } from "share/fireBase/getHistoryBetweenDates";
import { IAim } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import {
  getLastRelatedHabitValueBetweenDates,
  IHistoryMonthSnapshot,
  sumRelatedHabitValuesBetweenDates,
} from "./aimHistoryCalculations";

const getHistoryMonths = async (
  data: IAim,
): Promise<IHistoryMonthSnapshot[]> => {
  const querySnapshot = await getHistoryBetweenDates(
    data.dateFrom,
    data.dateTo,
  );

  return querySnapshot.docs.map((monthHistoryDoc) => ({
    id: monthHistoryDoc.id,
    data: monthHistoryDoc.data(),
  }));
};

export const aimRendererConfigs = {
  relatedHobby: {
    sumOfValues: async (data: IAim) => {
      const historyMonths = await getHistoryMonths(data);
      const currentValue = sumRelatedHabitValuesBetweenDates(
        historyMonths,
        data.dateFrom,
        data.dateTo,
        data.relatedHabit,
      );

      return {
        currentValue: +currentValue.toFixed(2),
        progress: data.finalAim ? (currentValue / data.finalAim) * 100 : 0,
      };
    },
    lastValue: async (data: IAim, type: "asc" | "desc") => {
      const historyMonths = await getHistoryMonths(data);
      const lastValue =
        getLastRelatedHabitValueBetweenDates(
          historyMonths,
          data.dateFrom,
          data.dateTo,
          data.relatedHabit,
        ) ?? 0;

      return {
        currentValue: lastValue,
        progress:
          type === "asc"
            ? data.finalAim
              ? (lastValue / data.finalAim) * 100
              : 0
            : lastValue
              ? (data.finalAim / lastValue) * 100
              : 0,
      };
    },
  },
  relatedTaskGroup: (data: IAim, taskGroups: ITasksGroup[] = []) => {
    const stagesProgress = [];

    for (const [, list] of Object.entries(data.relatedList)) {
      const taskGroup = taskGroups.find(({ id }) => id === list[0]);
      if (taskGroup) {

        if (list[1]) {
          const taskStage = taskGroup.tasksStages.find(
            (taskStage) => taskStage.id === list[1],
          );
          const doneSubTasks =
            taskStage?.subTasks.filter(
              (subTask) => subTask.status === "done",
            ) || [];
          stagesProgress.push({
            donePercentage:
              doneSubTasks.length / (taskStage?.subTasks?.length || 1),
            stageMaxPercentage: taskStage?.stagePercentage,
          });
        } else {
          taskGroup.tasksStages.forEach((taskStage) => {
            const doneSubTasks = taskStage.subTasks.filter(
              (subTask) => subTask.status === "done",
            );
            stagesProgress.push({
              donePercentage:
                doneSubTasks.length / (taskStage.subTasks.length || 1),
              stageMaxPercentage: taskStage.stagePercentage,
            });
          });
        }
      }
    }

    const totalStageMaxPercentage = stagesProgress.reduce(
      (sum, stage) => sum + (stage.stageMaxPercentage || 0),
      0,
    );

    if (!totalStageMaxPercentage) {
      return {
        currentValue: 100,
        progress: 0,
      };
    }

    const resultSum = stagesProgress.reduce((sum, stage) => {
      const individualResult =
        ((stage.stageMaxPercentage || 0) / totalStageMaxPercentage) *
        stage.donePercentage;
      return sum + individualResult;
    }, 0);

    return {
      currentValue: 100,
      progress: resultSum * 100,
    };
  },
};
