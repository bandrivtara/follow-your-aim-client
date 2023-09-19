import { IDayCellEditor } from "../DayCellEditor";
import { useEffect } from "react";
import { ColDef } from "ag-grid-community";
import { IStopEditing } from "../../Activities/activityConfigs";
import { useUpdateActivityMutation } from "../../../../store/services/activity";

interface IProps {
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
  data: IDayCellEditor;
}

const BooleanActivity = ({ data, colDef }: IProps) => {
  const [updateActivity] = useUpdateActivityMutation();
  const cellData = colDef.field && data[+colDef.field];

  useEffect(() => {
    const changeStatus = async () => {
      if (colDef.field) {
        const isComplete = cellData?.isComplete || false;
        const isPlanned = cellData?.isPlanned || false;

        const activityToUpdate = {
          id: data.id,
          data: {
            isPlanned:
              data.calendarMode === "planning" ? !isPlanned : isPlanned,
            isComplete:
              data.calendarMode === "tracking" ? !isComplete : isComplete,
          },
          path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
        };
        await updateActivity(activityToUpdate).unwrap();
      }
    };
    changeStatus();
  }, [cellData, colDef.field, data, updateActivity]);
  return <></>;
};

export default BooleanActivity;
