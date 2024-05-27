import { Cascader, Form, Input, InputNumber, Radio, Switch } from "antd";
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
import { getTimeOptions } from "share/functions/getTimeOptions";
import {
  IDayData,
  IStopEditing,
} from "components/Calendar/Tracker/cellConfigs";
import _ from "lodash";

interface IProps {
  colDef: ColDef<IDayData>;
  stopEditing: IStopEditing;
  data: IDayData;
}

const Measures = ({ colDef, stopEditing, data }: IProps) => {
  const [form] = Form.useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState<null | IHabitHistoryData>(null);
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

    setInitValues(newInitValues);
  }, [calendarMode, cellData, data]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const measureToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: { ...cellData, ...formValues },
        path: `${dayData.day}.${data.id}`,
      };
      console.log(measureToUpdate, cellData, dayData, data);
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

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Alt") {
      form.submit();
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
    form.setFieldValue("progress", progress);
  };

  return (
    initValues && (
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ minWidth: 300, margin: 20 }}
        form={form}
        name="dayCellEditor"
        onFinish={handleConfirm}
        initialValues={initValues}
      >
        <Form.Item valuePropName="checked" name="isAllDay" label="Цілий день">
          <Switch />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.isAllDay !== currentValues.isAllDay
          }
        >
          {({ getFieldValue }) => {
            if (!getFieldValue("isAllDay")) {
              return (
                <>
                  <Form.Item name="startTime" label="Початок о:">
                    <Cascader
                      suffixIcon={<ClockCircleOutlined rev={"value"} />}
                      style={{ width: "100px" }}
                      options={getTimeOptions(5)}
                    />
                  </Form.Item>
                  <Form.Item name="endTime" label="Закінчення о:">
                    <Cascader
                      suffixIcon={<ClockCircleOutlined rev={"value"} />}
                      style={{ width: "100px" }}
                      options={getTimeOptions(5)}
                    />
                  </Form.Item>
                </>
              );
            }
          }}
        </Form.Item>
        <Form.Item name="id" hidden />
        <Form.Item name="valueType" hidden />
        <Form.Item name="type" hidden />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.measures !== currentValues.measures
          }
        >
          {({ getFieldValue }) => {
            const progress = getCurrentProgress(getFieldValue("measures"));
            return (
              <Form.Item label="Прогрес" name="progress">
                <InputNumber disabled value={progress} />
              </Form.Item>
            );
          }}
        </Form.Item>

        {data.details.fields &&
          data.details.fields.map((field) => (
            <Form.Item
              hidden={calendarMode !== "tracking"}
              key={field.id}
              name={["measures", field.id, "value"]}
              label={field.name}
              initialValue={null}
            >
              <Input
                onKeyDown={handleKeyUp}
                autoFocus
                addonAfter={field.unit}
              />
            </Form.Item>
          ))}
        {data.details.fields &&
          data.details.fields.map((field, index) => (
            <Form.Item
              key={field.id + index}
              hidden={calendarMode === "tracking"}
              name={["measures", field.id, "plannedValue"]}
              label={field.name}
              initialValue={null}
            >
              <Input
                onKeyDown={handleKeyUp}
                autoFocus
                addonAfter={field.unit}
              />
            </Form.Item>
          ))}

        <Form.Item
          name="status"
          initialValue={initValues.status}
          label="Статус"
        >
          <Radio.Group>
            <Radio.Button value={"failed"}>
              <CloseSquareOutlined rev={"value"} />
            </Radio.Button>
            <Radio.Button value={"pending"}>
              <BorderOutlined rev={"value"} />
            </Radio.Button>
            <Radio.Button value={"done"}>
              <CheckSquareOutlined rev={"value"} />
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <FormButtons
            handleDecline={handleDecline}
            handleDelete={handleDelete}
          />
        </Form.Item>
      </Form>
    )
  );
};

export default Measures;
