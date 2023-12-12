import { Form, Input, Button, Slider, DatePicker, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddAimMutation,
  useGetAimQuery,
  useUpdateAimMutation,
} from "../../../store/services/aims";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { IAim } from "../../../types/aim.types";
import dayjs from "dayjs";
import {
  useGetSpheresListQuery,
  useUpdateSphereMutation,
} from "../../../store/services/lifeSpheres";
import { ILifeSphere } from "../../../types/lifeSpheres.types";

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
  const spheresData = useGetSpheresListQuery();
  const [spheres, setSpheres] = useState<ILifeSphere[]>([]);
  const [updateSphere] = useUpdateSphereMutation();

  useEffect(() => {
    if (aimDetails) {
      if (aimDetails.data && aimDetails.data) {
        // form.setFieldsValue(aimDetails.data);

        console.log(aimDetails.data, 222);
      }
    }
  }, [aimDetails, form]);

  useEffect(() => {
    if (spheresData && spheresData.data) {
      setSpheres(spheresData.data);
    }
  }, [spheresData]);

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
      await updateAim(aimToUpdate).unwrap();
    } else {
      await addAim({
        ...newAimData,
        dateFrom: dayjs(newAimData.dateFrom).format("YYYY/MM/DD"),
        dateTo: dayjs(newAimData.dateTo).format("YYYY/MM/DD"),
      });
    }

    const currentSphereData = spheres.find(
      (sphere) => sphere.id === newAimData.category
    );
    if (
      aimId &&
      currentSphereData?.relatedActivities &&
      !currentSphereData?.relatedActivities.includes(aimId)
    ) {
      const sphereToUpdate = {
        id: newAimData.category,
        data: {
          ...currentSphereData,
          relatedActivities: [...currentSphereData?.relatedActivities, aimId],
        },
        path: "",
      };
      console.log(sphereToUpdate);
      await updateSphere(sphereToUpdate);
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

      <Form.Item rules={[{ required: true }]} name="category" label="Категорія">
        <Select placeholder="Виберіть категорію">
          {spheres.map((sphere) => (
            <Select.Option value={sphere.id}>{sphere.title}</Select.Option>
          ))}
        </Select>
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
