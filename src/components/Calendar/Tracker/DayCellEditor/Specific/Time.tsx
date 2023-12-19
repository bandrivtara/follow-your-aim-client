import _ from "lodash";
import { Cascader, Form } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ClockCircleOutlined } from "@ant-design/icons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import FormButtons from "share/components/Form/FormButtons";
import { ColDef } from "ag-grid-community";
import { useEffect, useState } from "react";
import { IStopEditing } from "../../DayCellRenderer/trackerConfigs";
import { useUpdateHistoryMutation } from "store/services/history";

interface IProps {
  data: IDayCellEditor;
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
}

interface IFormValues {
  value: number;
  plannedValue: number;
}

const Time = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const cellData = colDef.field && data[+colDef.field];

  const [initValues, setInitValues] = useState<null | IFormValues>(null);

  useEffect(() => {
    setInitValues({
      value:
        cellData?.value ||
        cellData?.plannedValue ||
        data.details.minToComplete ||
        0,
      plannedValue: cellData?.plannedValue || data.details.minToComplete || 0,
    });
  }, [cellData, data.details.minToComplete]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const historyToUpdate = {
        id: data.id,
        data: { ...cellData, ...formValues },
        path: `${colDef.field}.${data.id}`,
      };

      console.log(historyToUpdate);
      await updateHistory(historyToUpdate).unwrap();
      // stopEditing();
    }
  };

  const handleDelete = async () => {
    if (colDef.field) {
      const newMonthHistory = _.pickBy(data, (_value, key) => !isNaN(+key));
      delete newMonthHistory[colDef.field];
      const historyToUpdate = {
        id: data.id,
        data: null,
        path: `${colDef.field}.${data.id}`,
      };

      await updateHistory(historyToUpdate).unwrap();
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
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues !== currentValues
          }
        >
          {data.calendarMode === "tracking" ? (
            <Form.Item name="value" label="Час" rules={[{ required: true }]}>
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                style={{ width: "100px" }}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="plannedValue"
              label="Час"
              rules={[{ required: true }]}
            >
              <Cascader
                suffixIcon={<ClockCircleOutlined rev={"value"} />}
                style={{ width: "100px" }}
                options={getTimeOptions(15)}
              />
            </Form.Item>
          )}
        </Form.Item>
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

export default Time;
