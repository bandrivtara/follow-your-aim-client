import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useWatch, SubmitHandler } from "react-hook-form";
import {
  FormControlLabel,
  Checkbox,
  TextField,
  RadioGroup,
  Radio,
  Grid,
  InputAdornment,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Check as CheckIcon,
  BorderAll as PendingIcon,
} from "@mui/icons-material";
import { useUpdateHistoryMutation } from "store/services/history";
import FormButtons from "share/components/Form/FormButtons";
import _ from "lodash";
import { IMeasureCellEditor } from "components/Calendar/Tracker/cellConfigs";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  IActivityData,
  IActivityHistoryData,
  IMeasures,
} from "types/history.types";
import removeUndefinedDeep from "share/functions/sds";

const Measures = ({ colDef, stopEditing, data }: IMeasureCellEditor) => {
  const { control, handleSubmit, setValue } = useForm<IActivityData>();

  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState<IActivityHistoryData | null>(
    null
  );
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode, dayData } = colDef.cellRendererParams;

  const measureValue = useWatch({
    control,
    name: "measures",
    defaultValue: initValues?.measures,
  });

  const isAllDay = useWatch({
    control,
    name: "isAllDay",
    defaultValue: initValues?.isAllDay,
  });

  useEffect(() => {
    const measureFields: { [fieldId: string]: number } = {};
    data.details.fields?.forEach((field) => {
      measureFields[field.id] = field.minToComplete;
    });

    const newInitValues: IActivityHistoryData = {
      id: data.details.id,
      startTime: [0, 0],
      endTime: [0, 0],
      type: "habit",
      valueType: cellData?.valueType || data.details.valueType,
      isAllDay: data.details.isAllDay,
      measures: {},
      progress: 0,
      status: "pending",
    };
    if (!data.details.isAllDay) {
      newInitValues.startTime = cellData?.startTime ||
        data.details.startTime || [0, 0];
      newInitValues.endTime = cellData?.endTime ||
        data.details.endTime || [0, 0];
    }

    for (const [fieldId, minToComplete] of Object.entries(measureFields)) {
      const cellMeasure = cellData?.measures?.[fieldId];
      if (!newInitValues.measures) return;
      if (calendarMode === "tracking") {
        newInitValues.measures[fieldId] = {
          value:
            cellMeasure?.value ||
            cellMeasure?.plannedValue ||
            minToComplete ||
            0,
          plannedValue: cellMeasure?.plannedValue || 0,
        };
      } else {
        newInitValues.measures[fieldId] = {
          value: cellMeasure?.value || 0,
          plannedValue: cellMeasure?.plannedValue || minToComplete || 0,
        };
      }
    }
    setInitValues(newInitValues);
  }, [calendarMode, cellData, data, setValue]);

  useEffect(() => {
    setValue("isAllDay", !!initValues?.isAllDay);
  }, [initValues, setValue]);

  const handleConfirm: SubmitHandler<IActivityData> = async (
    formValues: IActivityData
  ) => {
    if (colDef.field) {
      const removeUndefinedDormValues: IActivityData =
        removeUndefinedDeep(formValues);
      const mergedValues = _.merge(initValues, removeUndefinedDormValues);

      const measureToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: { ...cellData, ...mergedValues },
        path: `${dayData.day}.${data.id}`,
      };

      await updateHistory(measureToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const dayToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: {},
        path: `${dayData.day}.${data.id}`,
      };
      await updateHistory(dayToUpdate).unwrap();
    }
  };

  const handleDecline = () => {
    stopEditing();
  };

  const getCurrentProgress = useCallback(
    (measures: IMeasures) => {
      if (!measures) return;
      const totalProgress = [];
      for (const [, measure] of Object.entries(measures)) {
        if (measure.plannedValue && measure.value) {
          totalProgress.push((+measure.value / +measure.plannedValue) * 100);
        } else if (+measure.value) {
          totalProgress.push(100);
        }
      }
      const progress = totalProgress[0] ? +_.mean(totalProgress).toFixed(0) : 0;
      setValue("progress", progress);
      return progress;
    },
    [setValue]
  );

  useEffect(() => {
    getCurrentProgress(measureValue);
  }, [getCurrentProgress, measureValue, setValue]);

  const parseTime = (timeArray: number[]) => {
    if (isAllDay || !timeArray) return;
    const [hours, minutes] = timeArray;
    const date = dayjs()
      .set("hour", hours)
      .set("minute", minutes)
      .set("second", 0)
      .set("millisecond", 0);
    return date.toDate();
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return [0, 0];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return [hours, minutes];
  };

  return (
    initValues && (
      <form
        onSubmit={handleSubmit(handleConfirm)}
        style={{ maxWidth: 300, margin: 20 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <FormControlLabel
              control={
                <Controller
                  name="isAllDay"
                  control={control}
                  render={({ field }) => (
                    <Checkbox {...field} checked={field.value} />
                  )}
                />
              }
              label="Цілий день"
            />
          </Grid>

          {!isAllDay && (
            <>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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

          {data.details.fields &&
            data.details.fields.map((fieldData, index) => (
              <Grid
                item
                xs={12}
                key={fieldData.id}
                hidden={calendarMode !== "tracking"}
              >
                <Controller
                  name={`measures.${fieldData.id}.value`}
                  control={control}
                  defaultValue={initValues.measures[fieldData.id]?.value || 0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoFocus={index === 0}
                      label={fieldData.name}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {fieldData.unit}
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            ))}

          {data.details.fields &&
            data.details.fields.map((fieldData, index) => (
              <Grid
                item
                xs={12}
                key={fieldData.id + index}
                hidden={calendarMode === "tracking"}
              >
                <Controller
                  name={`measures.${fieldData.id}.plannedValue`}
                  defaultValue={
                    initValues.measures[fieldData.id]?.plannedValue || 0
                  }
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoFocus={index === 0}
                      label={fieldData.name}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {fieldData.unit}
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            ))}

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

          <Grid item xs={12}>
            <Controller
              name="progress"
              control={control}
              defaultValue={getCurrentProgress(initValues.measures)}
              render={({ field }) => (
                <>
                  <Typography color="textSecondary">
                    {`${Math.round(field.value)}%`}
                  </Typography>
                  <LinearProgress
                    {...field}
                    value={field.value > 100 ? 100 : field.value}
                    variant="determinate"
                  />
                </>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <FormButtons
              handleDecline={handleDecline}
              handleDelete={handleDelete}
            />
          </Grid>
        </Grid>
      </form>
    )
  );
};

export default Measures;
