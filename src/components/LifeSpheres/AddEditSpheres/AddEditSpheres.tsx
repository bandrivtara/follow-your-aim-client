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
import { useGetAimsListQuery } from "../../../store/services/aims";

const formInitialValues = {
  title: "",
  description: "",
  relatedActivities: [],
  relatedAims: [],
};

const AddEditSphere = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { sphereId } = useParams();
  const [addSphere] = useAddSphereMutation();
  const [updateSphere] = useUpdateSphereMutation();
  const sphereDetails = useGetSphereQuery(sphereId);
  const activityData = useGetActivityListQuery();
  const aimsData = useGetAimsListQuery();

  const [currentActivitiesKeys, setCurrentActivitiesKeys] = useState<string[]>(
    []
  );
  const [selectedActivitiesKeys, setSelectedActivitiesKeys] = useState<
    string[]
  >([]);
  const [notSelectedActivities, setNotSelectedActivities] = useState<any[]>([]);
  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [notSelectedAims, setNotSelectedAims] = useState<any[]>([]);

  useEffect(() => {
    if (sphereDetails) {
      if (sphereDetails.data && sphereDetails.data) {
        console.log(sphereDetails.data);
        form.setFieldsValue(sphereDetails.data);
        setCurrentActivitiesKeys(sphereDetails.data.relatedActivities);
        setCurrentAimsKeys(sphereDetails.data.relatedAims);
      }
    }
  }, [sphereDetails, form]);

  useEffect(() => {
    console.log(selectedActivitiesKeys, notSelectedActivities);
  }, [notSelectedActivities, selectedActivitiesKeys]);

  useEffect(() => {
    const allActivities = [];
    const allAims = [];

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
    if (aimsData && aimsData.data && aimsData.data.length) {
      for (let i = 0; i < aimsData?.data?.length; i++) {
        const data = {
          key: aimsData?.data[i].id,
          title: aimsData?.data[i].title,
        };

        allAims.push(data);
      }

      setNotSelectedAims(allAims);
    }
  }, [activityData, aimsData, form]);

  const onActivitiesTransferChange = (nextTargetKeys: string[]) => {
    setCurrentActivitiesKeys(nextTargetKeys);
  };

  const onActivitiesTransferSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedActivitiesKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onAimsTransferChange = (nextTargetKeys: string[]) => {
    setCurrentAimsKeys(nextTargetKeys);
  };

  const onAimsTransferSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedAimsKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
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
          targetKeys={currentActivitiesKeys}
          selectedKeys={selectedActivitiesKeys}
          onChange={onActivitiesTransferChange}
          onSelectChange={onActivitiesTransferSelectChange}
          render={(item) => item.title}
        />
      </Form.Item>

      <Form.Item name="relatedAims" label="Повязані цілі">
        <Transfer
          dataSource={notSelectedAims}
          titles={["Source", "Target"]}
          targetKeys={currentAimsKeys}
          selectedKeys={selectedAimsKeys}
          onChange={onAimsTransferChange}
          onSelectChange={onAimsTransferSelectChange}
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
