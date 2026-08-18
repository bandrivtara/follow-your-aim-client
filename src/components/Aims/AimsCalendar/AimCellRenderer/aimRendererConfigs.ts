import { getHistoryBetweenDates } from "share/fireBase/getHistoryBetweenDates";
import { IAim } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import {
  calculateTargetProgress,
  calculateTaskGroupProgress,
  getAimProgressDateTo,
} from "./aimProgressCalculations";
import {
  getLastRelatedHabitValueBetweenDates,
  IHistoryMonthSnapshot,
  sumRelatedHabitValuesBetweenDates,
} from "./aimHistoryCalculations";

const getHistoryMonths = async (
  dateFrom: string,
  dateTo: string,
): Promise<IHistoryMonthSnapshot[]> => {
  const querySnapshot = await getHistoryBetweenDates(dateFrom, dateTo);

  return querySnapshot.docs.map((monthHistoryDoc) => ({
    id: monthHistoryDoc.id,
    data: monthHistoryDoc.data(),
  }));
};

export const aimRendererConfigs = {
  relatedHabit: {
    sumOfValues: async (data: IAim) => {
      const progressDateTo = getAimProgressDateTo(data.dateTo);
      const historyMonths = await getHistoryMonths(
        data.dateFrom,
        progressDateTo,
      );
      const currentValue = sumRelatedHabitValuesBetweenDates(
        historyMonths,
        data.dateFrom,
        progressDateTo,
        data.relatedHabit,
      );

      return {
        currentValue: +currentValue.toFixed(2),
        progress: data.finalAim ? (currentValue / data.finalAim) * 100 : 0,
      };
    },
    lastValue: async (data: IAim) => {
      const progressDateTo = getAimProgressDateTo(data.dateTo);
      const historyMonths = await getHistoryMonths(
        data.dateFrom,
        progressDateTo,
      );
      const lastValue =
        getLastRelatedHabitValueBetweenDates(
          historyMonths,
          data.dateFrom,
          progressDateTo,
          data.relatedHabit,
        ) ??
        data.startedPoint ??
        0;

      return {
        currentValue: lastValue,
        progress: calculateTargetProgress(
          data.startedPoint ?? 0,
          data.finalAim,
          lastValue,
        ),
      };
    },
  },
  relatedTaskGroup: (data: IAim, taskGroups: ITasksGroup[] = []) => ({
    currentValue: 100,
    progress: calculateTaskGroupProgress(data, taskGroups),
  }),
};
