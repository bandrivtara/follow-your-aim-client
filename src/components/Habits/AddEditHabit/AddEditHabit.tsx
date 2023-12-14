import {
  Form,
  Input,
  Button,
  Select,
  Slider,
  InputNumber,
  Cascader,
  AutoComplete,
  Switch,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddHabitMutation,
  useGetHabitQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import { IHabitData } from "types/habits.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import {
  useGetCategoriesListQuery,
  useUpdateCategoryMutation,
} from "store/services/categories";
import { ICategory } from "types/categories.types";
import routes from "config/routes";

const formInitialValues = {
  title: "",
  description: "",
  complexity: 5,
  valueType: "number",
  measure: "хв",
  minToComplete: 0,
  scheduleTime: "",
  isHidden: false,
};

const AddEditHabit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { habitId } = useParams();
  const [addHabit] = useAddHabitMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const habitDetails = useGetHabitQuery(habitId);
  const categoriesData = useGetCategoriesListQuery();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [updateCategory] = useUpdateCategoryMutation();

  useEffect(() => {
    if (habitDetails) {
      if (habitDetails.data && habitDetails.data) {
        form.setFieldsValue(habitDetails.data);
      }
    }
  }, [habitDetails, form]);

  useEffect(() => {
    if (categoriesData && categoriesData.data) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  const onFinish = async (newHabitData: IHabitData) => {
    if (habitId) {
      const habitToUpdate = {
        id: habitId,
        data: newHabitData,
        path: "details",
      };
      await updateHabit(habitToUpdate).unwrap();
    } else {
      await addHabit(newHabitData);
    }
    if (newHabitData.category) {
      await Promise.all(
        newHabitData.category.map(async (category) => {
          const currentCategoryData = categories.find(
            (sphere) => sphere.id === category
          );
          console.log(newHabitData.category);
          if (
            habitId &&
            currentCategoryData?.relatedHabits &&
            !currentCategoryData?.relatedHabits.includes(habitId)
          ) {
            const sphereToUpdate = {
              id: newHabitData.category,
              data: {
                ...currentCategoryData,
                relatedHabits: [...currentCategoryData?.relatedHabits, habitId],
              },
              path: "",
            };
            await updateCategory(sphereToUpdate);
          }
        })
      );
    }

    // navigate(routes.habit.list);
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
      <Form.Item
        rules={[{ required: true }]}
        name="complexity"
        label="Складність"
      >
        <Slider min={1} max={10} />
      </Form.Item>
      <Form.Item rules={[{ required: true }]} name="category" label="Категорія">
        <Select mode="multiple" placeholder="Виберіть категорію">
          {categories.map((sphere) => (
            <Select.Option value={sphere.id}>{sphere.title}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        rules={[{ required: true }]}
        name="valueType"
        label="Тип звички"
      >
        <AutoComplete>
          <AutoComplete.Option value="number">Вимірювальна</AutoComplete.Option>
          <AutoComplete.Option value="boolean">
            Не вимірювальна
          </AutoComplete.Option>
          <AutoComplete.Option value="array">Список</AutoComplete.Option>
          <AutoComplete.Option value="duration">Тривала</AutoComplete.Option>
          <AutoComplete.Option value="time">Час</AutoComplete.Option>
        </AutoComplete>
      </Form.Item>
      <Form.Item name="scheduleTime" label="Запланований час">
        <Cascader
          suffixIcon={<ClockCircleOutlined rev={"value"} />}
          style={{ width: "100px" }}
          options={getTimeOptions(5)}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.valueType !== currentValues.valueType
        }
      >
        {({ getFieldValue }) => {
          switch (getFieldValue("valueType")) {
            case "number":
              return (
                <>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="measure"
                    label="Міра значення"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="minToComplete"
                    label="Мінімум для виконання"
                  >
                    <InputNumber />
                  </Form.Item>
                </>
              );
            case "specific":
              return (
                <>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="specificId"
                    label="Специфічний ID"
                  >
                    <Input />
                  </Form.Item>
                </>
              );
          }
        }}
      </Form.Item>

      <Form.Item label="Приховати" name="isHidden" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {habitId ? "Записати зміни" : "Додати звичку"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditHabit;
