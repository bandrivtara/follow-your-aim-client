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
import { useEffect } from "react";
import {
  ClockCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { useWatch } from "antd/es/form/Form";
import StyledAddEditHabit from "./AddEditHabit.styled";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";
import _ from "lodash";
import { useGetSpheresListQuery } from "store/services/spheres";

const formInitialValues = {
  title: "",
  description: "",
  complexity: 5,
  valueType: "measures",
  measure: "хв",
  minToComplete: 0,
  scheduleTime: "",
  isHidden: false,
  habitsCategoryId: "",
  sphereId: "",
};

const AddEditHabit = () => {
  const [form] = Form.useForm();
  let { habitId } = useParams();
  const [addHabit] = useAddHabitMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const habitDetails = useGetHabitQuery(habitId);
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const spheres = useGetSpheresListQuery();

  const currentFields = useWatch("fields", form);

  useEffect(() => {
    form.setFieldsValue(habitDetails.data);
  }, [habitDetails, form, habitsCategories?.data]);

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
      await updateHabit(habitToUpdate).unwrap();
    } else {
      await addHabit(newHabitData);
    }

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
        <Form.Item label="Категорія" name="habitsCategoryId">
          <Select placeholder="Виберіть категорію">
            {habitsCategories.data &&
              habitsCategories.data.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.title}
                </Select.Option>
              ))}
            <Select.Option key={"no-category"} value={""}>
              Без категорії
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Сфера" name="sphereId">
          <Select placeholder="Виберіть сферу">
            {spheres.data &&
              spheres.data.map((sphere) => (
                <Select.Option key={sphere.id} value={sphere.id}>
                  {sphere.title}
                </Select.Option>
              ))}
            <Select.Option key={"no-sphere"} value={""}>
              Без сфери
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="scheduleTime" label="Запланований час">
          <Cascader
            suffixIcon={<ClockCircleOutlined rev={"value"} />}
            style={{ width: "100px" }}
            options={getTimeOptions(5)}
          />
        </Form.Item>

        <Form.Item name="type" initialValue="habit" />
        <Form.Item rules={[{ required: true }]} name="valueType" label="Тип">
          <Radio.Group defaultValue="measures">
            <Radio.Button value="measures">Вимірювальна</Radio.Button>
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
            if (getFieldValue("valueType") === "measures") {
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
