import { Form, InputNumber } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ColDef } from "ag-grid-community";
import { useUpdateHabitMutation } from "store/services/habits";
import { useEffect, useState } from "react";
import _ from "lodash";
import FormButtons from "share/components/Form/FormButtons";
import { IStopEditing } from "../../HabitCellRenderer/habitConfigs";
import { useUpdateHistoryMutation } from "store/services/history";

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
  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState<null | IFormValues>(null);
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode } = colDef.cellRendererParams;

  useEffect(() => {
    setInitValues({
      value:
        cellData?.value ||
        cellData?.plannedValue ||
        data.details.minToComplete ||
        0,
      plannedValue: cellData?.plannedValue || data.details.minToComplete || 0,
    });
  }, [cellData, data.details.minToComplete]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const habitToUpdate = {
        id: data.currentDate,
        data: { ...cellData, ...formValues },
        path: `${colDef.field}.${data.id}`,
      };

      await updateHistory(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const dayToUpdate = {
        id: data.currentDate,
        data: {},
        path: `${colDef.field}.${data.id}`,
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
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues !== currentValues
          }
        >
          {calendarMode === "tracking" ? (
            <Form.Item
              name="value"
              label="Значення"
              rules={[{ required: true }]}
            >
              <InputNumber
                onKeyDown={handleKeyUp}
                autoFocus
                addonAfter={data.details.measure}
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
                addonAfter={data.details.measure}
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
