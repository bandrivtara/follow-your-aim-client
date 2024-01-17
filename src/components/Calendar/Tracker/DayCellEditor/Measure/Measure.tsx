import { Form, InputNumber } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ColDef } from "ag-grid-community";
import { useEffect, useState } from "react";
import FormButtons from "share/components/Form/FormButtons";
import { IStopEditing } from "../../DayCellRenderer/trackerConfigs";
import { useUpdateHistoryMutation } from "store/services/history";

interface IProps {
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
  data: IDayCellEditor;
}

interface IFormValues {
  values: { [fieldId: string]: number };
  plannedValues: { [fieldId: string]: number };
}

const MeasureHabit = ({ colDef, stopEditing, data }: IProps) => {
  const [form] = Form.useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const [initValues, setInitValues] = useState<null | IFormValues>(null);
  const cellData = colDef.field && data[+colDef.field];
  const { calendarMode } = colDef.cellRendererParams;

  useEffect(() => {
    const habitFields: { [fieldId: string]: number } = {};
    data.details.fields?.forEach((field) => {
      habitFields[field.id] = field.minToComplete;
    });

    const newInitValues: IFormValues = {
      values: {},
      plannedValues: {},
    };

    for (const [fieldId, minToComplete] of Object.entries(habitFields)) {
      if (cellData?.values?.[fieldId]) {
        newInitValues.values[fieldId] = cellData.values[fieldId];
      } else if (cellData?.plannedValues?.[fieldId]) {
        newInitValues.values[fieldId] = cellData.plannedValues[fieldId];
        newInitValues.plannedValues[fieldId] = cellData.plannedValues[fieldId];
      } else {
        newInitValues.values[fieldId] = minToComplete || 0;
        newInitValues.plannedValues[fieldId] = minToComplete || 0;
      }
    }

    console.log(newInitValues);

    setInitValues(newInitValues);
  }, [cellData, data]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const habitToUpdate = {
        id: data.currentDate,
        data: { ...cellData, ...formValues },
        path: `${colDef.field}.${data.id}`,
      };
      console.log(habitToUpdate);
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
          {calendarMode === "tracking"
            ? data.details.fields &&
              data.details.fields.map((field) => (
                <Form.Item
                  key={field.id}
                  name={["values", field.id]}
                  label={field.name}
                  initialValue={null}
                >
                  <InputNumber
                    onKeyDown={handleKeyUp}
                    autoFocus
                    addonAfter={field.unit}
                    min={0}
                  />
                </Form.Item>
              ))
            : data.details.fields &&
              data.details.fields.map((field) => (
                <Form.Item
                  key={field.id}
                  name={["plannedValues", field.id]}
                  label={field.name}
                  initialValue={null}
                >
                  <InputNumber
                    onKeyDown={handleKeyUp}
                    autoFocus
                    addonAfter={field.unit}
                    min={0}
                  />
                </Form.Item>
              ))}
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
