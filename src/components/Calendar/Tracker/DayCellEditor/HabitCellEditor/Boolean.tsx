import { Cascader, Form, Radio, Switch } from "antd";
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

interface IProps {
  colDef: ColDef<IDayData>;
  stopEditing: IStopEditing;
  data: IDayData;
}

const Boolean = ({ colDef, stopEditing, data }: IProps) => {
  const [form] = Form.useForm();
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
  }, [calendarMode, cellData, data]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const valueToUpdate = {
        id: `${dayData.year}-${dayData.month.toString().padStart(2, "0")}`,
        data: { ...cellData, ...formValues },
        path: `${dayData.day}.${data.id}`,
      };
      await updateHistory(valueToUpdate).unwrap();
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
                      onKeyUp={handleKeyUp}
                      autoFocus
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

        <Form.Item valuePropName="checked" name="isPlanned" label="Запланувати">
          <Switch />
        </Form.Item>

        <Form.Item name="id" hidden />
        <Form.Item name="valueType" hidden />
        <Form.Item name="type" hidden />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.status !== currentValues.status
          }
        >
          {({ getFieldValue, setFieldValue }) => {
            const progress = getFieldValue("status") === "done" ? 100 : 0;
            setFieldValue("progress", progress);
            return <Form.Item name="progress" hidden />;
          }}
        </Form.Item>

        <Form.Item
          name="status"
          hidden={calendarMode !== "tracking"}
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

export default Boolean;
