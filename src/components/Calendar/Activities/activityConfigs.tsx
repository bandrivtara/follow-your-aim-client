import { ReactNode } from "react";
import { IValueTypes } from "../../../types/activity.types";
import { IDayCellEditor } from "../DayCellEditor/DayCellEditor";
import { ColDef } from "ag-grid-community";
import MeasureActivity from "../DayCellEditor/MeasureActivity/MeasureActivity";
import BooleanActivity from "../DayCellEditor/BooleanActivity/BooleanActivity";
import ListActivity from "../DayCellEditor/ListActivity/ListActivity";
import Time from "../DayCellEditor/SpecificActivity/Time";
import DurationActivity from "../DayCellEditor/DurationActivity/DurationActivity";

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

type TActivityConfig = {
  [activityType in IValueTypes]: {
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

export const activityConfigs: TActivityConfig = {
  number: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <MeasureActivity colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell, data) => ({
      component: <>{cell.value || cell.plannedValue}</>,
      progress:
        cell.value /
        (cell.plannedValue || data.activityDetails.minToComplete || ""),
      isPlanned: !!cell.plannedValue,
    }),
  },
  boolean: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <BooleanActivity colDef={colDef} stopEditing={stopEditing} data={data} />
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
      <ListActivity colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell) => {
      const activityStatus = cell.value.split("/");
      const progress = +activityStatus[0] / +activityStatus[1];

      return {
        component: <>{cell.value}</>,
        progress,
        isPlanned: true,
      };
    },
  },
  // meals: {
  //   cellEditor: ({ data, form, colDef }) => (
  //     <DietaryActivity data={data} colDef={colDef} form={form} />
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
      <DurationActivity data={data} colDef={colDef} stopEditing={stopEditing} />
    ),
    cellRenderer: (cell) => {
      console.log(cell, 333333);
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
