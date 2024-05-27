import { ICellEditorParams } from "ag-grid-community";
import { forwardRef, memo, useEffect } from "react";
import { IHabitData } from "types/habits.types";
import { Form, InputNumber } from "antd";
import FormButtons from "share/components/Form/FormButtons";
import { useGetAimQuery, useUpdateAimMutation } from "store/services/aims";

export interface IAimCellEditor {
  id: string;
  details: IHabitData;
  currentDate: {
    year: number;
    month: number;
  };
  store: any[];
  calendarMode: any;
  [day: number]: any;
}

interface IFormValues {
  currentValue: number;
}

const AimCellEditor = memo(
  forwardRef(
    ({ data, colDef, stopEditing }: ICellEditorParams<IAimCellEditor>) => {
      const [form] = Form.useForm();
      const aimDetails = useGetAimQuery(data.id);
      const [updateAim] = useUpdateAimMutation();

      useEffect(() => {
        if (aimDetails) {
          if (aimDetails.data && aimDetails.data) {
            form.setFieldsValue({
              currentValue: aimDetails.data.currentValue,
            });
          }
        }
      }, [aimDetails, form]);

      const handleConfirm = async (formValues: IFormValues) => {
        if (colDef.field) {
          const aimToUpdate = {
            id: data.id,
            data: {
              ...aimDetails.data,
              ...formValues,
            },
            path: "",
          };

          await updateAim(aimToUpdate).unwrap();
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
        <Form
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          style={{ minWidth: 300, margin: 20 }}
          form={form}
          name="dayCellEditor"
          onFinish={handleConfirm}
        >
          <Form.Item
            name="currentValue"
            label="Поточний прогресс"
            initialValue={0}
          >
            <InputNumber onKeyDown={handleKeyUp} autoFocus min={0} />
          </Form.Item>
          <Form.Item>
            <FormButtons handleDecline={handleDecline} />
          </Form.Item>
        </Form>
      );
    }
  )
);

export default AimCellEditor;
