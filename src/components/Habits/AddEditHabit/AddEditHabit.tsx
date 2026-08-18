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
  message,
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
  ArrowLeftOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { getTimeOptions } from "share/functions/getTimeOptions";
import { useWatch } from "antd/es/form/Form";
import StyledAddEditHabit from "./AddEditHabit.styled";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";
import { LIFE_AREAS } from "config/lifeAreas";

const formInitialValues = {
  title: "",
  description: "",
  complexity: 5,
  valueType: "measures",
  measure: "хв",
  minToComplete: 0,
  isAllDay: false,
  startTime: "",
  endTime: "",
  isHidden: false,
  habitsCategoryId: "",
  lifeArea: undefined,
};

const AddEditHabit = () => {
  const [form] = Form.useForm();
  let { habitId } = useParams();
  const [addHabit, { isLoading: isAdding }] = useAddHabitMutation();
  const [updateHabit, { isLoading: isUpdating }] = useUpdateHabitMutation();
  const habitDetails = useGetHabitQuery(habitId, { skip: !habitId });
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const navigate = useNavigate();

  const currentFields = useWatch("fields", form);

  useEffect(() => {
    form.setFieldsValue(habitDetails.data);
  }, [habitDetails, form, habitsCategories?.data]);

  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 16, offset: 7 },
    },
  };

  const onFinish = async (newHabitData: IHabitData) => {
    try {
      if (habitId) {
        const habitToUpdate = {
          id: habitId,
          data: newHabitData,
        };
        await updateHabit(habitToUpdate).unwrap();
      } else {
        await addHabit(newHabitData).unwrap();
      }

      message.success(habitId ? "Зміни збережено" : "Звичку додано");
      navigate(-1);
    } catch {
      message.error("Не вдалося зберегти звичку");
    }
  };

  const setAsMainField = (field: FormListFieldData) => {
    const replaceItem = currentFields.splice(field.name, 1);
    form.setFieldValue("fields", [...replaceItem, ...currentFields]);
  };

  return (
    <StyledAddEditHabit>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {habitId ? "Редагувати звичку" : "Нова звичка"}
          </h1>
          <p className="page-subtitle">
            Визнач назву, складність, контекст і зручний час виконання.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>
      <div className="habit-form-card surface-card">
        <Form
          className="habit-form"
          form={form}
          labelCol={{ xs: { span: 24 }, sm: { span: 7 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }}
          layout="horizontal"
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
            extra="1 — майже без зусиль, 10 — максимальне фізичне або розумове навантаження"
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
          <Form.Item label="Сфера життя" name="lifeArea">
            <Select allowClear placeholder="Виберіть сферу життя">
              {LIFE_AREAS.map((area) => (
                <Select.Option key={area.id} value={area.id}>
                  {area.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" initialValue="habit" hidden />
          <Form.Item rules={[{ required: true }]} name="valueType" label="Тип">
            <Radio.Group defaultValue="measures">
              <Radio.Button value="measures">Вимірювальна</Radio.Button>
              <Radio.Button value="boolean">Проста (Так/Ні)</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item valuePropName="checked" name="isAllDay" label="Цілий день">
            <Switch />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.isAllDay !== currentValues.isAllDay
            }
          >
            {({ getFieldValue }) => {
              if (!getFieldValue("isAllDay")) {
                return (
                  <>
                    <Form.Item name="startTime" label="Початок о:">
                      <Cascader
                        suffixIcon={<ClockCircleOutlined rev={"value"} />}
                        style={{ width: "100%" }}
                        options={getTimeOptions(5)}
                      />
                    </Form.Item>
                    <Form.Item name="endTime" label="Закінчення о:">
                      <Cascader
                        suffixIcon={<ClockCircleOutlined rev={"value"} />}
                        style={{ width: "100%" }}
                        options={getTimeOptions(5)}
                      />
                    </Form.Item>
                  </>
                );
              }
            }}
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
                              <Form.Item
                                name={[`${field.name}`, "name"]}
                                noStyle
                              >
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

          <Form.Item
            className="form-actions"
            wrapperCol={{ xs: { span: 24 }, sm: { span: 16, offset: 7 } }}
          >
            <Space wrap>
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isAdding || isUpdating}
              >
                {habitId ? "Зберегти зміни" : "Додати звичку"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </StyledAddEditHabit>
  );
};

export default AddEditHabit;
