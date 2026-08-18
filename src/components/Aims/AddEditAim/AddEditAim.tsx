import {
  Alert,
  Form,
  Input,
  Button,
  Slider,
  DatePicker,
  Select,
  Radio,
  Cascader,
  InputNumber,
  Spin,
  Switch,
} from "antd";
import {
  AimOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  LinkOutlined,
  SaveOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddAimMutation,
  useGetAimQuery,
  useUpdateAimMutation,
} from "store/services/aims";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { IAim } from "types/aims.types";
import dayjs from "dayjs";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import { DefaultOptionType } from "antd/es/select";
import { useGetHabitListQuery } from "store/services/habits";
import { useWatch } from "antd/es/form/Form";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import StyledAddEditAim from "./AddEditAim.styled";

interface ICascaderOption {
  value: string;
  label: string;
  children?: ICascaderOption[];
  disabled?: boolean;
}

const formInitialValues: IAim = {
  title: "",
  description: "",
  dateFrom: "",
  dateTo: "",
  aimsCategoryId: "",
  progress: 0,
  complexity: 1,
  value: "",
  id: "",
  aimType: "number",
  isRelatedWithHabit: false,
  finalAim: 0,
  startedPoint: 0,
  calculationType: "sum",
  relatedHabit: [],
  relatedList: [],
};

