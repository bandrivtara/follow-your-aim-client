import {
  AddTaskOutlined,
  CalendarMonthOutlined,
  CheckCircleOutline,
  CloseOutlined,
  EditOutlined,
  InboxOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import { useMemo, useState } from "react";
import { LIFE_AREAS, getLifeAreaTitle } from "config/lifeAreas";
import {
  useGetHistoryListQuery,
  useUpdateHistoryEntriesMutation,
} from "store/services/history";
import {
  useGetTaskGroupListQuery,
  useUpdateTaskGroupMutation,
} from "store/services/taskGroups";
import FailureReasonDialog from "share/components/FailureReasonDialog/FailureReasonDialog";
import {
  ITask,
  ITaskPriority,
  ITaskStatus,
  ITasksGroup,
} from "types/taskGroups";
import uniqid from "uniqid";
import StyledTasksOverview from "./TasksOverview.styled";
import {
  buildTaskOverviewRows,
  buildTasksActivity,
  findTaskActivity,
  formatTaskTime,
  getTaskOverviewBucket,
  sortTaskOverviewRows,
  TaskOverviewBucket,
  TaskOverviewRow,
} from "./taskOverview";

type ViewFilter = "active" | TaskOverviewBucket | "all";

interface TaskDraft {
  title: string;
  description: string;
  groupId: string;
  date: string;
  time: string;
  category: string;
  priority: ITaskPriority | "";
  status: ITaskStatus;
}

const priorityDetails: Record<
  ITaskPriority,
  { label: string; color: "error" | "warning" | "info" }
> = {
  high: { label: "Високий", color: "error" },
  medium: { label: "Середній", color: "warning" },
  low: { label: "Низький", color: "info" },
};

const statusDetails: Record<
  ITaskStatus,
  { label: string; color: "default" | "success" | "error" }
> = {
  pending: { label: "До виконання", color: "default" },
  done: { label: "Виконано", color: "success" },
  failed: { label: "Не виконано", color: "error" },
};

const viewOptions: Array<{ value: ViewFilter; label: string }> = [
  { value: "active", label: "Активні" },
  { value: "today", label: "Сьогодні" },
  { value: "overdue", label: "Прострочені" },
  { value: "upcoming", label: "Майбутні" },
  { value: "unscheduled", label: "Без дати" },
  { value: "failed", label: "Не виконані" },
  { value: "done", label: "Завершені" },
  { value: "all", label: "Усі" },
];

const emptyDraft = (groupId = ""): TaskDraft => ({
  title: "",
  description: "",
  groupId,
  date: dayjs().format("YYYY-MM-DD"),
  time: "",
  category: "",
  priority: "medium",
  status: "pending",
});

const taskToDraft = (row: TaskOverviewRow): TaskDraft => ({
  title: row.task.title,
  description: row.task.description || "",
  groupId: row.groupId,
  date: row.date || "",
  time: formatTaskTime(row.task) === "Без часу" ? "" : formatTaskTime(row.task),
  category: row.task.category || "",
  priority: row.task.priority || "",
  status: row.task.status || "pending",
});

const draftToTask = (draft: TaskDraft, source?: ITask): ITask => {
  const time = draft.time
    ? draft.time.split(":").map(Number)
    : (["", ""] as Array<string | number>);
  const task: ITask = {
    ...source,
    id: source?.id || uniqid(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: draft.status,
    time,
    isEditOn: false,
  };
  if (draft.category) task.category = draft.category;
  else delete task.category;
  if (draft.priority) task.priority = draft.priority;
  else delete task.priority;
  if (task.status !== "failed") delete task.failureReason;
  return task;
};

const historyEntry = (date: string, groupId: string, data: unknown) => {
  const parsedDate = dayjs(date);
  return {
    id: parsedDate.format("YYYY-MM"),
    path: `${parsedDate.format("DD")}.${groupId}`,
    data,
  };
};

const TasksOverview = () => {
  const taskGroupsQuery = useGetTaskGroupListQuery();
  const historyQuery = useGetHistoryListQuery();
  const [updateTaskGroup, taskGroupUpdate] = useUpdateTaskGroupMutation();
  const [updateHistoryEntries, historyUpdate] =
    useUpdateHistoryEntriesMutation();
  const [viewFilter, setViewFilter] = useState<ViewFilter>("active");
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [editorRow, setEditorRow] = useState<TaskOverviewRow | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft());
  const [failureRow, setFailureRow] = useState<TaskOverviewRow | null>(null);
  const today = useMemo(() => dayjs().startOf("day"), []);

  const taskGroups = useMemo(
    () =>
      (taskGroupsQuery.data || []).filter(
        (group) => !group.isHidden && group.valueType === "todoList",
      ),
    [taskGroupsQuery.data],
  );
  const rows = useMemo(
    () =>
      sortTaskOverviewRows(
        buildTaskOverviewRows(taskGroups, (historyQuery.data || []) as any[]),
        today,
      ),
    [historyQuery.data, taskGroups, today],
  );

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLocaleLowerCase("uk");
    return rows.filter((row) => {
      const bucket = getTaskOverviewBucket(row, today);
      const isScheduledToday =
        Boolean(row.date) && dayjs(row.date).isSame(today, "day");
      const matchesView =
        viewFilter === "all" ||
        (viewFilter === "today" && isScheduledToday) ||
        (viewFilter === "active"
          ? bucket !== "done"
          : viewFilter !== "today" && bucket === viewFilter);
      const matchesSearch =
        !searchValue ||
        [row.task.title, row.task.description, row.groupTitle, row.stageTitle]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase("uk").includes(searchValue),
          );
      return (
        matchesView &&
        matchesSearch &&
        (!groupFilter || row.groupId === groupFilter) &&
        (!categoryFilter || row.task.category === categoryFilter) &&
        (!priorityFilter || row.task.priority === priorityFilter)
      );
    });
  }, [
    categoryFilter,
    groupFilter,
    priorityFilter,
    rows,
    search,
    today,
    viewFilter,
  ]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, TaskOverviewRow[]>();
    filteredRows.forEach((row) => {
      groups.set(row.groupTitle, [...(groups.get(row.groupTitle) || []), row]);
    });
    return Array.from(groups.entries());
  }, [filteredRows]);

  const todayRows = rows.filter(
    (row) => row.date && dayjs(row.date).isSame(today, "day"),
  );
  const completedToday = todayRows.filter(
    (row) => row.task.status === "done",
  ).length;
  const overdueCount = rows.filter(
    (row) => getTaskOverviewBucket(row, today) === "overdue",
  ).length;
  const unscheduledCount = rows.filter(
    (row) => getTaskOverviewBucket(row, today) === "unscheduled",
  ).length;
  const upcomingCount = rows.filter(
    (row) => getTaskOverviewBucket(row, today) === "upcoming",
  ).length;
  const isSaving = taskGroupUpdate.isLoading || historyUpdate.isLoading;

  const getGroup = (groupId: string) =>
    taskGroups.find((group) => group.id === groupId);

  const saveRepositoryTask = async (row: TaskOverviewRow, nextTask: ITask) => {
    const group = getGroup(row.groupId);
    if (!group) throw new Error("Task group not found");

    if (row.source === "store") {
      const tasksStore = [...(group.tasksStore || [])];
      tasksStore[row.taskIndex] = nextTask;
      await updateTaskGroup({ id: group.id, data: { tasksStore } }).unwrap();
      return;
    }

    const tasksStages = (group.tasksStages || []).map((stage, stageIndex) => {
      if (stageIndex !== row.stageIndex) return stage;
      const subTasks = [...(stage.subTasks || [])];
      subTasks[row.taskIndex] = nextTask;
      return { ...stage, subTasks };
    });
    await updateTaskGroup({ id: group.id, data: { tasksStages } }).unwrap();
  };

  const appendScheduledTask = async (
    date: string,
    group: ITasksGroup,
    task: ITask,
  ) => {
    const activity = findTaskActivity(
      (historyQuery.data || []) as any[],
      date,
      group.id,
    );
    const nextActivity = buildTasksActivity(group, activity, [
      ...(activity?.tasks || []),
      task,
    ]);
    await updateHistoryEntries([
      historyEntry(date, group.id, nextActivity),
    ]).unwrap();
  };

  const saveScheduledTask = async (
    row: TaskOverviewRow,
    nextTask: ITask,
    nextDate: string,
  ) => {
    const group = getGroup(row.groupId);
    if (!group || !row.date || !row.activity) {
      throw new Error("Scheduled task source not found");
    }
    const sourceTasks = [...(row.activity.tasks || [])];

    if (row.date === nextDate) {
      sourceTasks[row.taskIndex] = nextTask;
      await updateHistoryEntries([
        historyEntry(
          row.date,
          row.groupId,
          buildTasksActivity(group, row.activity, sourceTasks),
        ),
      ]).unwrap();
      return;
    }

    sourceTasks.splice(row.taskIndex, 1);
    const targetActivity = findTaskActivity(
      (historyQuery.data || []) as any[],
      nextDate,
      row.groupId,
    );
    const targetTasks = [...(targetActivity?.tasks || []), nextTask];
    await updateHistoryEntries([
      historyEntry(
        row.date,
        row.groupId,
        buildTasksActivity(group, row.activity, sourceTasks),
      ),
      historyEntry(
        nextDate,
        row.groupId,
        buildTasksActivity(group, targetActivity, targetTasks),
      ),
    ]).unwrap();
  };

  const persistRow = async (
    row: TaskOverviewRow,
    nextTask: ITask,
    nextDate = row.date || "",
  ) => {
    if (row.source === "scheduled") {
      if (!nextDate) throw new Error("Scheduled task requires a date");
      await saveScheduledTask(row, nextTask, nextDate);
      return;
    }

    await saveRepositoryTask(row, nextTask);
    if (nextDate) {
      const group = getGroup(row.groupId);
      if (!group) throw new Error("Task group not found");
      await appendScheduledTask(nextDate, group, {
        ...nextTask,
        status: "pending",
      });
    }
  };

  const openNewTask = () => {
    setEditorRow(null);
    setDraft(emptyDraft(taskGroups[0]?.id));
    setIsEditorOpen(true);
  };

  const openEditTask = (row: TaskOverviewRow) => {
    setEditorRow(row);
    setDraft(taskToDraft(row));
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.groupId) return;
    try {
      if (editorRow) {
        await persistRow(
          editorRow,
          draftToTask(draft, editorRow.task),
          draft.date,
        );
      } else {
        const group = getGroup(draft.groupId);
        if (!group) throw new Error("Task group not found");
        const task = draftToTask(draft);
        if (draft.date) {
          await appendScheduledTask(draft.date, group, task);
        } else {
          await updateTaskGroup({
            id: group.id,
            data: { tasksStore: [...(group.tasksStore || []), task] },
          }).unwrap();
        }
      }
      message.success(editorRow ? "Завдання оновлено" : "Завдання додано");
      setIsEditorOpen(false);
    } catch {
      message.error("Не вдалося зберегти завдання");
    }
  };

  const setQuickStatus = async (
    row: TaskOverviewRow,
    status: ITaskStatus,
    failureReason = "",
  ) => {
    const nextTask = { ...row.task, status };
    if (status === "failed" && failureReason.trim()) {
      nextTask.failureReason = failureReason.trim();
    } else {
      delete nextTask.failureReason;
    }
    try {
      await persistRow(row, nextTask);
      message.success(
        status === "done" ? "Завдання виконано" : "Статус оновлено",
      );
    } catch {
      message.error("Не вдалося оновити статус");
    }
  };

  const scheduleToday = async (row: TaskOverviewRow) => {
    const nextTask = { ...row.task, status: "pending" as const };
    delete nextTask.failureReason;
    try {
      await persistRow(row, nextTask, today.format("YYYY-MM-DD"));
      message.success("Завдання перенесено на сьогодні");
    } catch {
      message.error("Не вдалося перепланувати завдання");
    }
  };

  if (taskGroupsQuery.isLoading || historyQuery.isLoading) {
    return (
      <StyledTasksOverview>
        <div className="loading-state">
          <CircularProgress />
        </div>
      </StyledTasksOverview>
    );
  }

  return (
    <StyledTasksOverview>
      <header className="overview-header page-header">
        <div>
          <h1 className="page-title">Усі завдання</h1>
          <p className="page-subtitle">
            Єдиний огляд справ зі сховища, етапів і календаря. Плануй день,
            змінюй пріоритети та перенось прострочене без пошуку в трекері.
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddTaskOutlined />}
          onClick={openNewTask}
          disabled={!taskGroups.length}
        >
          Нова справа
        </Button>
      </header>

      {(taskGroupsQuery.isError || historyQuery.isError) && (
        <Alert severity="error">
          Не вдалося завантажити всі дані. Онови сторінку та спробуй ще раз.
        </Alert>
      )}

      <section className="summary-grid" aria-label="Огляд завдань">
        <div className="summary-card">
          <span className="summary-label">Сьогодні виконано</span>
          <strong className="summary-value">
            {completedToday}/{todayRows.length}
          </strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Прострочені</span>
          <strong className="summary-value">{overdueCount}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Без дати</span>
          <strong className="summary-value">{unscheduledCount}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Заплановано далі</span>
          <strong className="summary-value">{upcomingCount}</strong>
        </div>
      </section>

      <section className="filters-card" aria-label="Фільтри завдань">
        <div className="view-filter">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewFilter}
            onChange={(_event, value) => value && setViewFilter(value)}
            aria-label="Період і стан завдань"
          >
            {viewOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        <div className="filter-row">
          <TextField
            size="small"
            label="Пошук"
            placeholder="Назва, опис, група або етап"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <TextField
            select
            size="small"
            label="Група"
            value={groupFilter}
            onChange={(event) => setGroupFilter(event.target.value)}
          >
            <MenuItem value="">Усі групи</MenuItem>
            {taskGroups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Категорія"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <MenuItem value="">Усі категорії</MenuItem>
            {LIFE_AREAS.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                {area.shortTitle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Пріоритет"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <MenuItem value="">Усі пріоритети</MenuItem>
            {Object.entries(priorityDetails).map(([value, details]) => (
              <MenuItem key={value} value={value}>
                {details.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </section>

      {groupedRows.length ? (
        <section className="group-list">
          {groupedRows.map(([groupTitle, groupRows]) => (
            <article className="group-card" key={groupTitle}>
              <div className="group-heading">
                <h2>{groupTitle}</h2>
                <Chip size="small" label={`${groupRows.length} справ`} />
              </div>
              <div className="task-table-header" aria-hidden="true">
                <span>Завдання</span>
                <span>Категорія</span>
                <span>Дата й час</span>
                <span>Пріоритет</span>
                <span>Статус</span>
                <span>Дії</span>
              </div>
              {groupRows.map((row) => {
                const bucket = getTaskOverviewBucket(row, today);
                const priority = row.task.priority
                  ? priorityDetails[row.task.priority]
                  : undefined;
                const status = statusDetails[row.task.status || "pending"];
                return (
                  <div className={`task-row task-row--${bucket}`} key={row.key}>
                    <div>
                      <p className="task-title">{row.task.title}</p>
                      <div className="task-meta">
                        <span>
                          {row.source === "scheduled"
                            ? "У плані"
                            : row.source === "stage"
                              ? `Етап: ${row.stageTitle}`
                              : "Сховище"}
                        </span>
                        {row.task.description && (
                          <span>{row.task.description}</span>
                        )}
                        {row.task.failureReason && (
                          <span className="overdue-label">
                            Причина: {row.task.failureReason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="category-cell">
                      {row.task.category
                        ? getLifeAreaTitle(row.task.category)
                        : "Без категорії"}
                    </div>
                    <div className="date-cell">
                      {row.date ? (
                        <>
                          <span
                            className={
                              bucket === "overdue" ? "overdue-label" : ""
                            }
                          >
                            {dayjs(row.date).locale("uk").format("D MMM, dd")}
                          </span>
                          <div className="task-meta">
                            {formatTaskTime(row.task)}
                          </div>
                        </>
                      ) : (
                        "Без дати"
                      )}
                    </div>
                    <div className="priority-cell">
                      {priority ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          color={priority.color}
                          label={priority.label}
                        />
                      ) : (
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Не задано"
                        />
                      )}
                    </div>
                    <div className="status-cell">
                      <Chip
                        size="small"
                        color={status.color}
                        label={status.label}
                      />
                    </div>
                    <div className="task-actions">
                      {row.task.status !== "done" &&
                        (bucket === "overdue" ||
                          bucket === "unscheduled" ||
                          bucket === "failed") && (
                          <Tooltip title="Запланувати на сьогодні">
                            <span>
                              <IconButton
                                size="small"
                                disabled={isSaving}
                                onClick={() => scheduleToday(row)}
                                aria-label={`Запланувати «${row.task.title}» на сьогодні`}
                              >
                                <CalendarMonthOutlined fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      {row.task.status !== "done" && (
                        <Tooltip title="Виконано">
                          <span>
                            <IconButton
                              color="success"
                              size="small"
                              disabled={isSaving}
                              onClick={() => setQuickStatus(row, "done")}
                              aria-label={`Позначити «${row.task.title}» виконаним`}
                            >
                              <CheckCircleOutline fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      {row.task.status !== "failed" &&
                        row.task.status !== "done" && (
                          <Tooltip title="Не виконано">
                            <span>
                              <IconButton
                                color="error"
                                size="small"
                                disabled={isSaving}
                                onClick={() => setFailureRow(row)}
                                aria-label={`Позначити «${row.task.title}» невиконаним`}
                              >
                                <CloseOutlined fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      <Tooltip title="Редагувати або перенести">
                        <IconButton
                          size="small"
                          onClick={() => openEditTask(row)}
                          aria-label={`Редагувати «${row.task.title}»`}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </article>
          ))}
        </section>
      ) : (
        <section className="group-card empty-state">
          <Box>
            <InboxOutlined color="primary" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h6">За цими фільтрами справ немає</Typography>
            <Typography color="text.secondary" mt={0.5}>
              Зміни фільтр або додай нову справу.
            </Typography>
          </Box>
        </section>
      )}

      <Dialog
        open={isEditorOpen}
        onClose={isSaving ? undefined : () => setIsEditorOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editorRow ? "Редагувати завдання" : "Нова справа"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              autoFocus
              required
              label="Назва"
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
            <TextField
              multiline
              minRows={2}
              label="Опис"
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
            />
            <TextField
              select
              required
              disabled={Boolean(editorRow)}
              label="Група завдань"
              value={draft.groupId}
              onChange={(event) =>
                setDraft({ ...draft, groupId: event.target.value })
              }
            >
              {taskGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Запланувати на"
                value={draft.date}
                onChange={(event) =>
                  setDraft({ ...draft, date: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                helperText={
                  editorRow?.source === "scheduled"
                    ? "Зміна дати перенесе справу в трекері"
                    : "Залиш порожнім, щоб зберегти без дати"
                }
              />
              <TextField
                fullWidth
                type="time"
                label="Час"
                value={draft.time}
                onChange={(event) =>
                  setDraft({ ...draft, time: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Категорія"
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
              >
                <MenuItem value="">Без категорії</MenuItem>
                {LIFE_AREAS.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Пріоритет"
                value={draft.priority}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    priority: event.target.value as TaskDraft["priority"],
                  })
                }
              >
                <MenuItem value="">Не задано</MenuItem>
                {Object.entries(priorityDetails).map(([value, details]) => (
                  <MenuItem key={value} value={value}>
                    {details.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              select
              label="Статус"
              value={draft.status}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  status: event.target.value as ITaskStatus,
                })
              }
            >
              {Object.entries(statusDetails).map(([value, details]) => (
                <MenuItem key={value} value={value}>
                  {details.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isSaving} onClick={() => setIsEditorOpen(false)}>
            Скасувати
          </Button>
          <Button
            variant="contained"
            disabled={
              isSaving ||
              !draft.title.trim() ||
              !draft.groupId ||
              (editorRow?.source === "scheduled" && !draft.date)
            }
            onClick={handleSave}
          >
            {isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Зберегти"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <FailureReasonDialog
        open={Boolean(failureRow)}
        activityTitle={failureRow?.task.title}
        initialValue={failureRow?.task.failureReason || ""}
        isSaving={isSaving}
        onClose={() => setFailureRow(null)}
        onConfirm={async (reason) => {
          if (!failureRow) return;
          await setQuickStatus(failureRow, "failed", reason);
          setFailureRow(null);
        }}
      />
    </StyledTasksOverview>
  );
};

export default TasksOverview;
