import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FormControlLabel,
  Checkbox,
  TextField,
  RadioGroup,
  Radio,
  Button,
  Grid,
  InputAdornment,
  Select,
  MenuItem,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  AccessTime as ClockIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  BorderAll as PendingIcon,
} from "@mui/icons-material";
import { ColDef } from "ag-grid-community";
import { useUpdateHistoryMutation } from "store/services/history";
import FormButtons from "share/components/Form/FormButtons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import _ from "lodash";
import {
  IDayData,
  IStopEditing,
} from "components/Calendar/Tracker/cellConfigs";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface IProps {
  colDef: ColDef<IDayData>;
  stopEditing: IStopEditing;
  data: IDayData;
}

const Measures = ({ colDef, stopEditing, data }: IProps) => {
  const { control, handleSubmit, watch, setValue } = useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState(null);
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode, dayData } = colDef.cellRendererParams;

  useEffect(() => {
    const measureFields: { [fieldId: string]: number } = {};
    data.details.fields?.forEach((field) => {
      measureFields[field.id] = field.minToComplete;
    });

    const newInitValues = {
      id: data.details.id,
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
    console.log(newInitValues, 123123);
    setInitValues(newInitValues);
  }, [calendarMode, cellData, data]);

  const handleConfirm = async (formValues) => {
    console.log(formValues, 123123);
    if (colDef.field) {
      const measureToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: { ...cellData, ...formValues },
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

  const handleKeyUp = (event) => {
    if (event.key === "Alt") {
      handleSubmit(handleConfirm)();
    }
  };

  const getCurrentProgress = (measures) => {
    const totalProgress = [];
    for (const [measureId, measure] of Object.entries(measures)) {
      if (
        measure.plannedValue &&
        measure.value &&
        Number.isInteger(+measure.value)
      ) {
        totalProgress.push((measure.value / measure.plannedValue) * 100);
      } else if (measure.value) {
        totalProgress.push(100);
      }
    }

    const progress = totalProgress[0] ? _.mean(totalProgress).toFixed(0) : 0;
    setValue("progress", progress);
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

  // Function to format Date object into [hours, minutes]
  const formatTime = (date) => {
    if (!date || !date.isValid()) return [0, 0]; // Handle invalid date
    const hours = date.hour();
    const minutes = date.minute();
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
                  defaultValue={initValues.isAllDay}
                  render={({ field }) => (
                    <Checkbox {...field} checked={field.value} />
                  )}
                />
              }
              label="Цілий день"
            />
          </Grid>

          {!watch("isAllDay") && (
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
            data.details.fields.map((field) => (
              <Grid
                item
                xs={12}
                key={field.id}
                hidden={calendarMode !== "tracking"}
              >
                <Controller
                  name={`measures.${field.id}.value`}
                  control={control}
                  defaultValue={initValues.measures[field.id]?.value || 0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={field.name}
                      onKeyDown={handleKeyUp}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {field.unit}
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            ))}

          {data.details.fields &&
            data.details.fields.map((field, index) => (
              <Grid
                item
                xs={12}
                key={field.id + index}
                hidden={calendarMode === "tracking"}
              >
                <Controller
                  name={`measures.${field.id}.plannedValue`}
                  control={control}
                  defaultValue={
                    initValues.measures[field.id]?.plannedValue || 0
                  }
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={field.name}
                      onKeyDown={handleKeyUp}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {field.unit}
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
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Confirm
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleDecline}
            >
              Decline
            </Button>
          </Grid>
        </Grid>
      </form>
    )
  );
};

export default Measures;
