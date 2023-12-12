import { Form, InputNumber } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ColDef } from "ag-grid-community";
import { useUpdateHabitMutation } from "store/services/habits";
import { useEffect, useState } from "react";
import _ from "lodash";
import FormButtons from "share/components/Form/FormButtons";
import { IStopEditing } from "../../HabitCellRenderer/habitConfigs";

interface IProps {
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
  data: IDayCellEditor;
}

interface IFormValues {
  value: number;
  plannedValue: number;
}

const MeasureHabit = ({ colDef, stopEditing, data }: IProps) => {
  const [form] = Form.useForm();
  const [updateHabit] = useUpdateHabitMutation();
  const [initValues, setInitValues] = useState<null | IFormValues>(null);
  const cellData = colDef.field && data[+colDef.field];

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
      console.log(habitToUpdate);
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
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues !== currentValues
          }
        >
          {data.calendarMode === "tracking" ? (
            <Form.Item
              name="value"
              label="Значення"
              rules={[{ required: true }]}
            >
              <InputNumber
                onKeyDown={handleKeyUp}
                autoFocus
                addonAfter={data.habitDetails.measure}
                min={1}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="plannedValue"
              label="Запланувати"
              rules={[{ required: true }]}
            >
              <InputNumber
                onKeyDown={handleKeyUp}
                autoFocus
                addonAfter={data.habitDetails.measure}
                min={1}
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

export default MeasureHabit;
