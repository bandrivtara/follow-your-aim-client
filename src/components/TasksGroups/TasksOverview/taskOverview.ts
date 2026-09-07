import dayjs, { Dayjs } from "dayjs";
import { IActivityHistoryData } from "types/history.types";
import {
  ITask,
  ITaskPriority,
  ITaskStatus,
  ITasksGroup,
} from "types/taskGroups";

export type TaskOverviewSource = "scheduled" | "store" | "stage";
export type TaskOverviewBucket =
  | "today"
  | "overdue"
  | "upcoming"
  | "unscheduled"
  | "done"
  | "failed";

export interface TaskOverviewRow {
  key: string;
  source: TaskOverviewSource;
  task: ITask;
  taskIndex: number;
  groupId: string;
  groupTitle: string;
  stageId?: string;
  stageTitle?: string;
  stageIndex?: number;
  date?: string;
  monthId?: string;
  dayId?: string;
  activity?: IActivityHistoryData;
}

type HistoryMonth = Record<string, any> & { id?: string; unix?: number };

const normalizeTitle = (title = "") =>
  title.trim().toLocaleLowerCase("uk").replace(/\s+/g, " ");

const getTaskMatchKey = (groupId: string, task: ITask) =>
  `${groupId}:${task.id || normalizeTitle(task.title)}`;

const getHistoryMonthId = (historyMonth: HistoryMonth) => {
  if (/^\d{4}-\d{2}$/.test(historyMonth.id || "")) return historyMonth.id;
  const unix = Number(historyMonth.unix);
  return Number.isFinite(unix) && unix > 0
    ? dayjs.unix(unix).format("YYYY-MM")
    : undefined;
};

export const buildTaskOverviewRows = (
  taskGroups: ITasksGroup[] = [],
  history: HistoryMonth[] = [],
) => {
  const visibleGroups = taskGroups.filter(
    (group) => group?.id && group?.title && !group.isHidden,
  );
  const groupsById = new Map(visibleGroups.map((group) => [group.id, group]));
  const scheduledRowsByKey = new Map<string, TaskOverviewRow>();
  const activeScheduledKeys = new Set<string>();

  history.forEach((historyMonth) => {
    const monthId = getHistoryMonthId(historyMonth);
    if (!monthId) return;

    Object.entries(historyMonth).forEach(([dayKey, dayValue]) => {
      if (
        !/^\d{1,2}$/.test(dayKey) ||
        !dayValue ||
        typeof dayValue !== "object"
      ) {
        return;
      }
      const dayId = dayKey.padStart(2, "0");
      const date = `${monthId}-${dayId}`;
      if (!dayjs(date, "YYYY-MM-DD", true).isValid()) return;

      Object.entries(dayValue as Record<string, any>).forEach(
        ([groupId, activity]) => {
          const group = groupsById.get(groupId);
          if (!group || !Array.isArray(activity?.tasks)) return;

          activity.tasks.forEach((task: ITask, taskIndex: number) => {
            if (!task?.title?.trim()) return;
            const key = `scheduled:${date}:${groupId}:${task.id || taskIndex}`;
            const row: TaskOverviewRow = {
              key,
              source: "scheduled",
              task,
              taskIndex,
              groupId,
              groupTitle: group.title,
              date,
              monthId,
              dayId,
              activity,
            };
            const existing = scheduledRowsByKey.get(key);
            if (!existing || dayKey === dayId) scheduledRowsByKey.set(key, row);
          });
        },
      );
    });
  });

  const scheduledRows = Array.from(scheduledRowsByKey.values());
  scheduledRows.forEach((row) => {
    if (row.task.status !== "done") {
      activeScheduledKeys.add(getTaskMatchKey(row.groupId, row.task));
    }
  });

  const repositoryRows: TaskOverviewRow[] = [];
  visibleGroups.forEach((group) => {
    (group.tasksStore || []).forEach((task, taskIndex) => {
      if (
        !task?.title?.trim() ||
        activeScheduledKeys.has(getTaskMatchKey(group.id, task))
      ) {
        return;
      }
      repositoryRows.push({
        key: `store:${group.id}:${task.id || taskIndex}`,
        source: "store",
        task,
        taskIndex,
        groupId: group.id,
        groupTitle: group.title,
      });
    });

    (group.tasksStages || []).forEach((stage, stageIndex) => {
      (stage.subTasks || []).forEach((task, taskIndex) => {
        if (
          !task?.title?.trim() ||
          activeScheduledKeys.has(getTaskMatchKey(group.id, task))
        ) {
          return;
        }
        repositoryRows.push({
          key: `stage:${group.id}:${stage.id || stageIndex}:${task.id || taskIndex}`,
          source: "stage",
          task,
          taskIndex,
          groupId: group.id,
          groupTitle: group.title,
          stageId: stage.id,
          stageTitle: stage.title,
          stageIndex,
        });
      });
    });
  });

  return [...scheduledRows, ...repositoryRows];
};

