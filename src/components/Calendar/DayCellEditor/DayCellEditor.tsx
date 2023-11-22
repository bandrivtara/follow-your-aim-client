import { ICellEditorParams } from "ag-grid-community";
import { forwardRef, memo } from "react";
import { IActivityDetails } from "../../../types/activity.types";
import { activityConfigs } from "../Activities/activityConfigs";

export interface IDayCellEditor {
  id: string;
  activityDetails: IActivityDetails;
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
        data.activityDetails.valueType &&
        activityConfigs[data.activityDetails.valueType].cellEditor({
          data,
          colDef,
          stopEditing,
        });

      return <div tabIndex={1}>{data && currentCellEditorData}</div>;
    }
  )
);

export default DayCellEditor;
