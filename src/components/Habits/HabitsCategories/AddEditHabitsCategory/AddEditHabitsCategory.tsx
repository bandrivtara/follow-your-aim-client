import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddHabitsCategoryMutation,
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

const formInitialValues = {
  title: "",
  description: "",
  relatedHabits: [],
  relatedAims: [],
};

const AddEditHabitsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { habitsCategoryId } = useParams();
  const [addHabitsCategory] = useAddHabitsCategoryMutation();
  const [updateHabitsCategory] = useUpdateHabitsCategoryMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const habitsCategoryDetails = useGetHabitsCategoryQuery(habitsCategoryId);
  const habitData = useGetHabitListQuery();

  const [currentHabitsKeys, setCurrentHabitsKeys] = useState<string[]>([]);
  const [selectedHabitsKeys, setSelectedHabitsKeys] = useState<string[]>([]);
  const [notSelectedHabits, setNotSelectedHabits] = useState<any[]>([]);

  useEffect(() => {
    if (habitsCategoryDetails && habitData.data) {
      if (habitsCategoryDetails.data && habitsCategoryDetails.data) {
        form.setFieldsValue(habitsCategoryDetails.data);

        const relatedHabits = habitData.data
          .filter((habit) => habit.habitsCategoryId === habitsCategoryId)
          .map((habit) => habit.id);

        const allHabits = [];
        for (let i = 0; i < habitData?.data?.length; i++) {
          const data = {
            key: habitData?.data[i].id,
            title: habitData?.data[i].title,
          };

          allHabits.push(data);
        }

        setNotSelectedHabits(allHabits);
        setCurrentHabitsKeys(relatedHabits);
      }
    }
  }, [habitsCategoryDetails, form, habitData.data, habitsCategoryId]);

  const onHabitsTransferChange = (nextTargetKeys: string[]) => {
    setCurrentHabitsKeys(nextTargetKeys);
  };

  const onHabitsTransferSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedHabitsKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onFinish = async (newHabitsCategoryData: IHabitsCategory) => {
    console.log(currentHabitsKeys);
    await Promise.all(
      currentHabitsKeys.map(async (habitId) => {
        const habitToUpdate = {
          id: habitId,
          data: { habitsCategoryId },
          path: "",
        };
        await updateHabit(habitToUpdate);
      })
    );

    if (habitsCategoryId) {
      const habitsCategoryToUpdate = {
        id: habitsCategoryId,
        data: newHabitsCategoryData,
        path: "",
      };
      console.log(newHabitsCategoryData);
      await updateHabitsCategory(habitsCategoryToUpdate).unwrap();
    } else {
      console.log(newHabitsCategoryData, 333);
      await addHabitsCategory(newHabitsCategoryData);
    }

    // navigate(routes.habit.categories.list);
    // navigate(0);
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

      <Form.Item label="Повязані активності">
        <Transfer
          dataSource={notSelectedHabits}
          titles={["Source", "Target"]}
          targetKeys={currentHabitsKeys}
          selectedKeys={selectedHabitsKeys}
          onChange={onHabitsTransferChange}
          onSelectChange={onHabitsTransferSelectChange}
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
