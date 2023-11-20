import { ColDef } from "ag-grid-community";
import ActivityCellRenderer from "./Activities/ActivityCellRenderer";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import DayCellRenderer from "./DayCellRenderer/DayCellRenderer";
import { getDaysOfMonth } from "../../share/functions/getDaysOfMonth";
import { Dayjs } from "dayjs";
import { ICalendarState } from "./Calendar";
import _ from "lodash";
import { IActivityData, IActivityDetails } from "../../types/activity.types";

export interface IActivityRow {
  activityDetails: IActivityDetails;
  calendarMode: ICalendarState;
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

  const activityDetailsCol: ColDef[] = [
    {
      field: "activityDetails",
      headerName: "Назва",
      cellRenderer: ActivityCellRenderer,
      pinned: "left",
      width: 220,
    },
  ];

  return [...activityDetailsCol, ...dayCols];
};

const getRows = (
  data: IActivityData[] = [],
  currentDate: (Dayjs | null)[],
  calendarMode: ICalendarState,
  filteredCategory: string
) => {
  const newRows = data
    ?.map((activityData) => {
      const activityRows = {
        id: activityData.id,
        activityDetails: activityData.details,
        scheduleTime: activityData.details.scheduleTime,
        currentDate: {
          year: currentDate[0] && currentDate[0].year(),
          month: currentDate[0] && currentDate[0].month() + 1,
        },
        category: activityData.details.category,
        calendarMode,
      };

      if (
        activityData.history &&
        currentDate[0] &&
        activityData.history[currentDate[0].year()]
      ) {
        return {
          ...activityRows,
          ...activityData.history[currentDate[0].year()][
            currentDate[0].month() + 1
          ],
        };
      }

      return activityRows;
    })
    .sort((a, b) => {
      const timeA = a.activityDetails.scheduleTime;
      const timeB = b.activityDetails.scheduleTime;

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
    .filter((activity) => {
      console.log(activity);
      if (filteredCategory === "all" || filteredCategory === "grouped") {
        return activity;
      } else if (
        filteredCategory === "only-planned" &&
        currentDate[0] &&
        currentDate[1] &&
        currentDate[0].date() - currentDate[1].date() === 0
      ) {
        // @ts-ignore
        const currentActivityData = activity[`${currentDate[0].date()}`];

        return (
          currentActivityData &&
          (currentActivityData.value ||
            currentActivityData.isPlanned ||
            currentActivityData.plannedValue ||
            currentActivityData.isComplete)
        );
      } else {
        return activity.category === filteredCategory;
      }
    })
    .filter((activity) => !activity.activityDetails.isHidden);

  if (filteredCategory === "grouped" && newRows) {
    const sortedSportActivity: IActivityRow = newRows.reduce(
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
        activityDetails: {
          id: "some_id",
          title: "Спорт",
          valueType: "number",
        },
      }
    );

    return [
      ...newRows.filter(
        (activity) => activity.activityDetails.category !== "sport"
      ),
      sortedSportActivity,
    ];
  }

  return newRows;
};

const tableConfigs = {
  getColumnDefs,
  getRows,
};

export default tableConfigs;
