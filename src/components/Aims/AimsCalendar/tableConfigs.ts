import { ColDef } from "ag-grid-community";
import dayjs, { Dayjs } from "dayjs";
import AimCellRenderer from "./AimCellRenderer/AimCellRenderer";
import { IAimData } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import AimCellEditor from "./AimCellEditor/AimCellEditor";
import { IAimsCategoryData } from "types/aimsCategories.types";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";
import { isAimInRange } from "./aimCalendarCalculations";

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
        .locale("uk")
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

  const aimCategoryCol: ColDef = {
    field: "aim-category-col",
    headerName: "Категорія цілі",
    pinned: "left",
    width: 220,
  };

  return [aimCategoryCol, ...newColDefs];
};

const getRows = (
  allAims: IAimData[] | undefined,
  taskGroupsData: ITasksGroup[] | undefined,
  monthsDates: (Dayjs | null)[],
  aimCategories: IAimsCategoryData[] = [],
) => {
  if (!allAims) return [];
  const [rangeFrom, rangeTo] = monthsDates;
  if (!rangeFrom || !rangeTo) return [];

  return allAims
    .filter((aim) => isAimInRange(aim, monthsDates))
    .map((aim) => {
      const aimDateFrom = dayjs(aim.dateFrom);
      const aimDateTo = dayjs(aim.dateTo);
      const calendarDateFrom = aimDateFrom.isBefore(rangeFrom.startOf("month"))
        ? rangeFrom.startOf("month")
        : aimDateFrom;
      const calendarDateTo = aimDateTo.isAfter(rangeTo.endOf("month"))
        ? rangeTo.endOf("month")
        : aimDateTo;
      const monthDiff = calendarDateTo.month() - calendarDateFrom.month() + 1;
      const yearDiff = calendarDateTo.year() - calendarDateFrom.year();
      const difference = monthDiff + yearDiff * 12;

      return {
        ...aim,
        [`col-${calendarDateFrom.year()}-${calendarDateFrom.month()}`]:
          aim.title,
        "aim-category-col": getRelationTitle(
          aim.aimsCategoryId,
          aimCategories,
          "Без категорії",
        ),
        colName: `col-${calendarDateFrom.year()}-${calendarDateFrom.month()}`,
        differenceMonths: difference,
        calendarDateFrom: calendarDateFrom.format("YYYY/MM/DD"),
        calendarDateTo: calendarDateTo.format("YYYY/MM/DD"),
        taskGroupsData,
      };
    });
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
