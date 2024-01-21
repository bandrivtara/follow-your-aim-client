import { ColDef } from "ag-grid-community";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import DayCellRenderer from "./DayCellRenderer/DayCellRenderer";
import { getDaysOfMonth } from "share/functions/getDaysOfMonth";
import dayjs, { Dayjs } from "dayjs";
import { ITrackerCalendarState } from "./TrackerCalendar";
import _ from "lodash";
import { IHabitData } from "types/habits.types";
import { IHistoryData, IHistoryDayRow } from "types/history.types";
import RowNameRenderer from "./RowNameRenderer/RowNameRenderer";
import compareTime from "share/functions/compareTime";
import { ITaskGroups } from "types/taskGroups";

export interface IHabitRow {
  habitDetails: IHabitData;
  calendarMode: ITrackerCalendarState;
  category?: string;
  currentDate: { year: number | null; month: number | null };
  id?: string;
  scheduleTime?: string;
}

const getColumnDefs = (
  currentDate: (Dayjs | null)[],
  calendarMode: ITrackerCalendarState
): ColDef[] => {
  if (!currentDate[0] || !currentDate[1]) return [];

  const days = getDaysOfMonth(
    currentDate[0].month() + 1,
    currentDate[0].year()
  );

  const dayCols: ColDef[] = [];

  days.forEach((day) => {
    if (
      currentDate[0] &&
      currentDate[1] &&
      parseFloat(day.day) >= currentDate[0].date() &&
      parseFloat(day.day) <= currentDate[1].date()
    ) {
      dayCols.push({
        field: day.day,
        headerName: `${day.day} ${day.weekday}`,
        minWidth: 60,
        editable: true,
        cellEditorPopup: true,
        cellRenderer: DayCellRenderer,
        cellRendererParams: { calendarMode },
        cellEditor: DayCellEditor,
        cellClass: "day-cell",
        flex: 1,
      });
    }
  });

  const habitDetailsCol: ColDef[] = [
    {
      field: "details",
      headerName: "Назва",
      cellRenderer: RowNameRenderer,
      pinned: "left",
      width: 220,
    },
  ];

  return [...habitDetailsCol, ...dayCols];
};

const getRows = (
  habitsData: IHabitData[] = [],
  taskGroupsData: ITaskGroups[] = [],
  historyData: IHistoryData = {},
  currentDate: (Dayjs | null)[],
  rowSortingType: string
) => {
  const currentMMYYYY = dayjs(currentDate[0]).format("MM-YYYY");
  const rowItems: any = {};
  // taskGroupsData.forEach((taskGroup) => {
  //   rowItems[taskGroup.id] = taskGroup;
  // });
  console.log(taskGroupsData);
  const rowsToShow = [...habitsData, ...taskGroupsData];
  rowsToShow.forEach((rowData) => {
    rowItems[rowData.id] = rowData;
  });
  console.log(rowItems);
  let rows: IHistoryDayRow[] = [];

  for (let day in historyData) {
    for (let id in historyData[day]) {
      if (rowItems && rowItems[id] && !rowItems[id].isHidden) {
        let existingObject: any = rows.find((row) => row.id === id);
        if (!existingObject) {
          existingObject = {
            id: id,
            details: rowItems[id],
            currentDate: currentMMYYYY,
          };
          rows.push(existingObject);
        }

        existingObject[day] = { ...historyData[day][id] };
      }
    }
  }

  if (historyData) {
    rowsToShow.forEach((habit) => {
      if (!rows.find((row) => row.id === habit.id) && !habit.isHidden) {
        rows.push({
          id: habit.id,
          details: rowItems[habit.id],
          currentDate: currentMMYYYY,
        });
      }
    });
  }
  if (rowSortingType === "alphabetic") {
    // @ts-ignore
    return _.orderBy(rows, [(row) => row.details.title]);
  } else if (rowSortingType === "schedule-time") {
    // @ts-ignore
    return _.orderBy(rows, [(row) => row.details.title]).sort(compareTime);
  }
  return rows;
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
