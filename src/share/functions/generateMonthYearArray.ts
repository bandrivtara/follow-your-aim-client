import dayjs from "dayjs";

export const generateMonthYearArray = (dateFrom: string, dateTo: string) => {
  const result = [];
  let currentDate = dayjs(dateFrom, { format: "YYYY/MM/DD" });

  while (
    currentDate.isBefore(dayjs(dateTo, { format: "YYYY/MM/DD" })) ||
    currentDate.isSame(dayjs(dateTo, { format: "YYYY/MM/DD" }))
  ) {
    result.push(currentDate.format("MM-YYYY"));
    currentDate = currentDate.add(1, "month");
  }

  return result;
};
