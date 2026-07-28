import { Fragment, useEffect } from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  useWatch,
  SubmitHandler,
} from "react-hook-form";
import {
  Button,
  Grid,
  Divider,
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGroup,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Pause as PauseIcon,
} from "@mui/icons-material";
import FormButtons from "share/components/Form/FormButtons";
import { ColDef } from "ag-grid-community";
import { IHabitDayData, IStopEditing } from "../../cellConfigs";
import StyledTodoList from "./TodoList.styled";
import { useUpdateHistoryMutation } from "store/services/history";
import { useGetTaskGroupQuery } from "store/services/taskGroups";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { ITasksHistoryData } from "types/history.types";
import { ITask } from "types/taskGroups";

interface IProps {
  colDef: ColDef<ITasksHistoryData>;
  stopEditing: IStopEditing;
  data: IHabitDayData;
}

const initTask: ITask = {
  title: "",
  description: "",
  status: "pending",
  time: [0, 0],
  isEditOn: false,
};

const TodoList = ({ data, colDef, stopEditing }: IProps) => {
  const { control, handleSubmit, setValue, getValues } =
    useForm<ITasksHistoryData>({
      defaultValues: {
        id: "",
        type: "tasksGroup",
        valueType: "todoList",
        progress: 0,
        tasks: [] as ITask[],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const [updateHistory] = useUpdateHistoryMutation();
  const taskGroupDetails = useGetTaskGroupQuery(data.id);

  const { dayData } = colDef.cellRendererParams;
  const cellData = colDef.field && data[+colDef.field];

  useEffect(() => {
    setValue("id", data.id);
    setValue("type", "tasksGroup");
    setValue("valueType", "todoList");
    setValue("progress", cellData?.progress || 0);
    setValue("tasks", cellData?.tasks || []);
  }, [cellData, data.id, setValue]);

  const handleConfirm: SubmitHandler<ITasksHistoryData> = async (
    formValues: ITasksHistoryData,
  ) => {
    if (!formValues?.tasks) return;
    const validatedTasks = formValues.tasks.filter((task) =>
      task.title?.trim(),
    );
    const completedTasks = validatedTasks.filter(
      (task) => task.status === "done",
    );
    const progress = validatedTasks.length
      ? (completedTasks.length / validatedTasks.length) * 100
      : 0;

    if (colDef.field) {
      const dataToUpdate = { ...formValues };
      delete dataToUpdate.tasksStore;

      const historyToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: { ...dataToUpdate, tasks: validatedTasks, progress },
        path: `${dayData.day}.${data.id}`,
      };

      await updateHistory(historyToUpdate).unwrap();

      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const habitToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: {},
        path: `${dayData.day}.${data.id}`,
      };
      await updateHistory(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
  };

  const parseTime = (timeArray?: Array<number | string>) => {
    if (!timeArray) return;
    const [hours, minutes] = timeArray;
    const date = dayjs()
      .set("hour", Number(hours))
      .set("minute", Number(minutes))
      .set("second", 0)
      .set("millisecond", 0);
    return date.toDate();
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return [0, 0];
    const hours = dayjs(date).hour();
    const minutes = dayjs(date).minute();
    return [hours, minutes];
  };

  const watchedTasks = useWatch({
    control,
    name: "tasks",
    defaultValue: [],
  });
  const storedTasks = taskGroupDetails.data?.tasksStore || [];

  const addTaskFromStore = (task: ITask) => {
    append({ ...task, status: "pending", isEditOn: false });
  };

  return (
    initTask && (
      <StyledTodoList>
        <form onSubmit={handleSubmit(handleConfirm)}>
          <Box sx={{ minWidth: 300, margin: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {!!storedTasks.length && (
                  <Box marginBottom={2}>
                    <strong>Сховище завдань</strong>
                    <Box display="flex" flexWrap="wrap" gap={1} marginTop={1}>
                      {storedTasks.map((task, index) => (
                        <Button
                          key={task.id || `${task.title}-${index}`}
                          variant="outlined"
                          size="small"
                          onClick={() => addTaskFromStore(task)}
                        >
                          + {task.title}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}
                {fields.map((task, index) => (
                  <Fragment key={task.id}>
                    <Grid container spacing={2} marginBottom={2}>
                      <Grid item xs={12} md={12}>
                        <Controller
                          name={`tasks.${index}.title`}
                          control={control}
                          defaultValue={initTask.title}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Назва завдання"
                              fullWidth
                              required
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      spacing={2}
                      justifyContent={"space-between"}
                    >
                      <Grid item xs={12} md={4} marginBottom={2}>
                        <Controller
                          name={`tasks.${index}.time`}
                          control={control}
                          defaultValue={initTask.time}
                          render={({ field }) => (
                            <TimePicker
                              {...field}
                              ampm={false}
                              value={parseTime(field.value)}
                              onChange={(date) => {
                                const formattedTime = formatTime(date);
                                field.onChange(formattedTime);
                              }}
                              label="Початок о:"
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4} marginBottom={2}>
                        <Controller
                          name={`tasks.${index}.status`}
                          control={control}
                          defaultValue={initTask.status}
                          render={({ field }) => (
                            <ToggleButtonGroup
                              {...field}
                              size="large"
                              value={field.value}
                              onChange={(_event, newValue) =>
                                newValue && field.onChange(newValue)
                              }
                              color="primary"
                              exclusive
                              aria-label="text alignment"
                            >
                              <ToggleButton value="failed">
                                <CloseIcon />
                              </ToggleButton>
                              <ToggleButton value="pending">
                                <PauseIcon />
                              </ToggleButton>
                              <ToggleButton value="done">
                                <DoneIcon />
                              </ToggleButton>
                            </ToggleButtonGroup>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <ButtonGroup
                          size="large"
                          variant="outlined"
                          aria-label="Basic button group"
                        >
                          <Button
                            onClick={() =>
                              setValue(
                                `tasks.${index}.isEditOn`,
                                !getValues(`tasks.${index}.isEditOn`),
                                { shouldDirty: true },
                              )
                            }
                          >
                            <ExpandMoreIcon />
                          </Button>
                          <Button onClick={() => remove(index)}>
                            <DeleteIcon />
                          </Button>
                        </ButtonGroup>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} hidden={!watchedTasks[index]?.isEditOn}>
                      <Controller
                        name={`tasks.${index}.description`}
                        control={control}
                        defaultValue={initTask.description}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={2}
                            label="Опис"
                          />
                        )}
                      />
                    </Grid>
                    <Divider style={{ margin: "12px 0" }} />
                  </Fragment>
                ))}
                <Grid container>
                  <Grid item md={6}>
                    <Button
                      variant="outlined"
                      onClick={() => append({ ...initTask })}
                    >
                      Додати завдання
                    </Button>
                  </Grid>
                  <Grid
                    item
                    md={6}
                    display={"flex"}
                    justifyContent={"flex-end"}
                  >
                    <FormButtons
                      handleDecline={handleDecline}
                      handleDelete={handleDelete}
                      handleConfirm={handleSubmit(handleConfirm)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </form>
      </StyledTodoList>
    )
  );
};

export default TodoList;
