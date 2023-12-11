import { Form, Input, Button, Slider, DatePicker } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddAimMutation,
  useGetAimQuery,
  useUpdateAimMutation,
} from "../../../store/services/aims";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { IAim } from "../../../types/aim.types";
import dayjs from "dayjs";

const formInitialValues: IAim = {
  title: "",
  description: "",
  dateFrom: "",
  dateTo: "",
  progress: 0,
  value: "",
  id: "",
};

const AddEditAim = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { aimId } = useParams();
  const [addAim] = useAddAimMutation();
  const [updateAim] = useUpdateAimMutation();
  const aimDetails = useGetAimQuery(aimId);

  useEffect(() => {
    if (aimDetails) {
      if (aimDetails.data && aimDetails.data) {
        form.setFieldsValue(aimDetails.data);

        console.log(aimDetails.data, 222);
      }
    }
  }, [aimDetails, form]);

  const onFinish = async (newAimData: IAim) => {
    if (aimId) {
      const aimToUpdate = {
        id: aimId,
        data: {
          ...newAimData,
          dateFrom: dayjs(newAimData.dateFrom).format("YYYY/MM/DD"),
          dateTo: dayjs(newAimData.dateTo).format("YYYY/MM/DD"),
        },
        path: "",
      };
      console.log(newAimData, 123);
      // await updateAim(aimToUpdate).unwrap();
    } else {
      console.log(newAimData, 333);
      await addAim({
        ...newAimData,
        dateFrom: dayjs(newAimData.dateFrom).format("YYYY/MM/DD"),
        dateTo: dayjs(newAimData.dateTo).format("YYYY/MM/DD"),
      });
    }

    // navigate(routes.aims.list);
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

      <Form.Item name="dateFrom" label="Починаючи з...">
        <DatePicker />
      </Form.Item>

      <Form.Item name="dateTo" label="До...">
        <DatePicker />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {aimId ? "Записати зміни" : "Додати звичку"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditAim;
