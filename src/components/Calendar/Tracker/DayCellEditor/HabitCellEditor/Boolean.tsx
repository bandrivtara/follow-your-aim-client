import { Cascader, Form, InputNumber, Radio, Switch } from "antd";
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
      scheduleTime: cellData?.details?.scheduleTime ||
        data.details.scheduleTime || [0, 0],
      isPlanned: cellData?.isPlanned || calendarMode !== "tracking",
      progress: 0,
      status: cellData?.isPlanned ? "done" : "pending",
    };

    setInitValues(newInitValues);
  }, [calendarMode, cellData, data]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const measureToUpdate = {
        id: data[colDef.field].currentDay,
        data: { ...cellData, ...formValues },
      };

      await updateHistory(measureToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const dayToUpdate = {
        id: data[colDef.field]?.currentDate || dayData.date,
        data: {},
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
        <Form.Item
          name="scheduleTime"
          label="Година"
          rules={[{ required: true }]}
        >
          <Cascader
            onKeyUp={handleKeyUp}
            autoFocus
            suffixIcon={<ClockCircleOutlined rev={"value"} />}
            style={{ width: "100px" }}
            options={getTimeOptions(15)}
          />
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
