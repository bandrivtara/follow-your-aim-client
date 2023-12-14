import { ICellEditorParams } from "ag-grid-community";
import { forwardRef, memo } from "react";
import { IHabitData } from "types/habits.types";
import { habitConfigs } from "../HabitCellRenderer/habitConfigs";

export interface IDayCellEditor {
  id: string;
  details: IHabitData;
  currentDate: {
    year: number;
    month: number;
  };
  store: any[];
  calendarMode: any;
  [day: number]: any;
}

const DayCellEditor = memo(
  forwardRef(
    ({ data, colDef, stopEditing }: ICellEditorParams<IDayCellEditor>) => {
      const currentCellEditorData =
        data &&
        data.details.valueType &&
        habitConfigs[data.details.valueType].cellEditor({
          data,
          colDef,
          stopEditing,
        });

      return <div tabIndex={1}>{data && currentCellEditorData}</div>;
    }
  )
);

export default DayCellEditor;
