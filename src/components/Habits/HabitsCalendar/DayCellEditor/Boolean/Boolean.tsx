import { useEffect } from "react";
import { IDayCellEditor } from "../DayCellEditor";
import { ColDef } from "ag-grid-community";
import { IStopEditing } from "../../HabitCellRenderer/habitConfigs";
import { useUpdateHistoryMutation } from "store/services/history";

interface IProps {
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
  data: IDayCellEditor;
}

const BooleanHabit = ({ data, colDef }: IProps) => {
  const [updateHistory] = useUpdateHistoryMutation();
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode } = colDef.cellRendererParams;

  useEffect(() => {
    const changeStatus = async () => {
      if (colDef.field) {
        const isComplete = cellData?.isComplete || false;
        const isPlanned = cellData?.isPlanned || false;
        const habitToUpdate = {
          id: data.currentDate,
          data: {
            isPlanned: calendarMode === "planning" ? !isPlanned : isPlanned,
            isComplete: calendarMode === "tracking" ? !isComplete : isComplete,
          },
          path: `${colDef.field}.${data.id}`,
        };

        await updateHistory(habitToUpdate).unwrap();
      }
    };
    changeStatus();
  }, [cellData, colDef.field, data, updateHistory]);
  return <></>;
};

export default BooleanHabit;
