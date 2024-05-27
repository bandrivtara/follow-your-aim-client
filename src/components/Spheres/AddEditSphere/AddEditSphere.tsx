import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddSphereMutation,
  useGetSphereQuery,
  useUpdateSphereMutation,
} from "store/services/spheres";
import { ISphere } from "types/spheres.types";
import routes from "config/routes";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import {
  useGetHabitListQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import { useGetAimsListQuery, useUpdateAimMutation } from "store/services/aims";
import uniqid from "uniqid";

const formInitialValues = {
  title: "",
  description: "",
  relatedHabits: [],
  relatedAims: [],
};

const AddEditSphere = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { sphereId } = useParams();

  const [updateSphere] = useUpdateSphereMutation();
  const [updateAim] = useUpdateAimMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const sphereDetails = useGetSphereQuery(sphereId);
  const habitData = useGetHabitListQuery();
  const aimsData = useGetAimsListQuery();

  const [currentHabitsKeys, setCurrentHabitsKeys] = useState<string[]>([]);
  const [selectedHabitsKeys, setSelectedHabitsKeys] = useState<string[]>([]);
  const [notSelectedHabits, setNotSelectedHabits] = useState<any[]>([]);
  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [notSelectedAims, setNotSelectedAims] = useState<any[]>([]);

  useEffect(() => {
    if (aimsData.data && habitData.data) {
      const relatedAims = aimsData.data
        .filter((aim) => aim.sphereId === sphereId)
        .map((aim) => aim.id);
      const relatedHabits = habitData.data
        .filter((habit) => habit.sphereId === sphereId)
        .map((habit) => habit.id);

      setCurrentAimsKeys(relatedAims);
      setCurrentHabitsKeys(relatedHabits);

      const allAims = [];
      const allHabits = [];

      for (let i = 0; i < aimsData?.data?.length; i++) {
        const data = {
          key: aimsData?.data[i].id,
          title: aimsData?.data[i].title,
        };

        allAims.push(data);
      }
      for (let i = 0; i < habitData?.data?.length; i++) {
        const data = {
          key: habitData?.data[i].id,
          title: habitData?.data[i].title,
        };

        allHabits.push(data);
      }

      setNotSelectedHabits(allHabits);
      setNotSelectedAims(allAims);
      if (sphereDetails.data) {
        form.setFieldsValue(sphereDetails.data);
      }
    }
  }, [sphereDetails, form, aimsData.data, habitData.data, sphereId]);

  const onHabitsTransferChange = (nextTargetKeys: string[]) => {
    setCurrentHabitsKeys(nextTargetKeys);
  };

  const onHabitsTransferSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedHabitsKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
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

  const onFinish = async (newSphereData: ISphere) => {
    const currentId = sphereId || uniqid();
    const sphereToUpdate = {
      id: currentId,
      data: newSphereData,
      path: "",
    };
    await updateSphere(sphereToUpdate).unwrap();
    await Promise.all(
      currentAimsKeys.map(async (aimId) => {
        const aimToUpdate = {
          id: aimId,
          data: { sphereId: currentId },
          path: "",
        };
        await updateAim(aimToUpdate);
      })
    );

    await Promise.all(
      currentHabitsKeys.map(async (habitId) => {
        const habitToUpdate = {
          id: habitId,
          data: { sphereId: currentId },
          path: "",
        };
        await updateHabit(habitToUpdate);
      })
    );

    // navigate(routes.spheres.list);
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

      <Form.Item label="Повязані звички">
        <Transfer
          dataSource={notSelectedHabits}
          titles={["Source", "Target"]}
          targetKeys={currentHabitsKeys}
          selectedKeys={selectedHabitsKeys}
          onChange={onHabitsTransferChange}
          onSelectChange={onHabitsTransferSelectChange}
          render={(item) => item.title}
        />
      </Form.Item>

      <Form.Item label="Повязані цілі">
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
