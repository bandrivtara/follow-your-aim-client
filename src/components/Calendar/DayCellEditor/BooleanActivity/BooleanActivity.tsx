import { Form, FormInstance, Switch } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { useEffect } from "react";
import { ColDef } from "ag-grid-community";

interface IProps {
  data: IDayCellEditor;
  form: FormInstance;
  colDef: ColDef<IDayCellEditor>;
}

const BooleanActivity = ({ data, form, colDef }: IProps) => {
  useEffect(() => {
    // if (!colDef.field) return;
    if (data.calendarMode === "tracking") {
      const newIsComplete = !form.getFieldValue("isComplete");
      console.log(newIsComplete);
      form.setFieldValue("isComplete", newIsComplete);
    }
    form && form.submit();
  }, [colDef.field, data, form]);
  return (
    <>
      {data.calendarMode === "tracking" ? (
        <Form.Item
          name="isComplete"
          label="Виконано"
          initialValue={true}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      ) : (
        <Form.Item
          name="isPlanned"
          label="Запланувати"
          initialValue={true}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      )}
    </>
  );
};

export default BooleanActivity;
