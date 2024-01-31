import { Form, Input, Button, Card, Switch } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddTaskGroupMutation,
  useGetTaskGroupQuery,
  useUpdateTaskGroupMutation,
} from "store/services/taskGroups";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { ITasksGroup } from "types/taskGroups";
import TasksGroupStore from "./TasksGroupStore/TasksGroupStore";
import TasksGroupStages from "./TasksGroupStages/TasksGroupStages";

const formInitialValues = {
  title: "",
  description: "",
  isDividedIntoStages: false,
};

const AddEditTasksGroup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { taskGroupId } = useParams();
  const [addTaskGroup] = useAddTaskGroupMutation();
  const [updateTaskGroup] = useUpdateTaskGroupMutation();
  const taskGroupDetails = useGetTaskGroupQuery(taskGroupId);

  useEffect(() => {
    if (taskGroupDetails) {
      if (taskGroupDetails.data && taskGroupDetails.data) {
        form.setFieldsValue(taskGroupDetails.data);
      }
    }
  }, [taskGroupDetails, form]);

  const onFinish = async (newTaskGroupData: ITasksGroup) => {
    if (taskGroupId) {
      const taskGroupToUpdate = {
        id: taskGroupId,
        data: newTaskGroupData,
        path: "",
      };

      await updateTaskGroup(taskGroupToUpdate).unwrap();
    } else {
      await addTaskGroup(newTaskGroupData);
    }

    navigate(-1);
  };

  return (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 14 }}
      layout="horizontal"
      style={{ maxWidth: 600, marginTop: 20 }}
      onFinish={onFinish}
      initialValues={formInitialValues}
    >
      <Form.Item rules={[{ required: true }]} name="title" label="Назва">
        <Input />
      </Form.Item>
      <Form.Item name="type" initialValue="tasksGroup" />
      <Form.Item name="valueType" initialValue="todoList" />
      <Form.Item name="description" label="Опис">
        <TextArea rows={2} />
      </Form.Item>

      <Card title="Сховище завдань">
        <TasksGroupStore form={form} />
      </Card>

      <Form.Item
        valuePropName="checked"
        name="isDividedIntoStages"
        label="Розділити на етапи"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.isDividedIntoStages !== currentValues.isDividedIntoStages
        }
      >
        {({ getFieldValue }) => {
          if (getFieldValue("isDividedIntoStages")) {
            return (
              <Card title="Етапи завдань">
                <TasksGroupStages form={form} />
              </Card>
            );
          }
        }}
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {taskGroupId ? "Записати зміни" : "Додати"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditTasksGroup;
