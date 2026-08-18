import dayjs, { Dayjs } from "dayjs";

export type TrackerRangeMode = "day" | "week" | "month" | "custom";
export type TrackerDateRange = [Dayjs, Dayjs];

const startOfMondayWeek = (date: Dayjs) =>
  date.startOf("day").subtract((date.day() + 6) % 7, "day");

export const getTrackerDateRange = (
  date: Dayjs,
  mode: Exclude<TrackerRangeMode, "custom">,
): TrackerDateRange => {
  if (mode === "day") {
    return [date.startOf("day"), date.endOf("day")];
  }
  if (mode === "month") {
    return [date.startOf("month"), date.endOf("month")];
  }

  const weekStart = startOfMondayWeek(date);
  return [weekStart, weekStart.add(6, "day").endOf("day")];
};

export const shiftTrackerDateRange = (
  range: (Dayjs | null)[],
  mode: TrackerRangeMode,
  direction: -1 | 1,
): TrackerDateRange => {
  const rangeStart = range[0] || dayjs();
  const rangeEnd = range[1] || rangeStart;

  if (mode === "custom") {
    const rangeLength = Math.max(rangeEnd.diff(rangeStart, "day") + 1, 1);
    return [
      rangeStart.add(rangeLength * direction, "day"),
      rangeEnd.add(rangeLength * direction, "day"),
    ];
  }

  const unit = mode === "week" ? "week" : mode;
  return getTrackerDateRange(rangeStart.add(direction, unit), mode);
};

export const isDateInTrackerRange = (date: Dayjs, range: (Dayjs | null)[]) => {
  const [rangeStart, rangeEnd] = range;
  if (!rangeStart || !rangeEnd) return false;
  return !date.isBefore(rangeStart, "day") && !date.isAfter(rangeEnd, "day");
};
