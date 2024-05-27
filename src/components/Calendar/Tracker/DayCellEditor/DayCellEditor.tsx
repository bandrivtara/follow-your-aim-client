import { ICellEditorParams } from "ag-grid-community";
import { forwardRef, memo } from "react";
import { IHabitData } from "types/habits.types";
import { cellConfigs } from "../cellConfigs";

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
      const activityType = data?.details?.type;
      const activityValueType = data?.details?.valueType;

      const currentCellEditorData =
        data &&
        data?.details.type &&
        cellConfigs[activityType][activityValueType].cellEditor({
          data,
          colDef,
          stopEditing,
        });

      return <div tabIndex={1}>{data && currentCellEditorData}</div>;
    }
  )
);

export default DayCellEditor;
