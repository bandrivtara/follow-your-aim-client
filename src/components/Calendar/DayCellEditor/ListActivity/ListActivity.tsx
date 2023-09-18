import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button,
  Cascader,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Space,
} from "antd";
import {
  BorderOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseSquareOutlined,
  DeleteOutlined,
  LinkOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import FormButtons from "../../../../share/components/Form/FormButtons";
import { ColDef } from "ag-grid-community";
import { IDayCellEditor } from "../DayCellEditor";
import { useUpdateActivityMutation } from "../../../../store/services/activity";
import { getTimeOptions } from "../../../../share/functions/getTimeOptions";
import { IStopEditing } from "../../activityConfigs";
import _ from "lodash";

interface IProps {
  colDef: ColDef<IDayCellEditor>;
  stopEditing: IStopEditing;
  data: IDayCellEditor;
}

interface ITask {
  title: string;
  description?: string;
  link?: string;
  status: "pending" | "failed" | "done";
  time?: string[];
  isEditOn?: boolean;
}

interface IFormValues {
  tasks: ITask[];
}

const initValues = {
  title: "",
  description: "",
  link: "",
  status: "pending",
  time: ["", ""],
  isEditOn: false,
};

const ListActivity = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [updateActivity] = useUpdateActivityMutation();
  const cellData = colDef.field && data[+colDef.field];

  const formTasks: ITask[] = useWatch("tasks", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);

  useEffect(() => {
    if (cellData) {
      form.setFieldsValue(cellData);
    }
  }, [cellData, form]);

  const handleConfirm = async (formValues: IFormValues) => {
    if (colDef.field) {
      const doneTaskCount = formTasks.filter(
        (task) => task && task.status === "done"
      ).length;
      const newDayStatus = {
        ...formValues,
        value: `${doneTaskCount}/${formValues.tasks.length}`,
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

  const isTaskFieldVisible = useCallback(
    (taskIndex: number, name: string) => {
      if (formTasks) {
        const value = formTasks[taskIndex];
        // @ts-ignore
        const initValue = value?.[name];
        let valueExists = Array.isArray(initValue) ? initValue[0] : initValue;
        return valueExists || taskIndex === editFiledIndex;
      }
      return true;
    },
    [editFiledIndex, formTasks]
  );

  const handleEditTask = (taskIndex: number) => {
    if (editFiledIndex !== taskIndex) {
      setEditFiledIndex(taskIndex);
    } else {
      setEditFiledIndex(null);
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
      >
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues !== currentValues
          }
        >
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              overflowX: "hidden",
              paddingLeft: "4px",
            }}
          >
            <Form.Item hidden name="value" noStyle></Form.Item>

            <Form.List name="tasks">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((task, index) => (
                    <Fragment key={task.key}>
                      <Row
                        style={{ minWidth: "680px" }}
                        gutter={8}
                        justify="space-between"
                      >
                        <Col style={{ minWidth: "400px" }}>
                          <Form.Item
                            name={[index, "title"]}
                            noStyle
                            rules={[{ required: true }]}
                            initialValue={initValues.title}
                          >
                            <Input placeholder="Назва завдання" />
                          </Form.Item>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            name={[index, "status"]}
                            initialValue={initValues.status}
                            noStyle
                          >
                            <Radio.Group>
                              <Radio.Button value={"failed"}>
                                <CloseSquareOutlined rev={"value"} />
                              </Radio.Button>
                              <Radio.Button value={"pending"}>
                                <BorderOutlined rev={"value"} />
                              </Radio.Button>
                              <Radio.Button value={"done"}>
                                <CheckSquareOutlined rev={"value"} />
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col flex="auto">
                          <Form.Item noStyle>
                            <Space.Compact>
                              <Button
                                type={
                                  index === editFiledIndex
                                    ? "primary"
                                    : "default"
                                }
                                onClick={() => handleEditTask(index)}
                              >
                                <MoreOutlined rev={"value"} />
                              </Button>
                              <Button
                                danger
                                disabled={fields.length <= 1}
                                onClick={() => remove(task.name)}
                              >
                                <DeleteOutlined rev={"value"} />
                              </Button>
                            </Space.Compact>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col style={{ marginRight: "10px" }}>
                          <Form.Item
                            name={[index, "time"]}
                            hidden={!isTaskFieldVisible(index, "time")}
                            initialValue={initValues.time}
                            noStyle
                          >
                            <Cascader
                              suffixIcon={<ClockCircleOutlined rev={"value"} />}
                              style={{ width: "100px" }}
                              options={getTimeOptions(15)}
                            />
                          </Form.Item>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            required={false}
                            name={[index, "link"]}
                            hidden={!isTaskFieldVisible(index, "link")}
                            initialValue={initValues.link}
                            noStyle
                          >
                            <Input
                              addonAfter={<LinkOutlined rev={"value"} />}
                              placeholder="Посилання"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Form.Item
                            required={false}
                            name={[index, "description"]}
                            initialValue={initValues.description}
                            hidden={!isTaskFieldVisible(index, "description")}
                            noStyle
                          >
                            <Input.TextArea
                              style={{ margin: "12px 0" }}
                              placeholder="Опис"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "12px 0" }} />
                    </Fragment>
                  ))}
                  <Form.Item>
                    <Button onClick={() => add()}>Додати завдання</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
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

export default ListActivity;
