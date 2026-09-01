import _ from "lodash";
import { Cascader, Form } from "antd";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ColDef } from "ag-grid-community";
import FormButtons from "share/components/Form/FormButtons";
import { IDayCellEditor } from "../DayCellEditor";
import { IStopEditing } from "../../cellConfigs";
import { useUpdateHistoryMutation } from "store/services/history";
import StyledDayCellForm from "../DayCellForm.styled";
import { normalizeHistoryDayKey } from "share/functions/historyDayKey";

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
  const [updateHistory] = useUpdateHistoryMutation();
  const cellData = colDef?.field && data[colDef.field];

  const [initValues, setInitValues] = useState<null | IFormValues>(null);

  useEffect(() => {
    setInitValues({ ...cellData, plannedValue: 0 });
  }, [cellData, data.details.minToComplete]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const habitToUpdate = {
        id: data.currentDate,
        data: { ...cellData, ...formValues, value: true },
        path: `${normalizeHistoryDayKey(colDef.field)}.${data.id}`,
      };
      await updateHistory(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const newMonthHistory = _.pickBy(data, (_value, key) => !isNaN(+key));
      delete newMonthHistory[colDef.field];
      const habitToUpdate = {
        id: data.currentDate,
        data: null,
        path: `${normalizeHistoryDayKey(colDef.field)}.${data.id}`,
      };

      await updateHistory(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
  };

  return (
    initValues && (
      <StyledDayCellForm>
        <Form
          layout="vertical"
          form={form}
          name="dayCellEditor"
          onFinish={handleConfirm}
          initialValues={initValues}
        >
          <div className="time-grid">
          <Form.Item name="value" hidden />
            <Form.Item name="from" label="З" rules={[{ required: true }]}>
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                options={getTimeOptions(15)}
              />
            </Form.Item>
            <Form.Item name="to" label="До" rules={[{ required: true }]}>
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          </div>
          <Form.Item className="editor-actions">
            <FormButtons
              handleDecline={handleDecline}
              handleDelete={handleDelete}
            />
          </Form.Item>
        </Form>
      </StyledDayCellForm>
    )
  );
};

export default DurationHabit;
