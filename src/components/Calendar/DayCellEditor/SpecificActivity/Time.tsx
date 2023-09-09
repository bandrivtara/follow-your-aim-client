import { Cascader, Form } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ClockCircleOutlined } from "@ant-design/icons";
import { getTimeOptions } from "../../../../share/functions/getTimeOptions";

interface IProps {
  data: IDayCellEditor;
}

const Time = ({ data }: IProps) => {
  return (
    <>
      {data.calendarMode === "tracking" ? (
        <Form.Item name="value" label="Час" rules={[{ required: true }]}>
          <Cascader
            suffixIcon={<ClockCircleOutlined rev={"value"} />}
            style={{ width: "100px" }}
            options={getTimeOptions(15)}
          />
        </Form.Item>
      ) : (
        <Form.Item name="plannedValue" label="Час" rules={[{ required: true }]}>
          <Cascader
            suffixIcon={<ClockCircleOutlined rev={"value"} />}
            style={{ width: "100px" }}
            options={getTimeOptions(15)}
          />
        </Form.Item>
      )}
    </>
  );
};

export default Time;
