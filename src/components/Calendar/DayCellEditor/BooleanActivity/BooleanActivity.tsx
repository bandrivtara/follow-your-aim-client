import { Form, FormInstance } from "antd";
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
    if (!colDef.field) return;
    // @ts-ignore
    const currentValue = data?.[+colDef.field];

    if (data.calendarMode === "tracking") {
      const newIsComplete = !currentValue.isComplete;

      form.setFieldValue("isComplete", newIsComplete);
    } else if (data.calendarMode === "planning") {
      const newIsPlanned = !currentValue.isPlanned;

      form.setFieldValue("isPlanned", newIsPlanned);
    }
    form && form.submit();
  }, [colDef.field, data, form]);
  return (
    <>
      {data.calendarMode === "tracking" ? (
        <Form.Item name="isComplete"></Form.Item>
      ) : (
        <Form.Item name="isPlanned"></Form.Item>
      )}
    </>
  );
};

export default BooleanActivity;
