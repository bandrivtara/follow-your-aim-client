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
  DownCircleOutlined,
  LinkOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import FormButtons from "share/components/Form/FormButtons";
import { ColDef } from "ag-grid-community";
import { IDayCellEditor } from "../DayCellEditor";
import { useUpdateHabitMutation } from "store/services/habits";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { IStopEditing } from "../../DayCellRenderer/trackerConfigs";
import StyledListHabit from "./List.styled";
import ListHabitsStore from "./ListStore/ListStore";
import { useUpdateHistoryMutation } from "store/services/history";
import TaskGroupsStore from "components/TaskGroups/TaskGroupsStore/TaskGroupsStore";
import {
  useGetTaskGroupQuery,
  useUpdateTaskGroupMutation,
} from "store/services/taskGroups";

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

const initTask = {
  title: "",
  description: "",
  link: "",
  status: "pending",
  time: ["", ""],
  isEditOn: false,
};

const ListHabit = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [storeForm] = Form.useForm();
  const [updateHistory] = useUpdateHistoryMutation();
  const formTasks: ITask[] = useWatch("tasks", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);
  const [isStoreOpened, setIsStoreOpened] = useState(false);
  const [updateTaskGroup] = useUpdateTaskGroupMutation();
  const taskGroupDetails = useGetTaskGroupQuery(data.id);

  const cellData = colDef.field && data[+colDef.field];

  useEffect(() => {
    if (taskGroupDetails) {
      if (taskGroupDetails.data && taskGroupDetails.data) {
        console.log(taskGroupDetails, data.id);
        storeForm.setFieldsValue(taskGroupDetails.data);
      }
    }

    if (cellData && cellData.tasks) {
      form.setFieldsValue(cellData);
    } else {
      form.setFieldsValue({ value: 0, tasks: [initTask] });
    }
  }, [cellData, data, form, storeForm, taskGroupDetails]);

  const handleConfirm = async () => {
    const formValues = form.getFieldsValue();
    const validatedTasks = formValues.tasks.filter((task: ITask) => task.title);

    if (colDef.field) {
      const doneTaskCount = formTasks.filter(
        (task) => task && task.status === "done"
      ).length;
      const newDayStatus = {
        tasks: validatedTasks,
        value: `${doneTaskCount}/${validatedTasks.length}`,
      };
      const habitToUpdate = {
        id: data.currentDate,
        data: { ...newDayStatus },
        path: `${colDef.field}.${data.id}`,
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
        console.log(data);
        await updateHistory(habitToUpdate).unwrap();
      }

      // await updateHabit(storeToUpdate).unwrap();
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
        id: data.currentDate,
        data: null,
        path: `${colDef.field}.${data.id}`,
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

  return (
    initTask && (
      <StyledListHabit>
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
              console.log(prevValues, currentValues);
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
              <Form.Item hidden name="value" noStyle></Form.Item>

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
              label: "Сховище завдань",
              onItemClick: () => setIsStoreOpened(!isStoreOpened),
              forceRender: true,
              children: (
                <Form layout="horizontal" form={storeForm} name="storeForm">
                  <TaskGroupsStore dayForm={form} form={storeForm} />
                </Form>
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
      </StyledListHabit>
    )
  );
};

export default ListHabit;
