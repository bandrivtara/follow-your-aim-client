import { IHabitData } from "types/habits.types";
import { ITasksGroup } from "types/taskGroups";

export const resetActivityForPlanning = (source: Record<string, any>) => ({
  ...source,
  isPlanned: true,
  progress: 0,
  status: "pending",
  measures: source.measures
    ? Object.fromEntries(
        Object.entries(source.measures).map(([id, measure]: [string, any]) => [
          id,
          { ...measure, value: 0 },
        ]),
      )
    : source.measures,
  tasks: Array.isArray(source.tasks)
    ? source.tasks.map((task: Record<string, any>) => ({
        ...task,
        status: "pending",
      }))
    : source.tasks,
});

export const completeBooleanHabit = (
  habit: IHabitData,
  source: Record<string, any> = {},
) => ({
  ...source,
  id: habit.id,
  type: "habit",
  valueType: "boolean",
  isPlanned: source.isPlanned ?? true,
  isAllDay: source.isAllDay ?? habit.isAllDay,
  startTime: source.startTime || habit.startTime || [0, 0],
  endTime: source.endTime || habit.endTime || [0, 0],
  measures: source.measures || {},
  progress: 100,
  status: "done",
});

export const completeMeasuredHabit = (
  habit: IHabitData,
  source: Record<string, any>,
  values: Record<string, number>,
) => {
  const fields = habit.fields || [];
  const measures = Object.fromEntries(
    fields.map((field) => {
      const current = source.measures?.[field.id] || {};
      return [
        field.id,
        {
          ...current,
          plannedValue: Number(
            current.plannedValue || field.minToComplete || 0,
          ),
          value: Number(values[field.id] || 0),
        },
      ];
    }),
  );
  const progressValues = Object.values(measures).map((measure: any) => {
    if (measure.plannedValue) {
      return (measure.value / measure.plannedValue) * 100;
    }
    return measure.value ? 100 : 0;
  });
  const progress = progressValues.length
    ? Math.round(
        progressValues.reduce((sum, value) => sum + value, 0) /
          progressValues.length,
      )
    : 0;

  return {
    ...source,
    id: habit.id,
    type: "habit",
    valueType: "measures",
    isPlanned: source.isPlanned ?? true,
    isAllDay: source.isAllDay ?? habit.isAllDay,
    startTime: source.startTime || habit.startTime || [0, 0],
    endTime: source.endTime || habit.endTime || [0, 0],
    measures,
    progress,
    status: progress >= 100 ? "done" : "pending",
  };
};

export const completeTaskAtIndex = (
  source: Record<string, any>,
  taskIndex: number,
) => {
  const tasks = Array.isArray(source.tasks)
    ? source.tasks.map((task: Record<string, any>, index: number) =>
        index === taskIndex ? { ...task, status: "done" } : task,
      )
    : [];
  const completed = tasks.filter(
    (task: Record<string, any>) => task.status === "done",
  ).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return {
    ...source,
    isPlanned: source.isPlanned ?? true,
    tasks,
    progress,
    status: progress >= 100 ? "done" : "pending",
  };
};

export const appendQuickTask = (
  taskGroup: ITasksGroup,
  source: Record<string, any> = {},
  title: string,
  taskId: string,
  time: Array<number | string> = ["", ""],
  category?: string,
) => {
  const tasks = [
    ...(Array.isArray(source.tasks) ? source.tasks : []),
    {
      id: taskId,
      title: title.trim(),
      description: "",
      status: "pending" as const,
      time,
      ...(category ? { category } : {}),
      isEditOn: false,
    },
  ];
  const completed = tasks.filter(
    (task: Record<string, any>) => task.status === "done",
  ).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return {
    ...source,
    id: taskGroup.id,
    type: "tasksGroup" as const,
    valueType: "todoList" as const,
    isPlanned: true,
    tasks,
    progress,
    status: progress >= 100 ? "done" : "pending",
  };
};
