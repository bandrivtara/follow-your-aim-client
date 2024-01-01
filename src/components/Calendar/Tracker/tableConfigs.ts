import { ColDef } from "ag-grid-community";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import DayCellRenderer from "./DayCellRenderer/DayCellRenderer";
import { getDaysOfMonth } from "share/functions/getDaysOfMonth";
import dayjs, { Dayjs } from "dayjs";
import { ITrackerCalendarState } from "./TrackerCalendar";
import _ from "lodash";
import { IHabitData } from "types/habits.types";
import {
  IHabitDayValues,
  IHistoryData,
  IHistoryDayRow,
} from "types/history.types";
import RowNameRenderer from "./DayCellRenderer/RowNameRenderer";

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
  historyData: IHistoryData = {},
  currentDate: (Dayjs | null)[],
  rowSortingType: string
) => {
  const currentMMYYYY = dayjs(currentDate[0]).format("MM-YYYY");
  const habits: any = {};
  habitsData.forEach((item) => {
    habits[item.id] = item;
  });

  // Create an array to hold the transformed objects
  let rows: IHistoryDayRow[] = [];

  // Iterate through each key in the input object
  for (let day in historyData) {
    // Iterate through each id in the object for the current day
    for (let id in historyData[day]) {
      // Check if there is already an object with the same id in the rows
      if (habits && habits[id]) {
        let existingObject: any = rows.find((row) => row.id === id);

        // If the object doesn't exist, create a new one
        if (!existingObject) {
          existingObject = {
            id: id,
            details: habits[id],
            currentDate: currentMMYYYY,
          };
          rows.push(existingObject);
        }

        // Add the value to the existing object under the current day
        existingObject[day] = { ...historyData[day][id] };
      }
    }
  }

  if (historyData) {
    // Include items from habitsData with empty values if they are not present in the historyData
    habitsData.forEach((habit) => {
      if (!rows.find((row) => row.id === habit.id)) {
        rows.push({
          id: habit.id,
          details: habits[habit.id],
          currentDate: currentMMYYYY,
        });
      }
    });
  }

  function compareTime(a: any, b: any) {
    const timeA = a.details.scheduleTime || [24, 0];
    const timeB = b.details.scheduleTime || [24, 0];

    // Compare hours
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }

    // If hours are the same, compare minutes
    return timeA[1] - timeB[1];
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
