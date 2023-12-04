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
  DownCircleOutlined,
  LinkOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import FormButtons from "../../../../share/components/Form/FormButtons";
import { ColDef } from "ag-grid-community";
import { IDayCellEditor } from "../DayCellEditor";
import { useUpdateActivityMutation } from "../../../../store/services/activity";
import { getTimeOptions } from "../../../../share/functions/getTimeOptions";
import { IStopEditing } from "../../Activities/activityConfigs";
import _ from "lodash";
import ListActivitiesStore from "./ListActivitiesStore/ListActivitiesStore";
import StyledListActivity from "./ListActivity.styled";

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

const ListActivity = ({ data, colDef, stopEditing }: IProps) => {
  const [form] = Form.useForm();
  const [storeForm] = Form.useForm();
  const [updateActivity] = useUpdateActivityMutation();
  const formTasks: ITask[] = useWatch("tasks", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);
  const [isStoreOpened, setIsStoreOpened] = useState(false);

  const cellData = colDef.field && data[+colDef.field];

  useEffect(() => {
    storeForm.setFieldsValue(data.store);
    if (cellData) {
      form.setFieldsValue(cellData);
    } else {
      form.setFieldsValue({ value: 0, tasks: [initTask] });
    }
  }, [cellData, data, form, storeForm]);

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
      const activityToUpdate = {
        id: data.id,
        data: { ...newDayStatus },
        path: `history.${data.currentDate.year}.${data.currentDate.month}.${colDef.field}`,
      };

      console.log(activityToUpdate, 123);

      const storeValues = storeForm.getFieldsValue();
      const storeToUpdate = {
        id: data.id,
        data: storeValues,
        path: "store",
      };

      if (!validatedTasks[0]) {
        await handleDelete();
      } else {
        await updateActivity(activityToUpdate).unwrap();
      }

      await updateActivity(storeToUpdate).unwrap();
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
      const activityToUpdate = {
        id: data.id,
        data: newMonthHistory,
        path: `history.${data.currentDate.year}.${data.currentDate.month}`,
      };
      console.log("test");
      await updateActivity(activityToUpdate).unwrap();
      stopEditing();
    }
  };

  const handleDecline = () => {
    stopEditing();
  };

  const addToStore = (taskIndex: number) => {
    const storeTasks = [
      ...storeForm.getFieldsValue().tasks,
      formTasks[taskIndex],
    ];
    storeForm.setFieldsValue({
      value: storeForm.getFieldsValue().value,
      tasks: storeTasks,
    });
  };

  return (
    initTask && (
      <StyledListActivity>
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
                          <Col md={16} xs={24}>
                            <Form.Item
                              name={[index, "title"]}
                              noStyle
                              rules={[{ required: true }]}
                              initialValue={initTask.title}
                            >
                              <Input placeholder="Назва завдання" />
                            </Form.Item>
                          </Col>
                          <Col md={4} xs={14}>
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
                          <Col md={4} xs={10} className="action-buttons">
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
        <ListActivitiesStore
          dayForm={form}
          form={storeForm}
          isStoreOpened={isStoreOpened}
          setIsStoreOpened={setIsStoreOpened}
        />
        <div className="form-buttons">
          <FormButtons
            handleDecline={handleDecline}
            handleDelete={handleDelete}
            handleConfirm={handleConfirm}
          />
        </div>
      </StyledListActivity>
    )
  );
};

export default ListActivity;
