import dayjs from "dayjs";
import uk from "dayjs/locale/uk";

export const getFirstDayOfWeek = () => {
  dayjs.locale({
    ...uk,
  });
  return dayjs().get("D") < 7
    ? dayjs().startOf("month")
    : dayjs().startOf("week");
};
