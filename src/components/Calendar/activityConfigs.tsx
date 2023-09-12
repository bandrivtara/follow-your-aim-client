import { ReactNode } from "react";
import { IValueTypes } from "../../types/activity.types";
import { IDayCellEditor } from "./DayCellEditor/DayCellEditor";
import { FormInstance } from "antd";
import { ColDef } from "ag-grid-community";
import MeasureActivity from "./DayCellEditor/MeasureActivity/MeasureActivity";
import BooleanActivity from "./DayCellEditor/BooleanActivity/BooleanActivity";
import ListActivity from "./DayCellEditor/ListActivity/ListActivity";
import DietaryActivity from "./DayCellEditor/SpecificActivity/DietaryActivity(TODO)";
import Time from "./DayCellEditor/SpecificActivity/Time";

interface IValue {
  value: any;
  isComplete: boolean;
  isPlanned: boolean;
  plannedValue: any;
}

type TActivityConfig = {
  [activityType in IValueTypes]: {
    cellEditor: (
      data: IDayCellEditor,
      form: FormInstance<any>,
      colDef: ColDef<IDayCellEditor>
    ) => ReactNode;
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
    cellEditor: (data, form) => <MeasureActivity data={data} form={form} />,
    cellRenderer: (cell, data) => ({
      component: <>{cell.value || cell.plannedValue}</>,
      progress:
        cell.value /
        (cell.plannedValue || data.activityData.minToComplete || ""),
      isPlanned: !!cell.plannedValue,
    }),
  },
  boolean: {
    cellEditor: (data, form, colDef) => (
      <BooleanActivity form={form} data={data} colDef={colDef} />
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
    cellEditor: (_data, form) => <ListActivity form={form} />,
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
  meals: {
    cellEditor: (data, form, colDef) => (
      <DietaryActivity data={data} colDef={colDef} form={form} />
    ),
    cellRenderer: (cell) => {
      return {
        component: <>{cell.value}</>,
        progress: cell.value > 1 && 1,
        isPlanned: true,
      };
    },
  },
  time: {
    cellEditor: (data, _form, _colDef) => <Time data={data} />,
    cellRenderer: (cell) => {
      return {
        component: <>{cell.value && `${cell.value[0]}:${cell.value[1]}`}</>,
        progress: cell.value > 1 && 1,
        isPlanned: cell.plannedValue?.[0] || 0,
      };
    },
  },
};
