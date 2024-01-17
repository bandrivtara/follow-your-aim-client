import {
  Form,
  Input,
  Button,
  Select,
  Slider,
  InputNumber,
  Cascader,
  Switch,
  Radio,
  Space,
  FormListFieldData,
} from "antd";
import uniqid from "uniqid";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddHabitMutation,
  useGetHabitQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import { IHabitData } from "types/habits.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import {
  ClockCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import {
  useGetCategoriesListQuery,
  useUpdateCategoryMutation,
} from "store/services/categories";
import { ICategory } from "types/categories.types";
import { useWatch } from "antd/es/form/Form";
import StyledAddEditHabit from "./AddEditHabit.styled";

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
  const currentFields = useWatch("fields", form);

  useEffect(() => {
    if (habitDetails.data) {
      form.setFieldsValue(habitDetails.data);
    }
  }, [habitDetails, form]);

  useEffect(() => {
    if (categoriesData && categoriesData.data) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 20, offset: 4 },
    },
  };

  const onFinish = async (newHabitData: IHabitData) => {
    if (habitId) {
      const habitToUpdate = {
        id: habitId,
        data: newHabitData,
      };
      console.log(habitToUpdate);
      await updateHabit(habitToUpdate).unwrap();
    } else {
      await addHabit(newHabitData);
    }
    // if (newHabitData.category) {
    //   await Promise.all(
    //     newHabitData.category.map(async (category) => {
    //       const currentCategoryData = categories.find(
    //         (sphere) => sphere.id === category
    //       );
    //       if (
    //         habitId &&
    //         currentCategoryData?.relatedHabits &&
    //         !currentCategoryData?.relatedHabits.includes(habitId)
    //       ) {
    //         const sphereToUpdate = {
    //           id: newHabitData.category,
    //           data: {
    //             ...currentCategoryData,
    //             relatedHabits: [...currentCategoryData?.relatedHabits, habitId],
    //           },
    //           path: "",
    //         };
    //         await updateCategory(sphereToUpdate);
    //       }
    //     })
    //   );
    // }

    // navigate(routes.habit.list);
    // navigate(0);
  };

  const setAsMainField = (field: FormListFieldData) => {
    const replaceItem = currentFields.splice(field.name, 1);
    form.setFieldValue("fields", [...replaceItem, ...currentFields]);
  };

  return (
    <StyledAddEditHabit>
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
        <Form.Item
          rules={[{ required: true }]}
          name="category"
          label="Категорія"
        >
          <Select mode="multiple" placeholder="Виберіть категорію">
            {categories.map((sphere) => (
              <Select.Option value={sphere.id}>{sphere.title}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="scheduleTime" label="Запланований час">
          <Cascader
            suffixIcon={<ClockCircleOutlined rev={"value"} />}
            style={{ width: "100px" }}
            options={getTimeOptions(5)}
          />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} name="valueType" label="Тип">
          <Radio.Group defaultValue="number">
            <Radio.Button value="number">Вимірювальна</Radio.Button>
            <Radio.Button value="boolean">Проста (Так/Ні)</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.valueType !== currentValues.valueType
          }
        >
          {({ getFieldValue }) => {
            if (getFieldValue("valueType") === "number") {
              return (
                <Form.List name="fields">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Form.Item
                          className={index === 0 ? "main-field" : ""}
                          {...formItemLayoutWithOutLabel}
                          label={index === 0 ? "Головне:" : `${index + 1}:`}
                          key={field.key}
                        >
                          <Form.Item
                            noStyle
                            name={[field.name, "orderIndex"]}
                            initialValue={field.key}
                          />
                          <Form.Item
                            noStyle
                            name={[field.name, "id"]}
                            initialValue={uniqid()}
                          />
                          <Space.Compact>
                            <Form.Item name={[`${field.name}`, "name"]} noStyle>
                              <Input
                                placeholder="Назва"
                                style={{ width: "80%" }}
                              />
                            </Form.Item>
                            <Form.Item name={[field.name, "unit"]} noStyle>
                              <Input
                                placeholder="Одиниця"
                                style={{ width: "80%" }}
                              />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, "minToComplete"]}
                              noStyle
                            >
                              <InputNumber
                                placeholder="Мінімум"
                                style={{ width: "60%" }}
                              />
                            </Form.Item>

                            <Button
                              type="dashed"
                              disabled={index === 0}
                              onClick={() => setAsMainField(field)}
                            >
                              <UpCircleOutlined />
                            </Button>
                            {fields.length > 1 ? (
                              <Button
                                danger
                                type="dashed"
                                onClick={() => remove(field.name)}
                              >
                                <MinusCircleOutlined className="dynamic-delete-button" />
                              </Button>
                            ) : null}
                          </Space.Compact>
                        </Form.Item>
                      ))}

                      <Form.Item {...formItemLayoutWithOutLabel}>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          style={{ width: "100%" }}
                          icon={<PlusOutlined />}
                          disabled={fields.length > 3}
                        >
                          Додати поле
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
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
    </StyledAddEditHabit>
  );
};

export default AddEditHabit;