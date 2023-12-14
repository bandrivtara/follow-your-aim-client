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
  Cascader,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Space,
} from "antd";
import { Fragment, useCallback, useState } from "react";
import { ITask } from "types/taskGroups";
import { FormInstance, useWatch } from "antd/es/form/Form";
import { getTimeOptions } from "share/functions/getTimeOptions";
import StyledListHabitStore from "./ListStore.styled";

interface IProps {
  dayForm: FormInstance<any>;
  form: FormInstance<any>;
  isStoreOpened: boolean;
  setIsStoreOpened: (isStoreOpened: boolean) => void;
}

const initValues = {
  title: "",
  description: "",
  link: "",
  status: "pending",
  time: ["", ""],
  isEditOn: false,
};

const ListHabitsStore = ({
  dayForm,
  form,
  isStoreOpened,
  setIsStoreOpened,
}: IProps) => {
  const formTasks: ITask[] = useWatch("tasks", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);

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

  const addToDay = (taskIndex: number) => {
    const dayTasks = [...dayForm.getFieldsValue().tasks, formTasks[taskIndex]];
    dayForm.setFieldsValue({
      value: dayForm.getFieldsValue().value,
      tasks: dayTasks,
    });
    formTasks.splice(taskIndex, 1);
  };

  return (
    <StyledListHabitStore>
      <Collapse
        collapsible="header"
        activeKey={isStoreOpened ? 1 : 0}
        items={[
          {
            key: "1",
            label: "Сховище завдань",
            onItemClick: () => setIsStoreOpened(!isStoreOpened),
            forceRender: true,
            children: (
              <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                form={form}
                name="dayCellEditor"
                initialValues={{ value: 0, tasks: [] }}
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
                                <Col md={12} xs={12} className="action-buttons">
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
                                        onClick={() => addToDay(task.name)}
                                      >
                                        <UpCircleOutlined rev={"value"} />
                                      </Button>
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
                                <Col style={{ marginRight: "10px" }}>
                                  <Form.Item
                                    name={[index, "time"]}
                                    hidden={!isTaskFieldVisible(index, "time")}
                                    initialValue={initValues.time}
                                    noStyle
                                  >
                                    <Cascader
                                      suffixIcon={
                                        <ClockCircleOutlined rev={"value"} />
                                      }
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
                                      addonAfter={
                                        <LinkOutlined rev={"value"} />
                                      }
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
                                    hidden={
                                      !isTaskFieldVisible(index, "description")
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
                              Додати завдання
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </StyledListHabitStore>
  );
};

export default ListHabitsStore;
