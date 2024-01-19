import { ColDef } from "ag-grid-community";
import dayjs, { Dayjs } from "dayjs";
import AimCellRenderer from "./AimCellRenderer/AimCellRenderer";
import { IAimData } from "types/aims.types";
import AimCellEditor from "./AimCellEditor/AimCellEditor";

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

  const newColDefs: ColDef[] = months.map((month) => ({
    field: `col-${month.year}-${month.monthIndex}`,
    headerName: month.name,
    width: 150,
    editable: ({ data }) => !data.isRelatedWithHabit,
    cellEditorPopup: true,
    cellEditor: AimCellEditor,
    colSpan: (params) => {
      if (params.data.colName === params.colDef.field) {
        return params.data.differenceMonths;
      }
      return 1;
    },
    cellRenderer: AimCellRenderer,
  }));

  const aimNamesCol: ColDef = {
    field: "aim-names-col",
    headerName: "Сфери життя",
    pinned: "left",
    width: 220,
  };

  return [aimNamesCol, ...newColDefs];
};

const getRows = (allAims: IAimData[] | undefined) => {
  if (!allAims) return [];
  const rows: any = [];

  allAims.forEach((aim) => {
    console.log(aim);
    const monthDiff =
      dayjs(aim.dateTo).month() - dayjs(aim.dateFrom).month() + 1;
    const yearDiff = dayjs(aim.dateTo).year() - dayjs(aim.dateFrom).year();
    const difference = monthDiff + yearDiff * 12;

    const row = {
      [`col-${dayjs(aim.dateFrom).year()}-${dayjs(aim.dateFrom).month()}`]:
        aim.title,
      "aim-names-col": aim.aimsCategoryId,
      colName: `col-${dayjs(aim.dateFrom).year()}-${dayjs(
        aim.dateFrom
      ).month()}`,
      differenceMonths: difference,
      ...aim,
    };

    if (
      rows[0] &&
      rows.some((row: any) => row["aim-names-col"] === aim.aimsCategoryId)
    ) {
      delete row["aim-names-col"];
    }

    rows.push(row);
  });
  console.log(rows);
  return [...rows];
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
