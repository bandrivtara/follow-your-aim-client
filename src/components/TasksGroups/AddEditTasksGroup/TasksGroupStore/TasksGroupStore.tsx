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
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
} from "antd";
import { useCallback, useState } from "react";
import { ITask } from "types/taskGroups";
import { FormInstance, useWatch } from "antd/es/form/Form";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { LIFE_AREAS } from "config/lifeAreas";
import uniqid from "uniqid";
import StyledTasksGroupStore from "./TasksGroupStore.styled";

interface IProps {
  dayForm?: FormInstance<any>;
  form: FormInstance<any>;
}

const initValues = {
  title: "",
  description: "",
  link: "",
  status: "pending",
  time: ["", ""],
  category: "",
  priority: "",
  isEditOn: false,
};

const TasksGroupStore = ({ dayForm, form }: IProps) => {
  const formTasks: ITask[] = useWatch("tasksStore", form);
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
    if (!dayForm) return;
    const dayTasks = [...dayForm.getFieldsValue().tasks, formTasks[taskIndex]];
    dayForm.setFieldsValue({
      value: dayForm.getFieldsValue().value,
      tasks: dayTasks,
    });
    formTasks.splice(taskIndex, 1);
  };

  return (
    <StyledTasksGroupStore>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues !== currentValues
        }
      >
        <div className="tasks-scroll">
          <Form.List name="tasksStore">
            {(fields, { add, remove }) => (
              <>
                {fields.map((task, index) => (
                  <div className="task-item" key={task.key}>
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
                    <Row gutter={[8, 8]} className="task-details">
                      <Col md={7} xs={24}>
                        <Form.Item
                          label="Категорія"
                          name={[index, "category"]}
                          hidden={!isTaskFieldVisible(index, "category")}
                          initialValue={initValues.category}
                        >
                          <Select
                            allowClear
                            placeholder="Без категорії"
                            options={LIFE_AREAS.map((area) => ({
                              value: area.id,
                              label: area.title,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col md={5} xs={24}>
                        <Form.Item
                          label="Пріоритет"
                          name={[index, "priority"]}
                          hidden={!isTaskFieldVisible(index, "priority")}
                          initialValue={initValues.priority}
                        >
                          <Select
                            allowClear
                            placeholder="Не задано"
                            options={[
                              { value: "high", label: "Високий" },
                              { value: "medium", label: "Середній" },
                              { value: "low", label: "Низький" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col md={5} xs={24}>
                        <Form.Item
                          label="Час"
                          name={[index, "time"]}
                          hidden={!isTaskFieldVisible(index, "time")}
                          initialValue={initValues.time}
                        >
                          <Cascader
                            suffixIcon={<ClockCircleOutlined rev={"value"} />}
                            style={{ width: "100%" }}
                            options={getTimeOptions(15)}
                            placeholder="Не вказано"
                          />
                        </Form.Item>
                      </Col>
                      <Col md={7} xs={24}>
                        <Form.Item
                          required={false}
                          label="Посилання"
                          name={[index, "link"]}
                          hidden={!isTaskFieldVisible(index, "link")}
                          initialValue={initValues.link}
                        >
                          <Input
                            addonAfter={<LinkOutlined rev={"value"} />}
                            placeholder="Посилання"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row className="task-description-row">
                      <Col span={24}>
                        <Form.Item
                          required={false}
                          label="Опис"
                          name={[index, "description"]}
                          initialValue={initValues.description}
                          hidden={!isTaskFieldVisible(index, "description")}
                        >
                          <Input.TextArea placeholder="Опис" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}
                <Form.Item className="add-btn">
                  <Button
                    type="dashed"
                    block
                    onClick={() => {
                      const nextIndex = form.getFieldValue("tasksStore")?.length || 0;
                      add({ ...initValues, id: uniqid() });
                      setEditFiledIndex(nextIndex);
                    }}
                  >
                    Додати завдання
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
      </Form.Item>
    </StyledTasksGroupStore>
  );
};

export default TasksGroupStore;
