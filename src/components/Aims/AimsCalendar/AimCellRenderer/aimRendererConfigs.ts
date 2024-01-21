import dayjs from "dayjs";
import { doc, getDoc } from "firebase/firestore";
import { getHistoryBetweenDates } from "share/fireBase/getHistoryBetweenDates";
import { db } from "store/api";
import { IAim } from "types/aims.types";
import { ITaskGroups } from "types/taskGroups";

export const aimRendererConfigs = {
  relatedHobby: {
    sumOfValues: async (data: IAim) => {
      const querySnapshot = await getHistoryBetweenDates(
        data.dateFrom,
        data.dateTo
      );
      let currentValue = 0;
      querySnapshot.forEach(async (monthHistoryDoc) => {
        for (const [day, habit] of Object.entries(monthHistoryDoc.data())) {
          if (monthHistoryDoc.id === dayjs(data.dateFrom).format("MM-YYYY")) {
            if (+day >= +dayjs(data.dateFrom).format("D")) {
              currentValue +=
                habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]] ||
                0;
            }
          } else if (
            monthHistoryDoc.id === dayjs(data.dateTo).format("MM-YYYY")
          ) {
            if (+day <= +dayjs(data.dateFrom).format("D")) {
              currentValue +=
                habit[data.relatedHabit[0]]?.values[data.relatedHabit[1]] || 0;
            }
          } else {
            currentValue +=
              habit[data.relatedHabit[0]]?.values[data.relatedHabit[1]] || 0;
          }
        }
      });

      return {
        currentValue: +currentValue.toFixed(2),
        progress: (currentValue / data.finalAim) * 100,
      };
    },
    lastValue: async (data: IAim, type: "asc" | "desc") => {
      const querySnapshot = await getHistoryBetweenDates(
        data.dateFrom,
        data.dateTo
      );
      let lastValue = 0;

      querySnapshot.forEach(async (monthHistoryDoc) => {
        for (const [day, habit] of Object.entries(
          monthHistoryDoc.data()
        ).reverse()) {
          if (!lastValue) {
            if (monthHistoryDoc.id === dayjs(data.dateFrom).format("MM-YYYY")) {
              if (+day >= +dayjs(data.dateFrom).format("D")) {
                lastValue =
                  habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]];
              }
            } else if (
              monthHistoryDoc.id === dayjs(data.dateTo).format("MM-YYYY")
            ) {
              if (+day <= +dayjs(data.dateFrom).format("D")) {
                lastValue =
                  habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]];
              }
            } else {
              lastValue =
                habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]];
            }
          }
        }
      });

      return {
        currentValue: lastValue,
        progress:
          type === "asc"
            ? (lastValue / data.finalAim) * 100
            : (data.finalAim / lastValue) * 100,
      };
    },
  },
  relatedTaskGroup: async (data: IAim) => {
    const stagesProgress = [];

    for (const [_, list] of Object.entries(data.relatedList)) {
      const taskGroupRef = doc(db, "taskGroup", list[0]);
      const taskGroupSnapshot = await getDoc(taskGroupRef);
      if (taskGroupSnapshot.exists()) {
        const taskGroup = taskGroupSnapshot.data() as ITaskGroups;

        if (list[1]) {
          const taskStage = taskGroup.tasksStages.find(
            (taskStage) => taskStage.id === list[1]
          );
          const doneSubTasks =
            taskStage?.subTasks.filter(
              (subTask) => subTask.status === "done"
            ) || [];
          stagesProgress.push({
            donePercentage:
              doneSubTasks.length / (taskStage?.subTasks?.length || 0),
            stageMaxPercentage: taskStage?.stagePercentage,
          });
        } else {
          taskGroup.tasksStages.forEach((taskStage) => {
            const doneSubTasks = taskStage.subTasks.filter(
              (subTask) => subTask.status === "done"
            );
            stagesProgress.push({
              donePercentage: doneSubTasks.length / taskStage.subTasks.length,
              stageMaxPercentage: taskStage.stagePercentage,
            });
          });
        }
      }
    }

    const totalStageMaxPercentage = stagesProgress.reduce(
      (sum, stage) => sum + (stage.stageMaxPercentage || 0),
      0
    );

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
