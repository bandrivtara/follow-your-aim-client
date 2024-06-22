import React, { useCallback, useEffect, useState } from "react";
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Button,
  Box,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useForm, Controller } from "react-hook-form";
import { useUpdateHistoryMutation } from "store/services/history";
import { ColDef } from "ag-grid-community";
import { getTimeOptions } from "share/functions/getTimeOptions";
import {
  IDayData,
  IStopEditing,
} from "components/Calendar/Tracker/cellConfigs";
import FormButtons from "share/components/Form/FormButtons";
import {
  Close as CloseIcon,
  Check as CheckIcon,
  BorderAll as PendingIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

interface IProps {
  colDef: ColDef<IDayData>;
  stopEditing: IStopEditing;
  data: IDayData;
}

const Boolean = ({ colDef, stopEditing, data }: IProps) => {
  const { control, handleSubmit, setValue, getValues } = useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState<null | IHabitHistoryData>(null);
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode, dayData } = colDef.cellRendererParams;

  useEffect(() => {
    const newInitValues = {
      id: data.details.id,
      type: "habit",
      valueType: cellData?.details?.valueType || data.details.valueType,
      isAllDay: data.details.isAllDay,
      isPlanned: cellData?.isPlanned || calendarMode !== "tracking",
      progress: 0,
      status: cellData?.isPlanned ? "done" : "pending",
    };

    if (!data.details.isAllDay) {
      newInitValues.startTime = cellData?.startTime ||
        data.details.startTime || [0, 0];
      newInitValues.endTime = cellData?.endTime ||
        data.details.endTime || [0, 0];
    }

    setInitValues(newInitValues);

    for (const key in newInitValues) {
      setValue(key, newInitValues[key]);
    }
  }, [calendarMode, cellData, data, setValue]);

  const handleConfirm = useCallback(
    async (formValues) => {
      if (colDef.field) {
        console.log(123123, formValues);
        const valueToUpdate = {
          id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
          data: {
            ...initValues,
            ...cellData,
            ...formValues,
            progress: calendarMode === "tracking" ? 100 : initValues.progress,
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
    ]
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

  const formatTime = (date) => {
    if (!date || !date.isValid()) return [0, 0]; // Handle invalid date
    const hours = date.hour();
    const minutes = date.minute();
    return [hours, minutes];
  };

  const parseTime = (timeArray) => {
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
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit(handleConfirm)();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmit, handleConfirm]);

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
          {!getValues("isAllDay") && (
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
              <FormLabel component="legend">Статус</FormLabel>
              <Controller
                name="status"
                control={control}
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
