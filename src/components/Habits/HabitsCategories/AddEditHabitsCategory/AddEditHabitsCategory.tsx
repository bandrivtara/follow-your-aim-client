import { Form, Input, Button, Transfer } from "antd";
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

const formInitialValues = {
  title: "",
  description: "",
};

const AddEditHabitsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { habitsCategoryId } = useParams();
  const [updateHabitsCategory] = useUpdateHabitsCategoryMutation();
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
      <Form.Item label="Пов’язані звички">
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
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit">
          {habitsCategoryId ? "Записати зміни" : "Додати категорію"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditHabitsCategory;
