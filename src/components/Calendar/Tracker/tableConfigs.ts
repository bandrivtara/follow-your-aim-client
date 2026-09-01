import { ColDef } from "ag-grid-community";
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
import { filterTrackerRows, TrackerCategoryFilter } from "./rowFilters";
import { isTrackerActivityArchived } from "./archiveVisibility";
import { normalizeHistoryDayKey } from "share/functions/historyDayKey";

export interface IHabitRow {
  habitDetails: IHabitData;
  calendarMode: ITrackerCalendarState;
  category?: string;
  currentDate: { year: number | null; month: number | null };
  id?: string;
  scheduleTime?: string;
}

export const getTrackerDayColumnLayout = (daysCount: number) => {
  if (daysCount > 7) {
    return { width: 64, minWidth: 64, maxWidth: 64, flex: 0 };
  }

  return {
    width: undefined,
    minWidth: daysCount === 1 ? 180 : 90,
    maxWidth: undefined,
    flex: 1,
  };
};

const getColumnDefs = (
  currentDate: (Dayjs | null)[],
  calendarMode: ITrackerCalendarState,
  isMobile = false,
): ColDef[] => {
  if (!currentDate[0] || !currentDate[1]) return [];

  const days = getDaysBetweenDates(currentDate[0], currentDate[1]);
  const dayColumnLayout = getTrackerDayColumnLayout(days.length);

  const dayCols: ColDef[] = days.map((dayData) => {
    const isToday = dayjs(dayData.date).isSame(dayjs(), "day");
    return {
      field: dayData.day,
      headerName: `${dayData.weekday}, ${dayData.day}`,
      ...dayColumnLayout,
      cellRenderer: DayCellRenderer,
      cellRendererParams: { calendarMode, dayData },
      cellClass: isToday ? "day-cell day-cell--today" : "day-cell",
      headerClass: isToday ? "day-header--today" : undefined,
    };
  });

  const habitDetailsCol: ColDef[] = [
    {
      field: "details",
      headerName: "Активність",
      cellRenderer: RowNameRenderer,
      pinned: "left",
      width: isMobile ? 150 : 220,
    },
  ];

  return [...habitDetailsCol, ...dayCols];
};

const getRows = (
  habitsData: IHabitData[] = [],
  taskGroupsData: ITasksGroup[] = [],
  history: IHistoryData[] = [],
  rowSortingType: string,
  filteredCategory: TrackerCategoryFilter,
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
        const dayHistory = historyData[day];
        if (!/^\d{1,2}$/.test(day) || typeof dayHistory !== "object") continue;
        const normalizedDay = normalizeHistoryDayKey(day);

        for (let id in dayHistory) {
          if (
            rowItems &&
            rowItems[id] &&
            !rowItems[id].isHidden &&
            !rowItems[id].isArchived
          ) {
            let existingObject: any = rows.find((row) => row.id === id);
            if (!existingObject) {
              existingObject = {
                id: id,
                details: rowItems[id],
              };
              rows.push(existingObject);
            }

            const existingActivity = existingObject[normalizedDay];
            const incomingActivity = dayHistory[id];
            const existingProgress = Number(existingActivity?.progress || 0);
            const incomingProgress = Number(incomingActivity?.progress || 0);

            if (!existingActivity || incomingProgress >= existingProgress) {
              existingObject[normalizedDay] = { ...incomingActivity };
            }
          }
        }
      }
    });
  }

  rowsToShow.forEach((habit) => {
    if (
      !rows.find((row) => row.id === habit.id) &&
      !habit.isHidden &&
      !isTrackerActivityArchived(habit)
    ) {
      rows.push({
        id: habit.id,
        details: rowItems[habit.id],
      });
    }
  });

  const filteredRows = filterTrackerRows(rows, filteredCategory);

  if (rowSortingType === "alphabetic") {
    // @ts-ignore
    return _.orderBy(filteredRows, [(row) => row.details.title]);
  } else if (rowSortingType === "schedule-time") {
    // @ts-ignore
    return _.orderBy(filteredRows, [(row) => row.details.title]).sort(
      compareTime,
    );
  }
  return filteredRows;
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
