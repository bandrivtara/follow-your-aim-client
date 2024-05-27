import { ReactNode } from "react";
import { ColDef } from "ag-grid-community";
import {
  IActivityHistoryData,
  IActivityTypes,
  IValueTypes,
} from "types/history.types";
import Boolean from "./DayCellEditor/HabitCellEditor/Boolean";
import Measures from "./DayCellEditor/HabitCellEditor/Measures";
import { ITask, ITasksGroup } from "types/taskGroups";
import TodoList from "./DayCellEditor/TasksGroupCellEditor/TodoList";
import { IHabitData } from "types/habits.types";

export type IStopEditing = (
  suppressNavigateAfterEdit?: boolean | undefined
) => void;

export interface IDayData {
  id: string;
  details: IHabitData | ITasksGroup;
  currentDate: string;
  [day: number]: any;
}

type ICellConfig = {
  [activityType in IActivityTypes]: {
    [valueType in IValueTypes]?: {
      cellEditor: (cellEditorData: {
        data: IDayData;
        colDef: ColDef<IDayData>;
        stopEditing: IStopEditing;
      }) => ReactNode;
      cellRenderer: (
        cell: IActivityHistoryData,
        data?: IDayData
      ) => {
        component: ReactNode;
        progress: number | boolean;
        isPlanned: boolean;
      };
    };
  };
};

export const cellConfigs: ICellConfig = {
  habit: {
    boolean: {
      cellEditor: ({ colDef, stopEditing, data }) => (
        <Boolean colDef={colDef} stopEditing={stopEditing} data={data} />
      ),
      cellRenderer: (cell) => {
        return {
          component: <>{cell.progress === 100 && "+"}</>,
          progress: cell.progress,
          isPlanned: !!cell.isPlanned,
        };
      },
    },
    measures: {
      cellEditor: ({ colDef, stopEditing, data }) => (
        <Measures colDef={colDef} stopEditing={stopEditing} data={data} />
      ),
      cellRenderer: (cell, data) => {
        return {
          component: (
            <>
              {cell.measures?.[data?.details.fields[0].id]?.value ||
                cell.measures?.[data?.details.fields[0].id]?.plannedValue}
            </>
          ),
          progress: cell.progress,
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
          (task: ITask) => task.status === "done"
        );

        return {
          component: (
            <>
              {doneTasks.length}/{allTasks.length}
            </>
          ),
          progress: cell.progress,
          isPlanned: !!allTasks[0],
        };
      },
    },
  },
};
