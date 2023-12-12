import { ReactNode } from "react";
import { IValueTypes } from "types/habits.types";
import { IDayCellEditor } from "../DayCellEditor/DayCellEditor";
import { ColDef } from "ag-grid-community";
import MeasureHabit from "../DayCellEditor/Measure/Measure";
import BooleanHabit from "../DayCellEditor/Boolean/Boolean";
import ListHabit from "../DayCellEditor/List/List";
import Time from "../DayCellEditor/Specific/Time";
import DurationHabit from "../DayCellEditor/Duration/Duration";

interface IValue {
  value: any;
  isComplete: boolean;
  isPlanned: boolean;
  plannedValue: any;
  from?: number[];
  to?: number[];
}

export type IStopEditing = (
  suppressNavigateAfterEdit?: boolean | undefined
) => void;

type THabitConfig = {
  [habitType in IValueTypes]: {
    cellEditor: (cellEditorData: {
      data: IDayCellEditor;
      colDef: ColDef<IDayCellEditor>;
      stopEditing: IStopEditing;
    }) => ReactNode;
    cellRenderer: (
      cell: IValue,
      data?: any
    ) => {
      component: ReactNode;
      progress: number | boolean;
      isPlanned: boolean;
    };
  };
};

export const habitConfigs: THabitConfig = {
  number: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <MeasureHabit colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell, data) => ({
      component: <>{cell.value || cell.plannedValue}</>,
      progress:
        cell.value /
        (cell.plannedValue || data.habitDetails.minToComplete || ""),
      isPlanned: !!cell.plannedValue,
    }),
  },
  boolean: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <BooleanHabit colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell) => {
      return {
        component: <>{cell.isComplete && "+"}</>,
        progress: cell.isComplete && 1,
        isPlanned: cell.isPlanned,
      };
    },
  },
  array: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <ListHabit colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell) => {
      const habitStatus = cell.value.split("/");
      const progress = +habitStatus[0] / +habitStatus[1];

      return {
        component: <>{cell.value}</>,
        progress,
        isPlanned: true,
      };
    },
  },
  // meals: {
  //   cellEditor: ({ data, form, colDef }) => (
  //     <DietaryHabit data={data} colDef={colDef} form={form} />
  //   ),
  //   cellRenderer: (cell) => {
  //     return {
  //       component: <>{cell.value}</>,
  //       progress: cell.value > 1 && 1,
  //       isPlanned: true,
  //     };
  //   },
  // },
  time: {
    cellEditor: ({ data, colDef, stopEditing }) => (
      <Time colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell) => {
      return {
        component: <>{cell.value && `${cell.value[0]}:${cell.value[1]}`}</>,
        progress: cell.value > 1 && 1,
        isPlanned: cell.plannedValue?.[0] || 0,
      };
    },
  },
  duration: {
    cellEditor: ({ data, colDef, stopEditing }) => (
      <DurationHabit data={data} colDef={colDef} stopEditing={stopEditing} />
    ),
    cellRenderer: (cell) => {
      return {
        component: (
          <>
            {`${cell.from?.[0]}:${cell.from?.[1]}-${cell.to?.[0]}:${cell.to?.[1]}`}
          </>
        ),
        progress: false,
        isPlanned: true,
      };
    },
  },
};
