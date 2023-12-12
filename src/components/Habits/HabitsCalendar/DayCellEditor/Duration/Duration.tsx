import _ from "lodash";
import { Cascader, Col, Form, Row } from "antd";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ColDef } from "ag-grid-community";
import { useUpdateHabitMutation } from "store/services/habits";
import FormButtons from "share/components/Form/FormButtons";
import { IDayCellEditor } from "../DayCellEditor";
import { IStopEditing } from "../../HabitCellRenderer/habitConfigs";

interface IProps {
  data: IDayCellEditor;
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
}

interface IFormValues {
  value: string;
  plannedValue: number;
}

const DurationHabit = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [updateHabit] = useUpdateHabitMutation();
  const cellData = colDef?.field && data[+colDef.field];

  const [initValues, setInitValues] = useState<null | IFormValues>(null);

  useEffect(() => {
    setInitValues({ ...cellData, plannedValue: 0 });
  }, [cellData, data.habitDetails.minToComplete]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const habitToUpdate = {
        id: data.id,
        data: { ...cellData, ...formValues, value: true },
        path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
      };
      await updateHabit(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const newMonthHistory = _.pickBy(data, (_value, key) => !isNaN(+key));
      delete newMonthHistory[colDef.field];
      const habitToUpdate = {
        id: data.id,
        data: newMonthHistory,
        path: `history.${data.currentDate.year}.${data.currentDate.month}`,
      };

      await updateHabit(habitToUpdate).unwrap();
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

export default DurationHabit;
