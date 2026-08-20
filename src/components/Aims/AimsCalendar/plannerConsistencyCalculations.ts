import dayjs from "dayjs";
import {
  getDashboardActivitiesForDate,
  getDashboardPlanPerformance,
} from "components/Main/dashboardCalculations";
import { IHistoryMonthSnapshot } from "./AimCellRenderer/aimHistoryCalculations";

export interface IPlannerConsistencyValue {
  date: string;
  value: number;
}

export const getPlannerConsistencyValues = (
  historyMonths: IHistoryMonthSnapshot[] = [],
  dateFrom: string,
  dateTo: string,
  minimumCompletionExclusive: number,
): IPlannerConsistencyValue[] => {
  const startDate = dayjs(dateFrom).startOf("day");
  const endDate = dayjs(dateTo).startOf("day");

  if (
    !startDate.isValid() ||
    !endDate.isValid() ||
    endDate.isBefore(startDate)
  ) {
    return [];
  }

  const history = historyMonths.map(({ id, data }) => ({
    ...data,
    unix:
      typeof data.unix === "number"
        ? data.unix
        : dayjs(`${id}-01`).startOf("month").unix(),
  }));
  const values: IPlannerConsistencyValue[] = [];

  for (
    let currentDate = startDate;
    !currentDate.isAfter(endDate, "day");
    currentDate = currentDate.add(1, "day")
  ) {
    const performance = getDashboardPlanPerformance(
      getDashboardActivitiesForDate(history, currentDate),
    );
    values.push({
      date: currentDate.format("YYYY-MM-DD"),
      value:
        performance.planned > 0 &&
        performance.progress > minimumCompletionExclusive
          ? 1
          : 0,
    });
  }

  return values;
};
