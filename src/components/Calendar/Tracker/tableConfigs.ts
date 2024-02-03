import { ColDef } from "ag-grid-community";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import DayCellRenderer from "./DayCellRenderer/DayCellRenderer";
import { getDaysBetweenDates } from "share/functions/getDaysBetweenDates";
import dayjs, { Dayjs } from "dayjs";
import { ITrackerCalendarState } from "./TrackerCalendar";
import _ from "lodash";
import { IHabitData } from "types/habits.types";
import { IHistoryData, IHistoryDayRow } from "types/history.types";
import RowNameRenderer from "./RowNameRenderer/RowNameRenderer";
import compareTime from "share/functions/compareTime";
import { ITasksGroup } from "types/taskGroups";

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

  const days = getDaysBetweenDates(currentDate[0], currentDate[1]);

  const dayCols: ColDef[] = [];
  console.log(days);

  days.forEach((dayData) => {
    dayCols.push({
      field: dayData.day,
      headerName: `${dayData.day} ${dayData.weekday}`,
      minWidth: 60,
      editable: true,
      cellEditorPopup: true,
      cellRenderer: DayCellRenderer,
      cellRendererParams: { calendarMode, dayData },
      cellEditor: DayCellEditor,
      cellClass: "day-cell",
      flex: 1,
    });
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
  taskGroupsData: ITasksGroup[] = [],
  history: IHistoryData[] = [],
  rowSortingType: string
) => {
  const rowItems: any = {};
  const rowsToShow = [...habitsData, ...taskGroupsData];
  rowsToShow.forEach((rowData) => {
    rowItems[rowData.id] = rowData;
  });
  let rows: IHistoryDayRow[] = [];

  if (history[0]) {
    history.forEach((historyData) => {
      for (let day in historyData) {
        for (let id in historyData[day]) {
          if (rowItems && rowItems[id] && !rowItems[id].isHidden) {
            let existingObject: any = rows.find((row) => row.id === id);
            if (!existingObject) {
              existingObject = {
                id: id,
                details: rowItems[id],
              };
              rows.push(existingObject);
            }

            existingObject[day] = { ...historyData[day][id] };
          }
        }
      }
    });
  }

  rowsToShow.forEach((habit) => {
    if (!rows.find((row) => row.id === habit.id) && !habit.isHidden) {
      rows.push({
        id: habit.id,
        details: rowItems[habit.id],
      });
    }
  });

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
