import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button,
  Cascader,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Space,
} from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import {
  BorderOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseSquareOutlined,
  DeleteOutlined,
  LinkOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { useWatch } from "antd/es/form/Form";

interface IProps {
  data?: IDayCellEditor;
  colDef: ColDef<IDayCellEditor>;
  form: FormInstance;
}

interface ITask {
  title: string;
  description?: string;
  link?: string;
  status: "pending" | "failed" | "done";
  time?: string[];
  isEditOn?: boolean;
}

const initTask: ITask = {
  title: "",
  status: "pending",
  time: [],
  description: "",
  link: "",
  isEditOn: false,
};

const ListActivity = ({ data, form, colDef }: IProps) => {
  const formTasks: ITask[] = useWatch("tasks", form);
  const [editFiledIndex, setEditFiledIndex] = useState<null | number>(null);

  useEffect(() => {
    if (formTasks && formTasks[0]) {
      const doneTaskCount = formTasks.filter(
        (task) => task && task.status === "done"
      ).length;

      form.setFieldsValue({
        value: `${doneTaskCount}/${formTasks.length}`,
      });
    }
  }, [form, formTasks]);

  const getTimeOptions = useCallback(() => {
    const hours = 24;
    const options = [];
    const minutes = ["00", "15", "30", "45"];

    for (let hour = 0; hour < hours; hour++) {
      const hoverObject = {
        value: hour.toString(),
        label: hour.toString(),
        children: minutes.map((minute) => ({ value: minute, label: minute })),
      };
      options.push(hoverObject);
    }

    return options;
  }, []);

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

  return (
    <div
      style={{
        maxHeight: "400px",
        overflowY: "auto",
        overflowX: "hidden",
        paddingLeft: "4px",
      }}
    >
      <Form.Item hidden name="value" noStyle></Form.Item>

      <Form.List name="tasks" initialValue={[initTask]}>
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
                      initialValue={initTask.title}
                    >
                      <Input placeholder="Назва завдання" />
                    </Form.Item>
                  </Col>
                  <Col flex="auto">
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
                  <Col flex="auto">
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
                      initialValue={initTask.time}
                      hidden={!isTaskFieldVisible(index, "time")}
                      noStyle
                    >
                      <Cascader
                        suffixIcon={<ClockCircleOutlined rev={"value"} />}
                        style={{ width: "100px" }}
                        options={getTimeOptions()}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex="auto">
                    <Form.Item
                      required={false}
                      name={[index, "link"]}
                      initialValue={initTask.link}
                      hidden={!isTaskFieldVisible(index, "link")}
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
                      initialValue={initTask.description}
                      name={[index, "description"]}
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
  );
};

export default ListActivity;
