import { useCallback, useEffect, useState } from "react";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Box,
  Button,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useForm, Controller, SubmitHandler, useWatch } from "react-hook-form";
import { useUpdateHistoryMutation } from "store/services/history";
import { ColDef } from "ag-grid-community";
import {
  IHabitDayData,
  IStopEditing,
} from "components/Calendar/Tracker/cellConfigs";
import FormButtons from "share/components/Form/FormButtons";
import {
  Close as CloseIcon,
  Check as CheckIcon,
  BorderAll as PendingIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { IActivityData, IActivityHistoryData } from "types/history.types";
import removeUndefinedDeep from "share/functions/sds";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import habitsConfig from "config/habitsIds.json";

interface IProps {
  colDef: ColDef<IHabitDayData>;
  stopEditing: IStopEditing;
  data: IHabitDayData;
}

interface IFormValues {}

const Boolean = ({ colDef, stopEditing, data }: IProps) => {
  const { control, handleSubmit, setValue } = useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const navigate = useNavigate();
  const [initValues, setInitValues] = useState<IActivityHistoryData | null>(
    null,
  );
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode, dayData } = colDef.cellRendererParams;
  const isDailyReviewHabit =
    data.id === habitsConfig.habits.dailyReview.details;
  const isGoalsGratitudeHabit =
    data.id === habitsConfig.habits.goalsGratitude.details;

  useEffect(() => {
    const newInitValues: IActivityHistoryData = {
      id: data.details.id,
      type: "habit",
      valueType: cellData?.details?.valueType || data.details.valueType,
      isAllDay: data.details.isAllDay,
      isPlanned: cellData?.isPlanned || calendarMode !== "tracking",
      progress: 0,
      status: cellData?.isPlanned ? "done" : "pending",
      startTime: [0, 0],
      endTime: [0, 0],
      measures: {},
    };

    if (!data.details.isAllDay) {
      newInitValues.startTime = cellData?.startTime ||
        data.details.startTime || [0, 0];
      newInitValues.endTime = cellData?.endTime ||
        data.details.endTime || [0, 0];
    }

    setInitValues(newInitValues);
  }, [calendarMode, cellData, data, setValue]);

  useEffect(() => {
    setValue("isAllDay", !!initValues?.isAllDay);
  }, [initValues, setValue]);

  const isAllDay = useWatch({
    control,
    name: "isAllDay",
    defaultValue: initValues?.isAllDay,
  });

  const handleConfirm: SubmitHandler<IFormValues> = useCallback(
    async (formValues: IFormValues) => {
      if (colDef.field) {
        const removeUndefinedDormValues: IActivityData =
          removeUndefinedDeep(formValues);
        const mergedValues = _.merge(initValues, removeUndefinedDormValues);

        const valueToUpdate = {
          id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
          data: {
            ...cellData,
            ...mergedValues,
            progress: calendarMode === "tracking" ? 100 : initValues?.progress,
          },
          path: `${dayData.day}.${data.id}`,
        };
        await updateHistory(valueToUpdate).unwrap();
        stopEditing();
      }
    },
    [
      calendarMode,
      cellData,
      colDef.field,
      data.id,
      dayData.day,
      dayData.month,
      dayData.year,
      initValues,
      stopEditing,
      updateHistory,
    ],
  );

  const handleDelete = async () => {
    if (colDef.field) {
      const dayToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: {},
        path: `${dayData.day}.${data.id}`,
      };
      await updateHistory(dayToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return [0, 0];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return [hours, minutes];
  };

  const parseTime = (timeArray: number[]) => {
    const [hours, minutes] = timeArray;
    const date = dayjs()
      .set("hour", hours)
      .set("minute", minutes)
      .set("second", 0)
      .set("millisecond", 0);
    return date.toDate();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        !(calendarMode === "tracking" &&
          (isDailyReviewHabit || isGoalsGratitudeHabit))
      ) {
        event.preventDefault();
        handleSubmit(handleConfirm)();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    calendarMode,
    handleSubmit,
    handleConfirm,
    isDailyReviewHabit,
    isGoalsGratitudeHabit,
  ]);

  if (
    (isDailyReviewHabit || isGoalsGratitudeHabit) &&
    calendarMode === "tracking"
  ) {
    const reviewDate = `${dayData.year}-${String(dayData.month).padStart(
      2,
      "0",
    )}-${String(dayData.day).padStart(2, "0")}`;

    return (
      <Box sx={{ maxWidth: 340, margin: 2 }}>
        <Typography mb={2} color="text.secondary">
          {isDailyReviewHabit
            ? "Ця звичка виконується лише після збереження AI-підсумку щоденного огляду."
            : "Ця звичка виконується лише після збереження тексту ранкового компаса."}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            stopEditing();
            navigate(
              `${
                isDailyReviewHabit
                  ? routes.review.daily
                  : routes.review.goalsGratitude
              }?date=${reviewDate}`,
            );
          }}
        >
          {isDailyReviewHabit
            ? "Заповнити щоденний огляд"
            : "Заповнити ранковий компас"}
        </Button>
      </Box>
    );
  }

  return (
    initValues && (
      <Box
        component="form"
        onSubmit={handleSubmit(handleConfirm)}
        sx={{ maxWidth: 300, margin: 2 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="isAllDay"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Цілий день"
                />
              )}
            />
          </Grid>
          {!isAllDay && (
            <>
              <Grid item xs={6}>
                <Controller
                  name="startTime"
                  control={control}
                  defaultValue={initValues.startTime}
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
                      renderInput={(params) => <TextField {...params} />}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="endTime"
                  control={control}
                  defaultValue={initValues.endTime}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      ampm={false}
                      value={parseTime(field.value)}
                      onChange={(date) => {
                        const formattedTime = formatTime(date);
                        field.onChange(formattedTime);
                      }}
                      label="Закінчення о:"
                      renderInput={(params) => <TextField {...params} />}
                    />
                  )}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <Controller
              name="isPlanned"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Запланувати"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="progress"
              control={control}
              render={({ field }) => (
                <>
                  <Typography color="textSecondary">
                    {`${Math.round(100)}%`}
                  </Typography>
                  <LinearProgress
                    {...field}
                    value={100}
                    variant="determinate"
                  />
                </>
              )}
            />
          </Grid>
          {calendarMode === "tracking" && (
            <Grid item xs={12}>
              <Controller
                name="status"
                control={control}
                defaultValue={initValues.status}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      value="failed"
                      control={<Radio icon={<CloseIcon />} />}
                      label="Failed"
                    />
                    <FormControlLabel
                      value="pending"
                      control={<Radio icon={<PendingIcon />} />}
                      label="Pending"
                    />
                    <FormControlLabel
                      value="done"
                      control={<Radio icon={<CheckIcon />} />}
                      label="Done"
                    />
                  </RadioGroup>
                )}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormButtons
              handleDecline={handleDecline}
              handleDelete={handleDelete}
            />
          </Grid>
        </Grid>
      </Box>
    )
  );
};

export default Boolean;
