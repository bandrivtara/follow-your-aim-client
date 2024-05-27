import dayjs from "dayjs";

export const generateDaysArray = (startDate: string, endDate: string) => {
  const dates = [];
  let currentDate = dayjs(startDate);

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};
