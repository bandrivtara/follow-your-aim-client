import dayjs, { Dayjs } from "dayjs";
import { IAimData } from "types/aims.types";

export type AimCalendarRange = [Dayjs, Dayjs];

const isValidAimDate = (date: string) => dayjs(date).isValid();

export const getAimsDateRange = (
  aims: IAimData[] = [],
): AimCalendarRange | null => {
  const validAims = aims.filter(
    ({ dateFrom, dateTo }) =>
      isValidAimDate(dateFrom) && isValidAimDate(dateTo),
  );
  if (!validAims.length) return null;

  const firstDate = validAims.reduce(
    (earliest, aim) =>
      dayjs(aim.dateFrom).isBefore(earliest) ? dayjs(aim.dateFrom) : earliest,
    dayjs(validAims[0].dateFrom),
  );
  const lastDate = validAims.reduce(
    (latest, aim) =>
      dayjs(aim.dateTo).isAfter(latest) ? dayjs(aim.dateTo) : latest,
    dayjs(validAims[0].dateTo),
  );

  return [firstDate.startOf("month"), lastDate.endOf("month")];
};

export const isAimInRange = (aim: IAimData, range: (Dayjs | null)[]) => {
  const [rangeFrom, rangeTo] = range;
  if (
    !rangeFrom ||
    !rangeTo ||
    !isValidAimDate(aim.dateFrom) ||
    !isValidAimDate(aim.dateTo)
  ) {
    return false;
  }

  return (
    !dayjs(aim.dateTo).isBefore(rangeFrom.startOf("month"), "day") &&
    !dayjs(aim.dateFrom).isAfter(rangeTo.endOf("month"), "day")
  );
};
