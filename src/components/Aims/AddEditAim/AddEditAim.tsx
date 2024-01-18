import {
  Form,
  Input,
  Button,
  Slider,
  DatePicker,
  Select,
  Radio,
  Cascader,
  InputNumber,
} from "antd";
import { useParams } from "react-router-dom";
import {
  useAddAimMutation,
  useGetAimQuery,
  useUpdateAimMutation,
} from "store/services/aims";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { IAim } from "types/aims.types";
import dayjs from "dayjs";
import {
  useGetCategoriesListQuery,
  useUpdateCategoryMutation,
} from "store/services/spheres";
import { ICategory } from "types/spheres.types";
import { Switch } from "@mui/material";
import { DefaultOptionType } from "antd/es/select";
import { useGetHabitListQuery } from "store/services/habits";
import { useWatch } from "antd/es/form/Form";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";

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
  category: "",
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
  const habitsList = useGetHabitListQuery();
  const tasksGroup = useGetTaskGroupListQuery();
  const [form] = Form.useForm();
  let { aimId } = useParams();
  const [addAim] = useAddAimMutation();
  const [updateAim] = useUpdateAimMutation();
  const aimDetails = useGetAimQuery(aimId);
  const categoriesData = useGetCategoriesListQuery();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [updateCategory] = useUpdateCategoryMutation();
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

  useEffect(() => {
    if (categoriesData && categoriesData.data) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  const onFinish = async (newAimData: IAim) => {
    const data = {
      ...newAimData,
      dateFrom: dayjs(newAimData.dateFrom).format("YYYY/MM/DD"),
      dateTo: dayjs(newAimData.dateTo).format("YYYY/MM/DD"),
    };
    if (newAimData.relatedList) {
      data.relatedList = convertToObject(newAimData.relatedList);
    }

    if (aimId) {
      const aimToUpdate = {
        id: aimId,
        data,
        path: "",
      };
      console.log(newAimData, 123);
      await updateAim(aimToUpdate).unwrap();
    } else {
      await addAim(data);
      console.log(newAimData, 123);
    }

    // const currentCategoryData = categories.find(
    //   (sphere) => sphere.id === newAimData.category
    // );
    // if (
    //   aimId &&
    //   currentCategoryData?.relatedHabits &&
    //   !currentCategoryData?.relatedHabits.includes(aimId)
    // ) {
    //   const sphereToUpdate = {
    //     id: newAimData.category,
    //     data: {
    //       ...currentCategoryData,
    //       relatedHabits: [...currentCategoryData?.relatedHabits, aimId],
    //     },
    //     path: "",
    //   };
    //   console.log(sphereToUpdate);
    // await updateCategory(sphereToUpdate);
    // }

    // navigate(routes.aims.list);
    // navigate(0);
  };

  const getRelatedHabits = () => {
    console.log(habitsList);
    if (!habitsList.data) return [];
    const options: ICascaderOption[] = habitsList.data.map((habit) => {
      const habitOption: ICascaderOption = {
        value: habit.id,
        label: habit.title,
      };
      if (habit.valueType === "number" && habit.fields) {
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
    console.log(tasksGroup);
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
          .indexOf(inputValue.toLowerCase()) > -1
    );

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

      <Form.Item name="dateFrom" label="Починаючи з...">
        <DatePicker />
      </Form.Item>

      <Form.Item name="dateTo" label="До...">
        <DatePicker />
      </Form.Item>

      <Form.Item name="category" label="Категорія">
        <Select placeholder="Виберіть категорію">
          {categories.map((sphere) => (
            <Select.Option value={sphere.id}>{sphere.title}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item rules={[{ required: true }]} name="aimType" label="Тип">
        <Radio.Group defaultValue="number">
          <Radio.Button value="number">Вимірювальна</Radio.Button>
          <Radio.Button value="boolean">Проста (Так/Ні)</Radio.Button>
          <Radio.Button value="list">Список завдань</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.aimType !== currentValues.aimType
        }
      >
        {({ getFieldValue }) => {
          if (getFieldValue("aimType") === "number") {
            return (
              <Form.Item
                valuePropName="checked"
                name="isRelatedWithHabit"
                label="Повязана із звичкою"
              >
                <Switch />
              </Form.Item>
            );
          }
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.isRelatedWithHabit !== currentValues.isRelatedWithHabit ||
          prevValues.aimType !== currentValues.aimType
        }
      >
        {({ getFieldValue }) => {
          if (
            getFieldValue("isRelatedWithHabit") &&
            getFieldValue("aimType") === "number"
          ) {
            return (
              <>
                <Form.Item name="relatedHabit" label="Повязана звичка">
                  <Cascader
                    options={getRelatedHabits()}
                    showSearch={{ filter }}
                    placeholder="Вибери звичку"
                  />
                </Form.Item>
                <Form.Item name="calculationType" label="Тип вимірювання">
                  <Radio.Group defaultValue="sum">
                    <Radio.Button value="sum">Сума усіх вартостей</Radio.Button>
                    <Radio.Button value="lastMeasureAsc">
                      За остатньою вартістю (Зростаюча)
                    </Radio.Button>
                    <Radio.Button value="lastMeasureDesc">
                      За остатньою вартістю (Спадаюча)
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </>
            );
          }
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.calculationType !== currentValues.calculationType ||
          prevValues.aimType !== currentValues.aimType
        }
      >
        {({ getFieldValue }) => {
          if (
            (getFieldValue("calculationType") === "lastMeasureAsc" ||
              getFieldValue("calculationType") === "lastMeasureDesc") &&
            getFieldValue("aimType") === "number"
          ) {
            return (
              <Form.Item name="startedPoint" label="Початкове значення">
                <InputNumber
                  addonAfter={
                    relatedHabit
                      ? habitsList.data
                          ?.find((habit) => relatedHabit[0] === habit.id)
                          ?.fields?.find(
                            (field) => field.id === relatedHabit[1]
                          )?.unit
                      : ""
                  }
                />
              </Form.Item>
            );
          }
        }}
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.aimType !== currentValues.aimType
        }
      >
        {({ getFieldValue }) => {
          if (getFieldValue("aimType") === "list") {
            return (
              <>
                <Form.Item name="relatedList" label="Повязаний список">
                  <Cascader
                    multiple
                    options={getRelatedLists()}
                    showSearch={{ filter }}
                    placeholder="Вибери звичку"
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
          prevValues.aimType !== currentValues.aimType
        }
      >
        {({ getFieldValue }) => {
          if (getFieldValue("aimType") === "number") {
            return (
              <Form.Item
                rules={[{ required: true }]}
                name="finalAim"
                label="Кінцева ціль"
              >
                <InputNumber
                  addonAfter={
                    relatedHabit
                      ? habitsList.data
                          ?.find((habit) => relatedHabit[0] === habit.id)
                          ?.fields?.find(
                            (field) => field.id === relatedHabit[1]
                          )?.unit
                      : ""
                  }
                />
              </Form.Item>
            );
          }
        }}
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {aimId ? "Записати зміни" : "Додати ціль"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditAim;
