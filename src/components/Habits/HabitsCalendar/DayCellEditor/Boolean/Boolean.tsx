import { useEffect } from "react";
import { IDayCellEditor } from "../DayCellEditor";
import { ColDef } from "ag-grid-community";
import { useUpdateHabitMutation } from "store/services/habits";
import { IStopEditing } from "../../HabitCellRenderer/habitConfigs";

interface IProps {
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
  data: IDayCellEditor;
}

const BooleanHabit = ({ data, colDef }: IProps) => {
  const [updateHabit] = useUpdateHabitMutation();
  const cellData = colDef.field && data[+colDef.field];

  useEffect(() => {
    const changeStatus = async () => {
      if (colDef.field) {
        const isComplete = cellData?.isComplete || false;
        const isPlanned = cellData?.isPlanned || false;

        const habitToUpdate = {
          id: data.id,
          data: {
            isPlanned:
              data.calendarMode === "planning" ? !isPlanned : isPlanned,
            isComplete:
              data.calendarMode === "tracking" ? !isComplete : isComplete,
          },
          path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
        };
        await updateHabit(habitToUpdate).unwrap();
      }
    };
    changeStatus();
  }, [cellData, colDef.field, data, updateHabit]);
  return <></>;
};

export default BooleanHabit;
