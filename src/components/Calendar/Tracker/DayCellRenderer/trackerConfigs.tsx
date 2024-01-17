import { ReactNode } from "react";
import { IValueTypes } from "types/habits.types";
import { IDayCellEditor } from "../DayCellEditor/DayCellEditor";
import { ColDef } from "ag-grid-community";
import MeasureTracker from "../DayCellEditor/Measure/Measure";
import BooleanTracker from "../DayCellEditor/Boolean/Boolean";
import ListTracker from "../DayCellEditor/List/List";
import Time from "../DayCellEditor/Specific/Time";
import DurationTracker from "../DayCellEditor/Duration/Duration";

interface IValue {
  value: any;
  isComplete: boolean;
  isPlanned: boolean;
  plannedValue: any;
  values: any;
  plannedValues: any;
  from?: number[];
  to?: number[];
}

export type IStopEditing = (
  suppressNavigateAfterEdit?: boolean | undefined
) => void;

type TTrackerConfig = {
  [trackerType in IValueTypes]: {
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

export const trackerConfigs: TTrackerConfig = {
  number: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <MeasureTracker colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell, data) => ({
      component: (
        <>
          {cell.values?.[data.details.fields[0].id] ||
            cell.plannedValues?.[data.details.fields[0].id] ||
            ""}
        </>
      ),
      progress:
        cell?.values &&
        cell.values[data.details.fields[0].id] /
          (cell?.plannedValues?.[data.details.fields[0].id] ||
            data.details.fields[0].minToComplete ||
            ""),
      isPlanned: !!cell.plannedValues,
    }),
  },
  boolean: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <BooleanTracker colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell) => {
      return {
        component: <>{cell.isComplete && "+"}</>,
        progress: cell.isComplete && 1,
        isPlanned: cell.isPlanned,
      };
    },
  },
  taskGroup: {
    cellEditor: ({ colDef, stopEditing, data }) => (
      <ListTracker colDef={colDef} stopEditing={stopEditing} data={data} />
    ),
    cellRenderer: (cell) => {
      let progress = 0;
      let isPlanned = false;

      if (cell.value) {
        const trackerStatus = cell.value.split("/");
        progress = +trackerStatus[0] / +trackerStatus[1];
        isPlanned = true;
      }

      return {
        component: <>{cell.value}</>,
        progress,
        isPlanned,
      };
    },
  },
  // meals: {
  //   cellEditor: ({ data, form, colDef }) => (
  //     <DietaryTracker data={data} colDef={colDef} form={form} />
  //   ),
  //   cellRenderer: (cell) => {
  //     return {
  //       component: <>{cell.value}</>,
  //       progress: cell.value > 1 && 1,
  //       isPlanned: true,
  //     };
  //   },
  // },
  duration: {
    cellEditor: ({ data, colDef, stopEditing }) => (
      <DurationTracker data={data} colDef={colDef} stopEditing={stopEditing} />
    ),
    cellRenderer: (cell) => {
      return {
        component: (
          <>
            {cell.value &&
              `${cell.from?.[0]}:${cell.from?.[1]}-${cell.to?.[0]}:${cell.to?.[1]}`}
          </>
        ),
        progress: false,
        isPlanned: cell.value,
      };
    },
  },
};
