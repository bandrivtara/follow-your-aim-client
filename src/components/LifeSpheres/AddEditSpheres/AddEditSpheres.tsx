import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddSphereMutation,
  useGetSphereQuery,
  useUpdateSphereMutation,
} from "../../../store/services/lifeSpheres";
import { ILifeSphere } from "../../../types/lifeSpheres.types";
import routes from "../../../config/routes";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useGetActivityListQuery } from "../../../store/services/activity";

const formInitialValues = {
  title: "",
  description: "",
  relatedActivities: [],
};

const AddEditSphere = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { sphereId } = useParams();
  const [addSphere] = useAddSphereMutation();
  const [updateSphere] = useUpdateSphereMutation();
  const sphereDetails = useGetSphereQuery(sphereId);
  const activityData = useGetActivityListQuery();

  const [selectedActivitiesKeys, setSelectedActivitiesKeys] = useState<
    string[]
  >([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [notSelectedActivities, setNotSelectedActivities] = useState<any[]>([]);

  useEffect(() => {
    if (sphereDetails) {
      if (sphereDetails.data && sphereDetails.data) {
        form.setFieldsValue(sphereDetails.data);
        setSelectedActivitiesKeys(sphereDetails.data.relatedActivities);

        console.log(sphereDetails.data, 222);
      }
    }
  }, [sphereDetails, form]);

  useEffect(() => {
    const allActivities = [];

    if (activityData && activityData.data && activityData.data.length) {
      for (let i = 0; i < activityData?.data?.length; i++) {
        const data = {
          key: activityData?.data[i].id,
          title: activityData?.data[i].details.title,
        };

        allActivities.push(data);
      }

      setNotSelectedActivities(allActivities);
    }
  }, [activityData, activityData.data, form]);

  const onChange = (nextTargetKeys: string[]) => {
    setSelectedActivitiesKeys(nextTargetKeys);
  };

  const onSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onFinish = async (newSphereData: ILifeSphere) => {
    if (sphereId) {
      const sphereToUpdate = {
        id: sphereId,
        data: newSphereData,
        path: "",
      };
      console.log(newSphereData);
      await updateSphere(sphereToUpdate).unwrap();
    } else {
      console.log(newSphereData, 333);
      await addSphere(newSphereData);
    }

    navigate(routes.lifeSpheres.list);
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

      <Form.Item name="relatedActivities" label="Повязані активності">
        <Transfer
          dataSource={notSelectedActivities}
          titles={["Source", "Target"]}
          targetKeys={selectedActivitiesKeys}
          selectedKeys={selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          render={(item) => item.title}
        />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {sphereId ? "Записати зміни" : "Додати звичку"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditSphere;
