import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ICellEditorParams } from "ag-grid-community";
import { Button, Form } from "antd";
import { forwardRef, memo, useEffect } from "react";
import {
  useGetActivityQuery,
  useUpdateActivityMutation,
} from "../../../store/services/activity";
import {
  IActivityDetails,
  IActivityStatus,
} from "../../../types/activity.types";
import { activityConfigs } from "../activityConfigs";

export interface IDayCellEditor {
  id: string;
  activityData: IActivityDetails;
  currentDate: {
    year: number;
    month: number;
  };
  calendarMode: any;
}

const DayCellEditor = memo(
  forwardRef(
    ({ data, colDef, stopEditing }: ICellEditorParams<IDayCellEditor>, ref) => {
      const [form] = Form.useForm();
      const [updateActivity] = useUpdateActivityMutation();
      const activityData = useGetActivityQuery(data?.id);
      // @ts-ignore
      const cellData = colDef.field && data?.[+colDef.field];

      const handleConfirm = async (formValues: any) => {
        if (colDef.field) {
          const newDayStatus: IActivityStatus = {
            ...cellData,
            ...formValues,
          };
          const activityToUpdate = {
            id: data.id,
            data: { ...newDayStatus },
            path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
          };

          await updateActivity(activityToUpdate).unwrap();
          stopEditing();
        }
      };

      const handleDecline = () => {
        stopEditing();
      };

      const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Alt") {
          form.submit();
        }
      };

      const handleDelete = async () => {
        if (colDef.field && activityData.data && activityData.data.history) {
          const currentDayStatus = {
            ...activityData.data.history[data.currentDate.year][
              data.currentDate.month
            ],
          };
          delete currentDayStatus[+colDef.field];

          const activityToUpdate = {
            id: data.id,
            data: currentDayStatus,
            path: `history.${data.currentDate.year}.${data.currentDate.month}`,
          };

          await updateActivity(activityToUpdate).unwrap();

          stopEditing();
        }
      };

      const currentCellEditorData =
        data &&
        activityConfigs[data.activityData.valueType].cellEditor(
          data,
          form,
          colDef,
          handleKeyUp
        );

      return (
        <div tabIndex={1}>
          {cellData && (
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              style={{ minWidth: 300, margin: 20 }}
              form={form}
              name="dayCellEditor"
              onFinish={handleConfirm}
              hidden={data.activityData.valueType === "boolean"}
              initialValues={cellData}
            >
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues !== currentValues
                }
              >
                {currentCellEditorData}
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  icon={<CheckOutlined rev={"value"} />}
                  size={"large"}
                />
                <Button
                  style={{ marginLeft: 20 }}
                  danger
                  type="primary"
                  icon={<CloseOutlined rev={"value"} />}
                  size={"large"}
                  onClick={handleDecline}
                />
                <Button
                  style={{ marginLeft: 20 }}
                  danger
                  type="primary"
                  icon={<DeleteOutlined rev="value" />}
                  size={"large"}
                  onClick={handleDelete}
                />
              </Form.Item>
            </Form>
          )}
        </div>
      );
    }
  )
);

export default DayCellEditor;
