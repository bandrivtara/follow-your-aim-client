import {
  BorderOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseSquareOutlined,
  DeleteOutlined,
  LinkOutlined,
  MoreOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Cascader,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
} from "antd";
import { Fragment, useCallback, useState } from "react";
import { ITask } from "types/taskGroups";
import { FormInstance, useWatch } from "antd/es/form/Form";
import StyledTaskGroupsStages from "./TaskGroupsStages.styled";
import uniqid from "uniqid";

interface IProps {
  dayForm?: FormInstance<any>;
  form: FormInstance<any>;
}

const initValues = {
  title: "",
  description: "",
  status: "pending",
  isEditOn: false,
  stagePercentage: 0,
};

const TaskGroupsStages = ({ dayForm, form }: IProps) => {
  const formStages: ITask[] = useWatch("tasksStages", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);

  const isTaskFieldVisible = useCallback(
    (taskIndex: number, name: string) => {
      if (formStages) {
        const value = formStages[taskIndex];
        // @ts-ignore
        const initValue = value?.[name];
        let valueExists = Array.isArray(initValue) ? initValue[0] : initValue;
        return valueExists || taskIndex === editFiledIndex;
      }
      return true;
    },
    [editFiledIndex, formStages]
  );

  const handleEditTask = (taskIndex: number) => {
    if (editFiledIndex !== taskIndex) {
      setEditFiledIndex(taskIndex);
    } else {
      setEditFiledIndex(null);
    }
  };

  const addToDay = (taskIndex: number) => {
    if (!dayForm) return;
    const dayTasks = [...dayForm.getFieldsValue().tasks, formStages[taskIndex]];
    dayForm.setFieldsValue({
      value: dayForm.getFieldsValue().value,
      tasks: dayTasks,
    });
    formStages.splice(taskIndex, 1);
  };

  return (
    <StyledTaskGroupsStages>
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
          <Form.List name="tasksStages">
            {(fields, { add, remove }) => (
              <>
                {fields.map((task, index) => (
                  <Fragment key={task.key}>
                    <Form.Item
                      noStyle
                      name={[index, "id"]}
                      initialValue={uniqid()}
                    />
                    <Row gutter={8} justify="space-between">
                      <Col md={24} xs={24}>
                        <Form.Item
                          name={[index, "title"]}
                          noStyle
                          rules={[{ required: true }]}
                          initialValue={initValues.title}
                        >
                          <Input placeholder="Назва Етапу" />
                        </Form.Item>
                      </Col>
                      <Col md={12} xs={14}>
                        <Form.Item name={[index, "stagePercentage"]} noStyle>
                          <InputNumber
                            addonAfter="%"
                            placeholder="Обсяг від загального"
                          />
                        </Form.Item>
                      </Col>
                      <Col md={12} xs={12} className="action-buttons">
                        <Form.Item noStyle>
                          <Space.Compact>
                            <Button
                              type={
                                index === editFiledIndex ? "primary" : "default"
                              }
                              onClick={() => handleEditTask(index)}
                            >
                              <MoreOutlined rev={"value"} />
                            </Button>
                            {dayForm && (
                              <Button onClick={() => addToDay(task.name)}>
                                <UpCircleOutlined rev={"value"} />
                              </Button>
                            )}
                            <Button danger onClick={() => remove(task.name)}>
                              <DeleteOutlined rev={"value"} />
                            </Button>
                          </Space.Compact>
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
                          <Input.TextArea placeholder="Опис" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Card title="Задання" className="subTasks">
                      <Form.List name={[index, `subTasks`]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((task, index) => (
                              <Fragment key={task.key}>
                                <Row gutter={8} justify="space-between">
                                  <Col md={24} xs={24}>
                                    <Form.Item
                                      name={[index, "title"]}
                                      noStyle
                                      rules={[{ required: true }]}
                                      initialValue={initValues.title}
                                    >
                                      <Input placeholder="Назва завдання" />
                                    </Form.Item>
                                  </Col>
                                  <Col md={12} xs={14}>
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
                                  <Col
                                    md={12}
                                    xs={12}
                                    className="action-buttons"
                                  >
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
                                        {dayForm && (
                                          <Button
                                            onClick={() => addToDay(task.name)}
                                          >
                                            <UpCircleOutlined rev={"value"} />
                                          </Button>
                                        )}
                                        <Button
                                          danger
                                          onClick={() => remove(task.name)}
                                        >
                                          <DeleteOutlined rev={"value"} />
                                        </Button>
                                      </Space.Compact>
                                    </Form.Item>
                                  </Col>
                                </Row>

                                <Row>
                                  <Col span={24}>
                                    <Form.Item
                                      required={false}
                                      name={[index, "description"]}
                                      initialValue={initValues.description}
                                      hidden={
                                        !isTaskFieldVisible(
                                          index,
                                          "description"
                                        )
                                      }
                                      noStyle
                                    >
                                      <Input.TextArea placeholder="Опис" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Divider style={{ margin: "12px 0" }} />
                              </Fragment>
                            ))}
                            <Form.Item className="add-btn">
                              <Button onClick={() => add()}>
                                Додати завдання до Етапу
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  </Fragment>
                ))}
                <Form.Item className="add-btn">
                  <Button onClick={() => add()}>Додати Етап</Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
      </Form.Item>
    </StyledTaskGroupsStages>
  );
};

export default TaskGroupsStages;
