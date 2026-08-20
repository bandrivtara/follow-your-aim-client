import dayjs from "dayjs";

export interface IHistoryMonthSnapshot {
  id: string;
  data: Record<string, unknown>;
}

export interface IRelatedHabitValue {
  date: string;
  value: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getRelatedHabitValue = (
  dayData: unknown,
  relatedHabit: string[],
): number | undefined => {
  const [habitId, measureId] = relatedHabit;
  if (!habitId || !isRecord(dayData)) return undefined;

  const habitData = dayData[habitId];
  if (!isRecord(habitData)) return undefined;

  if (!measureId) {
    const progress = Number(habitData.progress);
    if (Number.isFinite(progress)) return progress >= 100 ? 1 : 0;
    if (typeof habitData.status === "string") {
      return habitData.status === "done" ? 1 : 0;
    }
    return undefined;
  }

  const measures = habitData.measures;
  if (!isRecord(measures)) return undefined;

  const measure = measures[measureId];
  if (!isRecord(measure)) return undefined;

  const numericValue = Number(measure.value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

export const getRelatedHabitValuesBetweenDates = (
  months: IHistoryMonthSnapshot[],
  dateFrom: string,
  dateTo: string,
  relatedHabit: string[],
): IRelatedHabitValue[] => {
  const startDate = dayjs(dateFrom).startOf("day");
  const endDate = dayjs(dateTo).endOf("day");

  if (
    !startDate.isValid() ||
    !endDate.isValid() ||
    endDate.isBefore(startDate)
  ) {
    return [];
  }

  return months
    .flatMap((month) => {
      if (!/^\d{4}-\d{2}$/.test(month.id) || !isRecord(month.data)) {
        return [];
      }

      return Object.entries(month.data).flatMap(([day, dayData]) => {
        if (!/^\d{1,2}$/.test(day)) return [];

        const normalizedDate = [month.id, day.padStart(2, "0")].join("-");
        const currentDate = dayjs(normalizedDate);

        if (
          !currentDate.isValid() ||
          currentDate.format("YYYY-MM-DD") !== normalizedDate ||
          currentDate.isBefore(startDate) ||
          currentDate.isAfter(endDate)
        ) {
          return [];
        }

        const value = getRelatedHabitValue(dayData, relatedHabit);
        return value === undefined ? [] : [{ date: normalizedDate, value }];
      });
    })
    .sort((left, right) => left.date.localeCompare(right.date));
};

export const sumRelatedHabitValuesBetweenDates = (
  months: IHistoryMonthSnapshot[],
  dateFrom: string,
  dateTo: string,
  relatedHabit: string[],
) =>
  getRelatedHabitValuesBetweenDates(
    months,
    dateFrom,
    dateTo,
    relatedHabit,
  ).reduce((sum, item) => sum + item.value, 0);

export const getLastRelatedHabitValueBetweenDates = (
  months: IHistoryMonthSnapshot[],
  dateFrom: string,
  dateTo: string,
  relatedHabit: string[],
) => {
  const values = getRelatedHabitValuesBetweenDates(
    months,
    dateFrom,
    dateTo,
    relatedHabit,
  );

  return values.length ? values[values.length - 1].value : undefined;
};
