import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Slider,
  InputNumber,
  Cascader,
  AutoComplete,
  Switch,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddActivityMutation,
  useGetActivityQuery,
  useUpdateActivityMutation,
} from "../../../store/services/activity";
import { IActivityDetails } from "../../../types/activity.types";
import routes from "../../../config/routes";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { getTimeOptions } from "../../../share/functions/getTimeOptions";

const formInitialValues = {
  title: "",
  description: "",
  complexity: 5,
  category: "daily",
  valueType: "number",
  measure: "хв",
  minToComplete: 0,
  scheduleTime: "",
  isHidden: false,
};

const AddEditActivity = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { activityId } = useParams();
  const [addActivity] = useAddActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const activityDetails = useGetActivityQuery(activityId);

  useEffect(() => {
    if (activityDetails) {
      console.log(activityDetails.data);
      if (activityDetails.data && activityDetails.data.details) {
        form.setFieldsValue(activityDetails.data.details);
      }
    }
  }, [activityDetails, form]);

  const onFinish = async (newActivityData: IActivityDetails) => {
    if (activityId) {
      console.log(activityDetails);
      const activityToUpdate = {
        id: activityId,
        data: newActivityData,
        path: "details",
      };
      await updateActivity(activityToUpdate).unwrap();
    } else {
      await addActivity(newActivityData);
    }
    navigate(routes.activity.list);
    navigate(0);
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
        <Select>
          <Select.Option value="morning">Ранкові</Select.Option>
          <Select.Option value="daily">Денні</Select.Option>
          <Select.Option value="sport">Спорт</Select.Option>
          <Select.Option value="lists">Списки</Select.Option>
          <Select.Option value="other">Інше</Select.Option>
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
          {activityId ? "Записати зміни" : "Додати звичку"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditActivity;
