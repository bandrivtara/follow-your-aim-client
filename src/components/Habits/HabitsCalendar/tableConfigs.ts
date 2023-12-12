import { ColDef } from "ag-grid-community";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import DayCellRenderer from "./DayCellRenderer/DayCellRenderer";
import { getDaysOfMonth } from "share/functions/getDaysOfMonth";
import { Dayjs } from "dayjs";
import { IHabitsCalendarState } from "./HabitsCalendar";
import _ from "lodash";
import { IHabitData, IHabitDetails } from "types/habits.types";
import HabitCellRenderer from "./HabitCellRenderer/HabitCellRenderer";

export interface IHabitRow {
  habitDetails: IHabitDetails;
  calendarMode: IHabitsCalendarState;
  category?: string;
  currentDate: { year: number | null; month: number | null };
  id?: string;
  scheduleTime?: string;
}

const getColumnDefs = (currentDate: (Dayjs | null)[]): ColDef[] => {
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
        cellEditor: DayCellEditor,
        cellClass: "day-cell",
        flex: 1,
      });
    }
  });

  const habitDetailsCol: ColDef[] = [
    {
      field: "habitDetails",
      headerName: "Назва",
      cellRenderer: HabitCellRenderer,
      pinned: "left",
      width: 220,
    },
  ];

  return [...habitDetailsCol, ...dayCols];
};

const getRows = (
  data: IHabitData[] = [],
  currentDate: (Dayjs | null)[],
  calendarMode: IHabitsCalendarState,
  filteredCategory: string
) => {
  const newRows = data
    ?.map((habitData) => {
      const habitRows = {
        id: habitData.id,
        habitDetails: habitData.details,
        scheduleTime: habitData.details.scheduleTime,
        currentDate: {
          year: currentDate[0] && currentDate[0].year(),
          month: currentDate[0] && currentDate[0].month() + 1,
        },
        category: habitData.details.category,
        calendarMode,
        store: habitData.store || null,
      };

      if (
        habitData.history &&
        currentDate[0] &&
        habitData.history[currentDate[0].year()]
      ) {
        return {
          ...habitRows,
          ...habitData.history[currentDate[0].year()][
            currentDate[0].month() + 1
          ],
        };
      }

      return habitRows;
    })
    .sort((a, b) => {
      const timeA = a.habitDetails.scheduleTime;
      const timeB = b.habitDetails.scheduleTime;

      if (!timeA && !timeB) {
        return 0; // No scheduleTime for both, maintain order
      } else if (!timeA) {
        return 1; // No scheduleTime for A, move it after B
      } else if (!timeB) {
        return -1; // No scheduleTime for B, move it after A
      } else {
        if (timeA[0] !== timeB[0]) {
          return +timeA[0] - +timeB[0]; // Compare hours
        } else {
          return +timeA[1] - +timeB[1]; // Compare minutes
        }
      }
    })
    .filter((habit) => {
      if (filteredCategory === "all" || filteredCategory === "grouped") {
        return habit;
      } else if (
        filteredCategory === "only-planned" &&
        currentDate[0] &&
        currentDate[1] &&
        currentDate[0].date() - currentDate[1].date() === 0
      ) {
        // @ts-ignore
        const currentHabitData = habit[`${currentDate[0].date()}`];

        return (
          currentHabitData &&
          (currentHabitData.value ||
            currentHabitData.isPlanned ||
            currentHabitData.plannedValue ||
            currentHabitData.isComplete)
        );
      } else {
        return habit.category === filteredCategory;
      }
    })
    .filter((habit) => !habit.habitDetails.isHidden);

  if (filteredCategory === "grouped" && newRows) {
    const sortedSportHabit: IHabitRow = newRows.reduce(
      (acc, currentValue) => {
        let result: any = {};
        const obj1: any = _.pickBy(currentValue, (_value, key) => !isNaN(+key));
        const obj2: any = _.pickBy(acc, (_value, key) => !isNaN(+key));

        if (currentValue.category === "sport") {
          for (const key in obj1) {
            if (obj1.hasOwnProperty(key)) {
              if (obj2.hasOwnProperty(key)) {
                result[key] = {
                  value: obj1[key].value + obj2[key].value,
                  plannedValue: obj1[key].plannedValue + obj2[key].plannedValue,
                };
              } else {
                result[key] = obj1[key];
              }
            }
          }
        }
        return { ...acc, ...result };
      },
      {
        id: "some_id",
        calendarMode: "tracking",
        currentDate: {
          year: currentDate[0] && currentDate[0].year(),
          month: currentDate[0] && currentDate[0].month() + 1,
        },
        habitDetails: {
          id: "some_id",
          title: "Спорт",
          valueType: "number",
        },
      }
    );

    return [
      ...newRows.filter((habit) => habit.habitDetails.category !== "sport"),
      sortedSportHabit,
    ];
  }

  return newRows;
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
