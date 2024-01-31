import { Fragment, useCallback, useEffect, useState } from "react";
import _ from "lodash";
import {
  Button,
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
  Tabs,
  TabsProps,
} from "antd";
import {
  BorderOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseSquareOutlined,
  DeleteOutlined,
  DownCircleOutlined,
  LinkOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import FormButtons from "share/components/Form/FormButtons";
import { ColDef } from "ag-grid-community";
import { IDayCellEditor } from "../DayCellEditor";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { IDayData, IStopEditing } from "../../cellConfigs";
import StyledTodoList from "./TodoList.styled";
import { useUpdateHistoryMutation } from "store/services/history";
import {
  useGetTaskGroupQuery,
  useUpdateTaskGroupMutation,
} from "store/services/taskGroups";
import TasksGroupStages from "components/TasksGroups/AddEditTasksGroup/TasksGroupStages/TasksGroupStages";
import TasksGroupStore from "components/TasksGroups/AddEditTasksGroup/TasksGroupStore/TasksGroupStore";

interface IProps {
  colDef: ColDef<IDayData>;
  stopEditing: IStopEditing;
  data: IDayData;
}

interface ITask {
  title: string;
  description?: string;
  link?: string;
  status: "pending" | "failed" | "done";
  time?: string[];
  isEditOn?: boolean;
}

const initTask = {
  title: "",
  description: "",
  link: "",
  status: "pending",
  time: ["", ""],
  isEditOn: false,
};

const TodoList = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [storeForm] = Form.useForm();
  const [stageForm] = Form.useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const formTasks: ITask[] = useWatch("tasks", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);
  const [isStoreOpened, setIsStoreOpened] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [updateTaskGroup] = useUpdateTaskGroupMutation();
  const taskGroupDetails = useGetTaskGroupQuery(data.id);

  const { dayData } = colDef.cellRendererParams;

  const cellData = colDef.field && data[+colDef.field];

  useEffect(() => {
    const initTasksGroup = {
      id: taskGroupDetails?.data?.id,
      type: "tasksGroup",
      valueType: "todoList",
      progress: 0,
      tasks: [initTask],
    };

    if (taskGroupDetails && taskGroupDetails.data) {
      storeForm.setFieldsValue(taskGroupDetails.data);
      stageForm.setFieldsValue(taskGroupDetails.data);
    }

    if (cellData && cellData.tasks) {
      form.setFieldsValue(cellData);
    } else {
      form.setFieldsValue(initTasksGroup);
    }
  }, [
    cellData,
    data,
    dayData.date,
    form,
    stageForm,
    storeForm,
    taskGroupDetails,
  ]);

  const handleConfirm = async () => {
    const formValues = form.getFieldsValue();
    const validatedTasks = formValues.tasks.filter((task: ITask) => task.title);
    console.log(dayData);
    if (colDef.field) {
      const historyToUpdate = {
        id: data[colDef.field]?.currentDay || dayData.date,
        data: { ...formValues, tasks: validatedTasks },
      };

      const storeValues = storeForm.getFieldsValue();
      const taskGroupToUpdate = {
        id: data.id,
        data: storeValues,
        path: "",
      };
      await updateTaskGroup(taskGroupToUpdate).unwrap();

      if (!validatedTasks[0]) {
        await handleDelete();
      } else {
        await updateHistory(historyToUpdate).unwrap();
      }
      return stopEditing();
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
      const habitToUpdate = {
        id: data[colDef.field].currentDate,
        data: null,
      };
      await updateHistory(habitToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
  };

  const addToStore = (taskIndex: number) => {
    const storeTasks = [
      ...storeForm.getFieldsValue().tasksStore,
      formTasks[taskIndex],
    ];
    storeForm.setFieldValue("tasksStore", storeTasks);
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Вибрати з етапів",
      children: (
        <Form layout="horizontal" form={stageForm} name="tasksStages">
          <TasksGroupStages dayForm={form} form={stageForm} />
        </Form>
      ),
    },
    {
      key: "2",
      label: "Сховище",
      children: (
        <Form layout="horizontal" form={storeForm} name="storeForm">
          <TasksGroupStore dayForm={form} form={storeForm} />
        </Form>
      ),
    },
  ];

  return (
    initTask && (
      <StyledTodoList>
        <Form
          labelCol={{ md: 8 }}
          wrapperCol={{ md: 14 }}
          layout="horizontal"
          style={{ minWidth: 300, margin: 20 }}
          form={form}
          name="dayCellEditor"
        >
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              return prevValues !== currentValues;
            }}
          >
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "hidden",
                paddingLeft: "4px",
              }}
            >
              <Form.Item name="id" hidden />
              <Form.Item name="valueType" hidden />
              <Form.Item name="type" hidden />

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.tasks !== currentValues.tasks
                }
              >
                {({ getFieldValue, setFieldValue }) => {
                  const tasksList = getFieldValue("tasks");
                  if (!tasksList) return;
                  const doneTasks = tasksList.filter(
                    (task) => task.status === "done"
                  );
                  const progress = (doneTasks.length / tasksList.length) * 100;
                  setFieldValue("progress", +progress.toFixed(0));
                  return (
                    <Form.Item label="Прогрес" name="progress">
                      <InputNumber disabled />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Form.List name="tasks">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((task, index) => (
                      <Fragment key={task.key}>
                        <Row gutter={8}>
                          <Col md={24} xs={24}>
                            <Form.Item
                              name={[index, "title"]}
                              noStyle
                              rules={[{ required: true }]}
                              initialValue={initTask.title}
                            >
                              <Input placeholder="Назва завдання" />
                            </Form.Item>
                          </Col>
                          <Col md={12} xs={14}>
                            <Form.Item
                              name={[index, "status"]}
                              initialValue={initTask.status}
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
                          <Col md={12} xs={10} className="action-buttons">
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
                                  onClick={() => {
                                    setIsStoreOpened(true);
                                    addToStore(task.name);
                                    remove(task.name);
                                  }}
                                >
                                  <DownCircleOutlined rev={"value"} />
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
                              initialValue={initTask.time}
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
                              initialValue={initTask.link}
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
                          <Col md={24} xs={24}>
                            <Form.Item
                              required={false}
                              name={[index, "description"]}
                              initialValue={initTask.description}
                              hidden={!isTaskFieldVisible(index, "description")}
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
                      <Button onClick={() => add()}>Додати завдання</Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </Form.Item>
        </Form>
        <Collapse
          collapsible="header"
          activeKey={isStoreOpened ? 1 : 0}
          items={[
            {
              key: "1",
              label: "Завдання",
              onItemClick: () => setIsStoreOpened(!isStoreOpened),
              forceRender: true,
              children: (
                <Tabs
                  defaultActiveKey="1"
                  items={tabItems}
                  onChange={(key: string) => setActiveTab(key)}
                  activeKey={activeTab}
                />
              ),
            },
          ]}
        />
        <div className="form-buttons">
          <FormButtons
            handleDecline={handleDecline}
            handleDelete={handleDelete}
            handleConfirm={handleConfirm}
          />
        </div>
      </StyledTodoList>
    )
  );
};

export default TodoList;
