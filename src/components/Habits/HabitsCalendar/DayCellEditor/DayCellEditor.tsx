import { ICellEditorParams } from "ag-grid-community";
import { forwardRef, memo } from "react";
import { IHabitDetails } from "types/habits.types";
import { habitConfigs } from "../HabitCellRenderer/habitConfigs";

export interface IDayCellEditor {
  id: string;
  habitDetails: IHabitDetails;
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
        data.habitDetails.valueType &&
        habitConfigs[data.habitDetails.valueType].cellEditor({
          data,
          colDef,
          stopEditing,
        });

      return <div tabIndex={1}>{data && currentCellEditorData}</div>;
    }
  )
);

export default DayCellEditor;
