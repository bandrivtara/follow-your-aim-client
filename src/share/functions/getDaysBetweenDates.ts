import dayjs, { Dayjs } from "dayjs";

export const getDaysBetweenDates = (startDate: Dayjs, endDate: Dayjs) => {
  let currentDay = dayjs(startDate);
  const allDays = [];

  while (currentDay.isBefore(endDate) || currentDay.isSame(endDate)) {
    const formattedDay = {
      month: currentDay.month() + 1,
      year: currentDay.year(),
      day: currentDay.format("D"),
      weekday: currentDay.format("ddd"),
      date: dayjs(currentDay).format("YYYY-MM-DD"),
    };

    allDays.push(formattedDay);
    currentDay = currentDay.add(1, "day");
  }

  return allDays;
};
