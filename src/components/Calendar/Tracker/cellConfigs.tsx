// @ts-nocheck

import { ColDef } from "ag-grid-community";
import { IActivityHistoryData } from "types/history.types";
import Boolean from "./DayCellEditor/HabitCellEditor/Boolean";
import Measures from "./DayCellEditor/HabitCellEditor/Measures";
import { ITask } from "types/taskGroups";
import TodoList from "./DayCellEditor/TasksGroupCellEditor/TodoList";
import { IHabitData } from "types/habits.types";

export type IStopEditing = (
  suppressNavigateAfterEdit?: boolean | undefined,
) => void;

export interface IHabitDayData {
  id: string;
  details: IHabitData;
  currentDate: string;
  [day: string]: any;
}

export interface IMeasureCellEditor {
  data: IHabitDayData;
  colDef: ColDef<IHabitDayData>;
  stopEditing: IStopEditing;
}

export interface IMeasureCellRenderer {
  cell: IActivityHistoryData;
  data?: IHabitDayData;
}

export const cellConfigs = {
  habit: {
    boolean: {
      cellEditor: ({ colDef, stopEditing, data }: IMeasureCellEditor) => (
        <Boolean colDef={colDef} stopEditing={stopEditing} data={data} />
      ),
      cellRenderer: (cell) => {
        return {
          component: (
            <>{cell.status === "failed" ? "×" : cell.progress === 100 && "+"}</>
          ),
          progress: cell.progress,
          isPlanned: !!cell.isPlanned,
          isFailed: cell.status === "failed",
          failureReason: cell.failureReason,
        };
      },
    },
    measures: {
      cellEditor: ({ colDef, stopEditing, data }: IMeasureCellEditor) => (
        <Measures colDef={colDef} stopEditing={stopEditing} data={data} />
      ),
      cellRenderer: (cell: IActivityHistoryData, data: IHabitDayData) => {
        return {
          component: (
            <>
              {cell.status === "failed"
                ? "×"
                : cell.measures?.[data?.details.fields[0].id]?.value ||
                  cell.measures?.[data?.details.fields[0].id]?.plannedValue}
            </>
          ),
          progress: cell.progress,
          isFailed: cell.status === "failed",
          failureReason: cell.failureReason,
          isPlanned:
            !!cell.measures?.[data?.details.fields[0].id]?.plannedValue,
        };
      },
    },
  },

  tasksGroup: {
    todoList: {
      cellEditor: ({ colDef, stopEditing, data }) => (
        <TodoList colDef={colDef} stopEditing={stopEditing} data={data} />
      ),
      cellRenderer: (cell) => {
        const allTasks = cell.tasks || [];
        const doneTasks = allTasks.filter(
          (task: ITask) => task.status === "done",
        );
        const failedTasks = allTasks.filter(
          (task: ITask) => task.status === "failed",
        );

        return {
          component: (
            <>
              {doneTasks.length}/{allTasks.length}
              {failedTasks.length ? ` · ×${failedTasks.length}` : ""}
            </>
          ),
          progress: cell.progress,
          isPlanned: !!allTasks[0],
          isFailed: cell.status === "failed",
        };
      },
    },
  },
};
