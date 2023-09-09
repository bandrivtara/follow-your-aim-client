import { Form, InputNumber } from "antd";
import { IDayCellEditor } from "../DayCellEditor";

interface IProps {
  data: IDayCellEditor;
  handleKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MeasureActivity = ({ handleKeyUp, data }: IProps) => {
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
