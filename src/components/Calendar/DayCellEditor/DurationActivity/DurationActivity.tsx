import { Cascader, Form, FormInstance } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { getTimeOptions } from "../../../../share/functions/getTimeOptions";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useWatch } from "antd/es/form/Form";

interface IProps {
  data: IDayCellEditor;
  form: FormInstance;
}

const DurationActivity = ({ data, form }: IProps) => {
  const timeFrom = useWatch(["from"], form);
  const timeTo = useWatch(["to"], form);

  useEffect(() => {
    if (timeFrom && timeTo) {
      form.setFieldsValue({
        value: `${timeFrom[0]}:${timeFrom[1]}-${timeTo[0]}:${timeTo[1]}`,
      });
    }
    console.log(timeFrom);
  }, [form, timeFrom, timeTo]);

  return (
    <>
      {data.calendarMode === "tracking" ? (
        <>
          <Form.Item name="value" hidden />
          <Form.Item name="from" label="З" rules={[{ required: true }]}>
            <Cascader
              suffixIcon={<ClockCircleOutlined rev={"value"} />}
              style={{ width: "100px" }}
              options={getTimeOptions(15)}
            />
          </Form.Item>
          <Form.Item name="to" label="До" rules={[{ required: true }]}>
            <Cascader
              suffixIcon={<ClockCircleOutlined rev={"value"} />}
              style={{ width: "100px" }}
              options={getTimeOptions(15)}
            />
          </Form.Item>
        </>
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

export default DurationActivity;
