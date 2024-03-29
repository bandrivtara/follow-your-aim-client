import { Form, Input, Button, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddTaskGroupMutation,
  useGetTaskGroupQuery,
  useUpdateTaskGroupMutation,
} from "store/services/taskGroups";
import routes from "config/routes";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { ITaskGroups } from "types/taskGroups";
import TaskGroupsStore from "../TaskGroupsStore/TaskGroupsStore";

const formInitialValues = {
  title: "",
  description: "",
};

const AddEditTaskGroup = () => {
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

  const onFinish = async (newTaskGroupData: ITaskGroups) => {
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

    navigate(routes.taskGroups.list);
    navigate(0);
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

      <Form.Item name="description" label="Опис">
        <TextArea rows={2} />
      </Form.Item>

      <Card>
        <TaskGroupsStore form={form} />
      </Card>

      <Form.Item>
        <Button htmlType="submit">
          {taskGroupId ? "Записати зміни" : "Додати"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditTaskGroup;
