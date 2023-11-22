import { Cascader, Col, Form, Row } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { getTimeOptions } from "../../../../share/functions/getTimeOptions";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ColDef } from "ag-grid-community";
import { IStopEditing } from "../../Activities/activityConfigs";
import { useUpdateActivityMutation } from "../../../../store/services/activity";
import FormButtons from "../../../../share/components/Form/FormButtons";
import _ from "lodash";

interface IProps {
  data: IDayCellEditor;
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
}

interface IFormValues {
  value: string;
  plannedValue: number;
}

const DurationActivity = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [updateActivity] = useUpdateActivityMutation();
  const cellData = colDef?.field && data[+colDef.field];

  const [initValues, setInitValues] = useState<null | IFormValues>(null);

  useEffect(() => {
    setInitValues({ ...cellData, plannedValue: 0 });
  }, [cellData, data.activityDetails.minToComplete]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const activityToUpdate = {
        id: data.id,
        data: { ...cellData, ...formValues, value: true },
        path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
      };
      await updateActivity(activityToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const newMonthHistory = _.pickBy(data, (_value, key) => !isNaN(+key));
      delete newMonthHistory[colDef.field];
      const activityToUpdate = {
        id: data.id,
        data: newMonthHistory,
        path: `history.${data.currentDate.year}.${data.currentDate.month}`,
      };

      await updateActivity(activityToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
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
        <Row>
          <Form.Item name="value" hidden />
          <Col span={6} xs={12}>
            <Form.Item name="from" label="З" rules={[{ required: true }]}>
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                style={{ width: "100px" }}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          </Col>
          <Col span={6} xs={12}>
            <Form.Item name="to" label="До" rules={[{ required: true }]}>
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                style={{ width: "100px" }}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          </Col>
        </Row>
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

export default DurationActivity;
