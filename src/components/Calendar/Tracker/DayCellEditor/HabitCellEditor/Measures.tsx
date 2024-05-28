import { ColDef } from "ag-grid-community";
import { useEffect, useState } from "react";
import FormButtons from "share/components/Form/FormButtons";
import { useUpdateHistoryMutation } from "store/services/history";
import {
  BorderOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseSquareOutlined,
} from "@ant-design/icons";
import {
  AccessTime as ClockIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  BorderAll as PendingIcon,
} from "@mui/icons-material";
import { getTimeOptions } from "share/functions/getTimeOptions";
import {
  IDayData,
  IStopEditing,
} from "components/Calendar/Tracker/cellConfigs";
import _ from "lodash";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";

interface IProps {
  colDef: ColDef<IDayData>;
  stopEditing: IStopEditing;
  data: IDayData;
}

interface Inputs {
  isAllDay: string;
}

const Measures = ({ colDef, stopEditing, data }: IProps) => {
  // const [form] = Form.useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState<null | IHabitHistoryData>(null);
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode, dayData } = colDef.cellRendererParams;

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initValues,
  });

  const isAllDay = watch("isAllDay");
  const measures = watch("measures");

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
    console.log(2222, newInitValues);
    setInitValues(newInitValues);
  }, [calendarMode, cellData, data]);

  const handleConfirm = async (formValues) => {
    console.log(formValues, 123123);
    // if (colDef.field) {
    //   console.log(formValues, 123123);
    //   const measureToUpdate = {
    //     id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
    //     data: { ...cellData, ...formValues },
    //     path: `${dayData.day}.${data.id}`,
    //   };
    //   console.log(measureToUpdate, cellData, dayData, data);
    //   await updateHistory(measureToUpdate).unwrap();
    //   stopEditing();
    // }
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

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Alt") {
      form.submit();
    }
  };

  const getCurrentProgress = (measures) => {
    const totalProgress = [];
    // for (const [measureId, measure] of Object.entries(measures)) {
    //   if (
    //     measure.plannedValue &&
    //     measure.value &&
    //     Number.isInteger(+measure.value)
    //   ) {
    //     totalProgress.push((measure.value / measure.plannedValue) * 100);
    //   } else if (measure.value) {
    //     totalProgress.push(100);
    //   }
    // }

    // const progress = totalProgress[0] ? _.mean(totalProgress).toFixed(0) : 0;
    // form.setFieldValue("progress", progress);
  };
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ minWidth: 300, margin: 20 }}
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
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Початок о:"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <ClockIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {getTimeOptions(5).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Закінчення о:"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <ClockIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {getTimeOptions(5).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Controller
            name="progress"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Прогрес"
                type="number"
                InputProps={{ readOnly: true }}
                // value={getCurrentProgress(measures)}
              />
            )}
          />
        </Grid>

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
          <Button type="submit" variant="contained" color="primary">
            Confirm
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Grid>
      </Grid>
    </form>
    // initValues && (
    //   <Form
    //     labelCol={{ span: 8 }}
    //     wrapperCol={{ span: 14 }}
    //     layout="horizontal"
    //     style={{ minWidth: 300, margin: 20 }}
    //     form={form}
    //     name="dayCellEditor"
    //     onFinish={handleConfirm}
    //     initialValues={initValues}
    //   >
    //     <Form.Item valuePropName="checked" name="isAllDay" label="Цілий день">
    //       <Switch />
    //     </Form.Item>
    //     <Form.Item
    //       noStyle
    //       shouldUpdate={(prevValues, currentValues) =>
    //         prevValues.isAllDay !== currentValues.isAllDay
    //       }
    //     >
    //       {({ getFieldValue }) => {
    //         if (!getFieldValue("isAllDay")) {
    //           return (
    //             <>
    //               <Form.Item name="startTime" label="Початок о:">
    //                 <Cascader
    //                   suffixIcon={<ClockCircleOutlined rev={"value"} />}
    //                   style={{ width: "100px" }}
    //                   options={getTimeOptions(5)}
    //                 />
    //               </Form.Item>
    //               <Form.Item name="endTime" label="Закінчення о:">
    //                 <Cascader
    //                   suffixIcon={<ClockCircleOutlined rev={"value"} />}
    //                   style={{ width: "100px" }}
    //                   options={getTimeOptions(5)}
    //                 />
    //               </Form.Item>
    //             </>
    //           );
    //         }
    //       }}
    //     </Form.Item>
    //     <Form.Item name="id" hidden />
    //     <Form.Item name="valueType" hidden />
    //     <Form.Item name="type" hidden />
    //     <Form.Item
    //       noStyle
    //       shouldUpdate={(prevValues, currentValues) =>
    //         prevValues.measures !== currentValues.measures
    //       }
    //     >
    //       {({ getFieldValue }) => {
    //         const progress = getCurrentProgress(getFieldValue("measures"));
    //         return (
    //           <Form.Item label="Прогрес" name="progress">
    //             <InputNumber disabled value={progress} />
    //           </Form.Item>
    //         );
    //       }}
    //     </Form.Item>

    //     {data.details.fields &&
    //       data.details.fields.map((field) => (
    //         <Form.Item
    //           hidden={calendarMode !== "tracking"}
    //           key={field.id}
    //           name={["measures", field.id, "value"]}
    //           label={field.name}
    //           initialValue={null}
    //         >
    //           <Input
    //             onKeyDown={handleKeyUp}
    //             autoFocus
    //             addonAfter={field.unit}
    //           />
    //         </Form.Item>
    //       ))}
    //     {data.details.fields &&
    //       data.details.fields.map((field, index) => (
    //         <Form.Item
    //           key={field.id + index}
    //           hidden={calendarMode === "tracking"}
    //           name={["measures", field.id, "plannedValue"]}
    //           label={field.name}
    //           initialValue={null}
    //         >
    //           <Input
    //             onKeyDown={handleKeyUp}
    //             autoFocus
    //             addonAfter={field.unit}
    //           />
    //         </Form.Item>
    //       ))}

    //     <Form.Item
    //       name="status"
    //       initialValue={initValues.status}
    //       label="Статус"
    //     >
    //       <Radio.Group>
    //         <Radio.Button value={"failed"}>
    //           <CloseSquareOutlined rev={"value"} />
    //         </Radio.Button>
    //         <Radio.Button value={"pending"}>
    //           <BorderOutlined rev={"value"} />
    //         </Radio.Button>
    //         <Radio.Button value={"done"}>
    //           <CheckSquareOutlined rev={"value"} />
    //         </Radio.Button>
    //       </Radio.Group>
    //     </Form.Item>
    //     <Form.Item>
    //       <FormButtons
    //         handleDecline={handleDecline}
    //         handleDelete={handleDelete}
    //       />
    //     </Form.Item>
    //   </Form>
    // )
  );
};

export default Measures;
