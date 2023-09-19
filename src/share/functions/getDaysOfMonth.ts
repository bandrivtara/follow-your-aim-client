import dayjs from "dayjs";

export const getDaysOfMonth = (month: number, year: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayObject = {
      month,
      year,
      day: day.toString(),
      weekday: dayjs(`${year}-${month}-${day}`).locale("uk").format("ddd"),
    };
    daysArray.push(dayObject);
  }

  return daysArray;
};
