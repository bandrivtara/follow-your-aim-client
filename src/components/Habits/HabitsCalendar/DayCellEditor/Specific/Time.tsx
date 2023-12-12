import _ from "lodash";
import { Cascader, Form } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ClockCircleOutlined } from "@ant-design/icons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import FormButtons from "share/components/Form/FormButtons";
import { useUpdateHabitMutation } from "store/services/habits";
import { ColDef } from "ag-grid-community";
import { useEffect, useState } from "react";
import { IStopEditing } from "../../HabitCellRenderer/habitConfigs";

interface IProps {
  data: IDayCellEditor;
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
}

interface IFormValues {
  value: number;
  plannedValue: number;
}

const Time = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [updateHabit] = useUpdateHabitMutation();
  const cellData = colDef.field && data[+colDef.field];

  const [initValues, setInitValues] = useState<null | IFormValues>(null);

  useEffect(() => {
    setInitValues({
      value:
        cellData?.value ||
        cellData?.plannedValue ||
        data.habitDetails.minToComplete ||
        0,
      plannedValue:
        cellData?.plannedValue || data.habitDetails.minToComplete || 0,
    });
  }, [cellData, data.habitDetails.minToComplete]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const habitToUpdate = {
        id: data.id,
        data: { ...cellData, ...formValues },
        path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
      };
      await updateHabit(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const newMonthHistory = _.pickBy(data, (_value, key) => !isNaN(+key));
      delete newMonthHistory[colDef.field];
      const habitToUpdate = {
        id: data.id,
        data: newMonthHistory,
        path: `history.${data.currentDate.year}.${data.currentDate.month}`,
      };

      await updateHabit(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
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
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues !== currentValues
          }
        >
          {data.calendarMode === "tracking" ? (
            <Form.Item name="value" label="Час" rules={[{ required: true }]}>
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                style={{ width: "100px" }}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="plannedValue"
              label="Час"
              rules={[{ required: true }]}
            >
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                style={{ width: "100px" }}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          )}
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

export default Time;
