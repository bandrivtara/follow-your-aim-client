import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, message, Spin, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddTaskGroupMutation,
  useGetTaskGroupQuery,
  useUpdateTaskGroupMutation,
} from "store/services/taskGroups";
import { ITasksGroup } from "types/taskGroups";
import StyledAddEditTasksGroup from "./AddEditTasksGroup.styled";
import TasksGroupStages from "./TasksGroupStages/TasksGroupStages";
import TasksGroupStore from "./TasksGroupStore/TasksGroupStore";

const formInitialValues = {
  title: "",
  description: "",
  isDividedIntoStages: false,
};

const AddEditTasksGroup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { taskGroupId } = useParams();
  const [addTaskGroup, { isLoading: isAdding }] = useAddTaskGroupMutation();
  const [updateTaskGroup, { isLoading: isUpdating }] =
    useUpdateTaskGroupMutation();
  const taskGroupDetails = useGetTaskGroupQuery(taskGroupId, {
    skip: !taskGroupId,
  });

  useEffect(() => {
    if (taskGroupDetails.data) {
      form.setFieldsValue(taskGroupDetails.data);
    }
  }, [taskGroupDetails.data, form]);

  const onFinish = async (newTaskGroupData: ITasksGroup) => {
    try {
      if (taskGroupId) {
        await updateTaskGroup({
          id: taskGroupId,
          data: newTaskGroupData,
          path: "",
        }).unwrap();
      } else {
        await addTaskGroup(newTaskGroupData).unwrap();
      }

      message.success(
        taskGroupId ? "Зміни збережено" : "Групу завдань додано",
      );
      navigate(-1);
    } catch {
      message.error("Не вдалося зберегти групу завдань");
    }
  };

  return (
    <StyledAddEditTasksGroup>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {taskGroupId ? "Редагувати групу завдань" : "Нова група завдань"}
          </h1>
          <p className="page-subtitle">
            Збери пов’язані справи в один список і, за потреби, розділи їх на
            послідовні етапи.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>

      {taskGroupDetails.isError && (
        <Alert
          className="load-error"
          type="error"
          showIcon
          message="Не вдалося завантажити групу завдань"
          action={
            <Button size="small" onClick={() => taskGroupDetails.refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      )}

      <Spin spinning={taskGroupDetails.isFetching}>
        <div className="task-group-form-card surface-card">
          <Form
            className="task-group-form"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={formInitialValues}
          >
            <section className="form-section general-section">
              <div className="section-heading">
                <span className="section-icon">
                  <UnorderedListOutlined />
                </span>
                <div>
                  <h2>Основна інформація</h2>
                  <p>Назва допоможе швидко знайти цю групу у щоденному плані.</p>
                </div>
              </div>

              <Form.Item
                rules={[
                  { required: true, message: "Вкажи назву групи завдань" },
                ]}
                name="title"
                label="Назва"
              >
                <Input
                  size="large"
                  placeholder="Наприклад, Підготовка подорожі"
                />
              </Form.Item>
              <Form.Item name="type" initialValue="tasksGroup" hidden />
              <Form.Item name="valueType" initialValue="todoList" hidden />
              <Form.Item name="description" label="Опис">
                <TextArea
                  rows={3}
                  placeholder="Коротко опиши результат або контекст цієї групи"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </section>

            <Card
              className="section-card tasks-store-card"
              title={
                <div className="card-heading">
                  <UnorderedListOutlined />
                  <div>
                    <strong>Список справ</strong>
                    <span>Додай конкретні дії, які входять до цієї групи.</span>
                  </div>
                </div>
              }
            >
              <TasksGroupStore form={form} />
            </Card>

            <div className="stages-toggle">
              <div className="stage-copy">
                <span className="section-icon stage-icon">
                  <ApartmentOutlined />
                </span>
                <div>
                  <strong>Розділити на етапи</strong>
                  <span>
                    Увімкни для великих проєктів, де важлива послідовність.
                  </span>
                </div>
              </div>
              <Form.Item
                valuePropName="checked"
                name="isDividedIntoStages"
                noStyle
              >
                <Switch aria-label="Розділити групу завдань на етапи" />
              </Form.Item>
            </div>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isDividedIntoStages !==
                currentValues.isDividedIntoStages
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("isDividedIntoStages") ? (
                  <Card
                    className="section-card stages-card"
                    title={
                      <div className="card-heading">
                        <ApartmentOutlined />
                        <div>
                          <strong>Етапи виконання</strong>
                          <span>Структуруй великий результат на менші кроки.</span>
                        </div>
                      </div>
                    }
                  >
                    <TasksGroupStages form={form} />
                  </Card>
                ) : null
              }
            </Form.Item>

            <div className="form-actions">
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isAdding || isUpdating}
              >
                {taskGroupId ? "Зберегти зміни" : "Додати групу"}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </StyledAddEditTasksGroup>
  );
};

export default AddEditTasksGroup;
