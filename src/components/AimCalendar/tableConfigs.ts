import { ColDef } from "ag-grid-community";
import { getDaysOfMonth } from "../../share/functions/getDaysOfMonth";
import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import { IActivityData, IActivityDetails } from "../../types/activity.types";
import aims from "./fakeobject";

const getColumnDefs = (monthsDates: (Dayjs | null)[]): ColDef[] => {
  if (!monthsDates[0] || !monthsDates[1]) return [{}];
  const monthDiff = monthsDates[1].month() - monthsDates[0].month();
  const yearDiff = monthsDates[1].year() - monthsDates[0].year();
  const difference = monthDiff + yearDiff * 12;

  const months = [];

  for (let i = 0; i <= difference; i++) {
    const startMonth = monthsDates[0].month();
    months.push({
      name: dayjs(monthsDates[0])
        .month(startMonth + i)
        .format("MMMM"),
      monthIndex: dayjs(monthsDates[0])
        .month(startMonth + i)
        .month(),
      year: dayjs(monthsDates[0])
        .month(startMonth + i)
        .year(),
    });
  }
  console.log(months, 123);
  const newColDefs: ColDef[] = months.map((month) => ({
    field: `col-${month.year}-${month.monthIndex}`,
    headerName: month.name,
    width: 150,
    colSpan: (params) => {
      if (params.data.colName === params.colDef.field) {
        return params.data.differenceMonths;
      }
      return 1;
    },
  }));

  console.log(newColDefs);

  const aimNamesCol: ColDef = {
    field: "aim-names-col",
    headerName: "Сфери життя",
    pinned: "left",
    width: 220,
  };

  console.log(dayjs().subtract(7, "year"));
  return [aimNamesCol, ...newColDefs];
};

const getRows = () => {
  const rows = [];

  aims.forEach((aim) => {
    const monthDiff = dayjs(aim.timeTo).month() - dayjs(aim.timeFrom).month();
    const yearDiff = dayjs(aim.timeTo).year() - dayjs(aim.timeFrom).year();
    const difference = monthDiff + yearDiff * 12;

    const row = {
      [`col-${dayjs(aim.timeFrom).year()}-${dayjs(aim.timeFrom).month()}`]:
        aim.name,
      "aim-names-col": aim.category,
      colName: `col-${dayjs(aim.timeFrom).year()}-${dayjs(
        aim.timeFrom
      ).month()}`,
      differenceMonths: difference,
    };

    if (rows[0] && rows.some((row) => row["aim-names-col"] === aim.category)) {
      delete row["aim-names-col"];
    }

    rows.push(row);
  });

  return [...rows];
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
