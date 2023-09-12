import { Form, InputNumber } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { FormInstance } from "antd/lib";

interface IProps {
  data: IDayCellEditor;
  form: FormInstance;
}

const MeasureActivity = ({ data, form }: IProps) => {
  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Alt") {
      form.submit();
    }
  };

  return (
    <>
      {data.calendarMode === "tracking" ? (
        <Form.Item name="value" label="Значення" rules={[{ required: true }]}>
          <InputNumber
            onKeyDown={handleKeyUp}
            autoFocus
            addonAfter={data.activityData.measure}
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
            addonAfter={data.activityData.measure}
            min={1}
          />
        </Form.Item>
      )}
    </>
  );
};

export default MeasureActivity;