const AddEditAim = () => {
  const navigate = useNavigate();
  const habitsList = useGetHabitListQuery();
  const tasksGroup = useGetTaskGroupListQuery();
  const [form] = Form.useForm();
  let { aimId } = useParams();
  const [addAim, { isLoading: isAdding }] = useAddAimMutation();
  const [updateAim, { isLoading: isUpdating }] = useUpdateAimMutation();
  const aimDetails = useGetAimQuery(aimId, { skip: !aimId });
  const aimsCategories = useGetAimsCategoriesListQuery();
  const relatedHabit = useWatch("relatedHabit", form);
  useWatch("relatedList", form);

  const convertToArray = (obj: any) => {
    const resultArray: any[] = [];

    Object.keys(obj).forEach((key) => {
      const index = parseInt(key, 10);
      resultArray[index] = obj[key];
    });

    return resultArray;
  };

  const convertToObject = (arr: any[]) => {
    const resultObject: any = {};

    arr.forEach((innerArray, index: number) => {
      resultObject[index] = innerArray;
    });

    return resultObject;
  };

  useEffect(() => {
    if (aimDetails) {
      if (aimDetails.data && aimDetails.data) {
        const aimData = {
          ...aimDetails.data,
          dateFrom: dayjs(aimDetails.data.dateFrom),
          dateTo: dayjs(aimDetails.data.dateTo),
        };
        if (aimDetails.data.relatedList) {
          aimData.relatedList = convertToArray(aimDetails.data.relatedList);
        }

        form.setFieldsValue(aimData);
      }
    }
  }, [aimDetails, form]);

  const onFinish = async (newAimData: IAim) => {
    const data = {
      ...newAimData,
      dateFrom: dayjs(newAimData.dateFrom).format("YYYY/MM/DD"),
      dateTo: dayjs(newAimData.dateTo).format("YYYY/MM/DD"),
    };
    if (Array.isArray(newAimData.relatedList)) {
      data.relatedList = convertToObject(newAimData.relatedList);
    }

    if (aimId) {
      const aimToUpdate = {
        id: aimId,
        data,
        path: "",
      };
      await updateAim(aimToUpdate).unwrap();
    } else {
      await addAim(data).unwrap();
    }

    navigate(-1);
  };

  const getRelatedHabits = () => {
    if (!habitsList.data) return [];
    const options: ICascaderOption[] = habitsList.data.map((habit) => {
      const habitOption: ICascaderOption = {
        value: habit.id,
        label: habit.title,
      };
      if (habit.valueType === "measures" && habit.fields) {
        habitOption.children = habit.fields.map((habitField) => ({
          value: habitField.id,
          label: habitField.name,
        }));
      }
      return habitOption;
    });

    return options;
  };

  const getRelatedLists = () => {
    if (!tasksGroup.data) return [];

    const options: ICascaderOption[] = tasksGroup.data.map((taskGroup) => {
      const tasksOption: ICascaderOption = {
        value: taskGroup.id,
        label: taskGroup.title,
      };
      if (taskGroup?.tasksStages) {
        tasksOption.children = taskGroup.tasksStages.map((taskStage) => ({
          value: taskStage.id,
          label: taskStage.title,
        }));
      }
      return tasksOption;
    });

    return options;
  };

  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1,
    );

  return (
    <StyledAddEditAim>
      <header className="page-header">
        <div>
          <span className="page-kicker">Цілі</span>
          <h1 className="page-title">
            {aimId ? "Редагувати ціль" : "Нова ціль"}
          </h1>
          <p className="page-subtitle">
            Сформулюй результат, задай період і вибери спосіб, яким прогрес буде
            відображатися у календарі.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>

      {aimDetails.isError && (
        <Alert
          className="load-error"
          type="error"
          showIcon
          message="Не вдалося завантажити ціль"
          action={
            <Button size="small" onClick={() => aimDetails.refetch()}>
              Спробувати ще раз
            </Button>
          }
        />
      )}

      <Spin spinning={aimDetails.isFetching}>
        <div className="aim-form-card">
          <Form
            className="aim-form"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={formInitialValues}
          >
            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon">
                  <AimOutlined />
                </span>
                <div>
                  <h2>Основна інформація</h2>
                  <p>Опиши конкретний результат, якого хочеш досягти.</p>
                </div>
              </div>

              <Form.Item
                rules={[{ required: true, message: "Вкажи назву цілі" }]}
                name="title"
                label="Назва"
              >
                <Input size="large" placeholder="Наприклад, знизити вагу до 94 кг" />
              </Form.Item>

              <Form.Item name="description" label="Опис">
                <TextArea
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder="Навіщо ця ціль важлива і що означатиме її виконання?"
                />
              </Form.Item>

              <div className="field-grid">
                <Form.Item label="Категорія" name="aimsCategoryId">
                  <Select
                    size="large"
                    loading={aimsCategories.isFetching}
                    placeholder="Вибери категорію"
                  >
                    {aimsCategories.data?.map((aim) => (
                      <Select.Option key={aim.id} value={aim.id}>
                        {aim.title}
                      </Select.Option>
                    ))}
                    <Select.Option key="no-category" value="">
                      Без категорії
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  className="complexity-field"
                  rules={[{ required: true }]}
                  name="complexity"
                  label="Складність"
                  extra="1 — майже без зусиль, 10 — максимальне навантаження"
                >
                  <Slider min={1} max={10} marks={{ 1: "1", 5: "5", 10: "10" }} />
                </Form.Item>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon">
                  <CalendarOutlined />
                </span>
                <div>
                  <h2>Період цілі</h2>
                  <p>Дати визначають положення цілі на roadmap.</p>
                </div>
              </div>

              <div className="field-grid">
                <Form.Item name="dateFrom" label="Початок">
                  <DatePicker size="large" placeholder="Обери дату" />
                </Form.Item>
                <Form.Item name="dateTo" label="Завершення">
                  <DatePicker size="large" placeholder="Обери дату" />
                </Form.Item>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon">
                  <SlidersOutlined />
                </span>
                <div>
                  <h2>Спосіб вимірювання</h2>
                  <p>Вибери формат прогресу, який відповідає цій цілі.</p>
                </div>
              </div>

              <Form.Item
                rules={[{ required: true }]}
                name="aimType"
                label="Тип цілі"
              >
                <Radio.Group className="goal-type-group">
                  <Radio.Button value="number">Вимірювана</Radio.Button>
                  <Radio.Button value="boolean">Проста — так/ні</Radio.Button>
                  <Radio.Button value="list">Список завдань</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.aimType !== currentValues.aimType
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("aimType") === "number" ? (
                    <div className="relationship-panel">
                      <div className="switch-row">
                        <div className="switch-copy">
                          <strong>Автоматично рахувати зі звички</strong>
                          <span>
                            Прогрес оновлюватиметься за вимірами вибраної звички.
                          </span>
                        </div>
                        <Form.Item
                          valuePropName="checked"
                          name="isRelatedWithHabit"
                          noStyle
                        >
                          <Switch aria-label="Автоматично рахувати прогрес зі звички" />
                        </Form.Item>
                      </div>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.isRelatedWithHabit !==
                          currentValues.isRelatedWithHabit
                        }
                      >
                        {({ getFieldValue: getNestedFieldValue }) =>
                          getNestedFieldValue("isRelatedWithHabit") ? (
                            <div className="relationship-fields">
                              <Form.Item name="relatedHabit" label="Пов’язана звичка">
                                <Cascader
                                  size="large"
                                  options={getRelatedHabits()}
                                  showSearch={{ filter }}
                                  placeholder="Вибери звичку або її поле"
                                />
                              </Form.Item>
                              <Form.Item
                                name="calculationType"
                                label="Як рахувати значення"
                              >
                                <Radio.Group className="calculation-type-group">
                                  <Radio.Button value="sum">Сума всіх значень</Radio.Button>
                                  <Radio.Button value="lastMeasureAsc">
                                    Останнє значення — зростання
                                  </Radio.Button>
                                  <Radio.Button value="lastMeasureDesc">
                                    Останнє значення — зменшення
                                  </Radio.Button>
                                </Radio.Group>
                              </Form.Item>
                            </div>
                          ) : null
                        }
                      </Form.Item>
                    </div>
                  ) : null
                }
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.aimType !== currentValues.aimType
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("aimType") === "list" ? (
                    <div className="relationship-panel">
                      <div className="section-heading">
                        <span className="section-icon">
                          <LinkOutlined />
                        </span>
                        <div>
                          <h2>Пов’язаний список</h2>
                          <p>Виконання вибраних справ формуватиме прогрес цілі.</p>
                        </div>
                      </div>
                      <Form.Item name="relatedList" label="Групи або етапи завдань">
                        <Cascader
                          multiple
                          size="large"
                          options={getRelatedLists()}
                          showSearch={{ filter }}
                          placeholder="Вибери список завдань"
                        />
                      </Form.Item>
                    </div>
                  ) : null
                }
              </Form.Item>
            </section>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.calculationType !== currentValues.calculationType ||
                prevValues.aimType !== currentValues.aimType ||
                prevValues.isRelatedWithHabit !== currentValues.isRelatedWithHabit
              }
            >
              {({ getFieldValue }) => {
                if (getFieldValue("aimType") !== "number") return null;

                const usesLastMeasurement =
                  getFieldValue("isRelatedWithHabit") &&
                  (getFieldValue("calculationType") === "lastMeasureAsc" ||
                    getFieldValue("calculationType") === "lastMeasureDesc");

                return (
                  <section className="form-section">
                    <div className="section-heading">
                      <span className="section-icon">
                        <AimOutlined />
                      </span>
                      <div>
                        <h2>Цільове значення</h2>
                        <p>Вкажи числову межу, до якої потрібно дійти.</p>
                      </div>
                    </div>

                    <div className={usesLastMeasurement ? "field-grid" : undefined}>
                      {usesLastMeasurement && (
                        <Form.Item name="startedPoint" label="Початкове значення">
                          <InputNumber
                            size="large"
                            addonAfter={
                              relatedHabit
                                ? habitsList.data
                                    ?.find((habit) => relatedHabit[0] === habit.id)
                                    ?.fields?.find(
                                      (field) => field.id === relatedHabit[1],
                                    )?.unit
                                : ""
                            }
                          />
                        </Form.Item>
                      )}

                      <Form.Item
                        rules={[{ required: true, message: "Вкажи цільове значення" }]}
                        name="finalAim"
                        label="Кінцеве значення"
                      >
                        <InputNumber
                          size="large"
                          addonAfter={
                            relatedHabit
                              ? habitsList.data
                                  ?.find((habit) => relatedHabit[0] === habit.id)
                                  ?.fields?.find(
                                    (field) => field.id === relatedHabit[1],
                                  )?.unit
                              : ""
                          }
                        />
                      </Form.Item>
                    </div>
                  </section>
                );
              }}
            </Form.Item>

            <div className="form-actions">
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isAdding || isUpdating}
              >
                {aimId ? "Зберегти зміни" : "Додати ціль"}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </StyledAddEditAim>
  );
};

export default AddEditAim;
