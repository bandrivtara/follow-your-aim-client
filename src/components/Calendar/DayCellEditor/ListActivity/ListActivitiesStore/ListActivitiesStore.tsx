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
  List,
  Radio,
  Row,
  Space,
} from "antd";
import { Fragment, useCallback, useState } from "react";
import { getTimeOptions } from "../../../../../share/functions/getTimeOptions";
import { ITask } from "../../../../../types/tasks";
import { useWatch } from "antd/es/form/Form";
import StyledListActivityStore from "./ListActivitiesStore.styled";

interface IProps {}

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

const ListActivitiesStore = ({}: IProps) => {
  const [form] = Form.useForm();
  const formTasks: ITask[] = useWatch("tasks", form);

  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);

  const handleConfirm = async (formValues: IFormValues) => {
    // if (colDef.field) {
    //   const doneTaskCount = formTasks.filter(
    //     (task) => task && task.status === "done"
    //   ).length;
    //   const newDayStatus = {
    //     ...formValues,
    //     value: `${doneTaskCount}/${formValues.tasks.length}`,
    //   };
    //   const activityToUpdate = {
    //     id: data.id,
    //     data: { ...newDayStatus },
    //     path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
    //   };
    //   await updateActivity(activityToUpdate).unwrap();
    //   stopEditing();
    // }
    console.log(formValues);
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

  const addToDay = (taskName: any) => {
    console.log(taskName);
  };

  return (
    <StyledListActivityStore>
      <Collapse
        collapsible="header"
        defaultActiveKey={["0"]}
        items={[
          {
            key: "1",
            label: "Сховище завдань",
            children: (
              <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
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
                              <Row gutter={8} justify="space-between">
                                <Col flex="3">
                                  <Form.Item
                                    name={[index, "title"]}
                                    noStyle
                                    rules={[{ required: true }]}
                                    initialValue={initValues.title}
                                  >
                                    <Input placeholder="Назва завдання" />
                                  </Form.Item>
                                </Col>

                                <Col flex="1">
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
                                        // disabled={fields.length <= 1}
                                        onClick={() => remove(task.name)}
                                      >
                                        <DeleteOutlined rev={"value"} />
                                      </Button>
                                    </Space.Compact>
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Row>
                                {/* <Col style={{ marginRight: "10px" }}>
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
                              </Col> */}
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
    </StyledListActivityStore>
  );
};

export default ListActivitiesStore;