export const getTaskOverviewBucket = (
  row: TaskOverviewRow,
  today: Dayjs = dayjs(),
): TaskOverviewBucket => {
  if (row.task.status === "done") return "done";
  if (row.task.status === "failed") return "failed";
  if (!row.date) return "unscheduled";
  const taskDate = dayjs(row.date);
  if (taskDate.isBefore(today, "day")) return "overdue";
  if (taskDate.isSame(today, "day")) return "today";
  return "upcoming";
};

const priorityOrder: Record<ITaskPriority | "none", number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

const timeValue = (task: ITask) => {
  const [hour, minute] = task.time || [];
  if (
    hour === "" ||
    minute === "" ||
    hour === undefined ||
    minute === undefined
  ) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Number(hour) * 60 + Number(minute);
};

export const sortTaskOverviewRows = (
  rows: TaskOverviewRow[],
  today: Dayjs = dayjs(),
) =>
  [...rows].sort((left, right) => {
    const leftBucket = getTaskOverviewBucket(left, today);
    const rightBucket = getTaskOverviewBucket(right, today);
    const bucketOrder: Record<TaskOverviewBucket, number> = {
      overdue: 0,
      today: 1,
      failed: 2,
      upcoming: 3,
      unscheduled: 4,
      done: 5,
    };
    const byBucket = bucketOrder[leftBucket] - bucketOrder[rightBucket];
    if (byBucket) return byBucket;
    const byDate = (left.date || "9999-12-31").localeCompare(
      right.date || "9999-12-31",
    );
    if (byDate) return byDate;
    const byPriority =
      priorityOrder[left.task.priority || "none"] -
      priorityOrder[right.task.priority || "none"];
    if (byPriority) return byPriority;
    const byTime = timeValue(left.task) - timeValue(right.task);
    if (byTime) return byTime;
    return left.task.title.localeCompare(right.task.title, "uk");
  });

export const buildTasksActivity = (
  group: ITasksGroup,
  source: Partial<IActivityHistoryData> = {},
  tasks: ITask[],
): IActivityHistoryData => {
  const normalizedTasks = tasks.map((task) => ({
    ...task,
    status: task.status || ("pending" as ITaskStatus),
    time: Array.isArray(task.time) ? task.time : ["", ""],
  }));
  const completed = normalizedTasks.filter(
    ({ status }) => status === "done",
  ).length;
  const progress = normalizedTasks.length
    ? Math.round((completed / normalizedTasks.length) * 100)
    : 0;
  const hasPending = normalizedTasks.some(({ status }) => status === "pending");

  return {
    ...source,
    id: group.id,
    type: "tasksGroup",
    valueType: "todoList",
    isPlanned: source.isPlanned ?? true,
    isAllDay: source.isAllDay ?? true,
    startTime: source.startTime || [0, 0],
    endTime: source.endTime || [0, 0],
    measures: source.measures || {},
    tasks: normalizedTasks,
    progress,
    status:
      progress >= 100 && normalizedTasks.length
        ? "done"
        : hasPending || !normalizedTasks.length
          ? "pending"
          : "failed",
  };
};

export const findTaskActivity = (
  history: HistoryMonth[] = [],
  date: string,
  groupId: string,
) => {
  const selectedDate = dayjs(date);
  const monthId = selectedDate.format("YYYY-MM");
  const dayId = selectedDate.format("DD");
  const legacyDayId = String(selectedDate.date());
  const historyMonth = history.find(
    (month) => getHistoryMonthId(month) === monthId,
  );
  return (historyMonth?.[dayId]?.[groupId] ||
    historyMonth?.[legacyDayId]?.[groupId] ||
    undefined) as IActivityHistoryData | undefined;
};

export const formatTaskTime = (task: ITask) => {
  const [hour, minute] = task.time || [];
  if (
    hour === "" ||
    minute === "" ||
    hour === undefined ||
    minute === undefined
  ) {
    return "Без часу";
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};
