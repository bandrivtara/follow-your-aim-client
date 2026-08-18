import { Alert, Button, Form, Input, Spin, Transfer } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetHabitsCategoryQuery,
  useUpdateHabitsCategoryMutation,
} from "store/services/habitsCategories";
import { IHabitsCategory } from "types/habitsCategories.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import {
  useGetHabitListQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import uniqid from "uniqid";
import { getRelationshipUpdates } from "share/functions/getRelationshipUpdates";
import StyledEntityFormPage from "share/components/Form/EntityFormPage.styled";

const formInitialValues = {
  title: "",
  description: "",
};

const AddEditHabitsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { habitsCategoryId } = useParams();
  const [updateHabitsCategory, { isLoading: isSavingCategory }] =
    useUpdateHabitsCategoryMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const habitsCategoryDetails = useGetHabitsCategoryQuery(habitsCategoryId, {
    skip: !habitsCategoryId,
  });
  const habitData = useGetHabitListQuery();

  const [currentHabitsKeys, setCurrentHabitsKeys] = useState<string[]>([]);
  const [selectedHabitsKeys, setSelectedHabitsKeys] = useState<string[]>([]);
  const [habitsTransferItems, setHabitsTransferItems] = useState<any[]>([]);

  useEffect(() => {
    if (!habitData.data) return;
    setCurrentHabitsKeys(
      habitData.data
        .filter((habit) => habit.habitsCategoryId === habitsCategoryId)
        .map((habit) => habit.id),
    );
    setHabitsTransferItems(
      habitData.data.map((habit) => ({ key: habit.id, title: habit.title })),
    );
  }, [habitData.data, habitsCategoryId]);

  useEffect(() => {
    if (habitsCategoryDetails.data) {
      form.setFieldsValue(habitsCategoryDetails.data);
    }
  }, [form, habitsCategoryDetails.data]);

  const onFinish = async (newHabitsCategoryData: IHabitsCategory) => {
    const currentId = habitsCategoryId || uniqid();
    const previousHabitIds =
      habitData.data
        ?.filter((habit) => habit.habitsCategoryId === habitsCategoryId)
        .map((habit) => habit.id) || [];

    await updateHabitsCategory({
      id: currentId,
      data: newHabitsCategoryData,
    }).unwrap();
    await Promise.all(
      getRelationshipUpdates(
        previousHabitIds,
        currentHabitsKeys,
        currentId,
      ).map(({ id, relationId }) =>
        updateHabit({ id, data: { habitsCategoryId: relationId } }).unwrap(),
      ),
    );

    navigate(-1);
  };

  return (
    <StyledEntityFormPage>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {habitsCategoryId
              ? "Редагувати категорію звичок"
              : "Нова категорія звичок"}
          </h1>
          <p className="page-subtitle">
            Організуй звички за контекстом або частиною щоденної рутини.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>

      {habitsCategoryDetails.isError && (
        <Alert
          className="load-error"
          type="error"
          showIcon
          message="Не вдалося завантажити категорію"
          action={
            <Button size="small" onClick={() => habitsCategoryDetails.refetch()}>
              Повторити
            </Button>
          }
        />
      )}

      <Spin spinning={habitsCategoryDetails.isFetching || habitData.isFetching}>
        <div className="entity-form-card">
          <Form
            className="entity-form"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={formInitialValues}
          >
            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon"><FolderOpenOutlined /></span>
                <div>
                  <h2>Основна інформація</h2>
                  <p>Назва має швидко пояснювати, які звички тут зібрані.</p>
                </div>
              </div>
              <Form.Item
                rules={[{ required: true, message: "Вкажи назву категорії" }]}
                name="title"
                label="Назва"
              >
                <Input size="large" placeholder="Наприклад, Ранкова рутина" />
              </Form.Item>
              <Form.Item name="description" label="Опис">
                <TextArea rows={3} maxLength={400} showCount />
              </Form.Item>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon"><LinkOutlined /></span>
                <div>
                  <h2>Пов’язані звички</h2>
                  <p>Перемісти до правого списку звички цієї категорії.</p>
                </div>
              </div>
              <div className="transfer-scroll">
                <Transfer
                  dataSource={habitsTransferItems}
                  titles={["Доступні", "Пов’язані"]}
                  targetKeys={currentHabitsKeys}
                  selectedKeys={selectedHabitsKeys}
                  onChange={(nextTargetKeys) =>
                    setCurrentHabitsKeys(nextTargetKeys as string[])
                  }
                  onSelectChange={(sourceKeys, targetKeys) =>
                    setSelectedHabitsKeys([...sourceKeys, ...targetKeys] as string[])
                  }
                  render={(item) => item.title}
                />
              </div>
            </section>

            <div className="form-actions">
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSavingCategory}
              >
                {habitsCategoryId ? "Зберегти зміни" : "Додати категорію"}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </StyledEntityFormPage>
  );
};

export default AddEditHabitsCategory;
