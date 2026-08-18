import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetSphereQuery,
  useUpdateSphereMutation,
} from "store/services/spheres";
import { ISphere } from "types/spheres.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import {
  useGetHabitListQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import { useGetAimsListQuery, useUpdateAimMutation } from "store/services/aims";
import uniqid from "uniqid";
import { getRelationshipUpdates } from "share/functions/getRelationshipUpdates";

const formInitialValues = {
  title: "",
  description: "",
};

const AddEditSphere = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { sphereId } = useParams();

  const [updateSphere] = useUpdateSphereMutation();
  const [updateAim] = useUpdateAimMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const sphereDetails = useGetSphereQuery(sphereId, { skip: !sphereId });
  const habitData = useGetHabitListQuery();
  const aimsData = useGetAimsListQuery();

  const [currentHabitsKeys, setCurrentHabitsKeys] = useState<string[]>([]);
  const [selectedHabitsKeys, setSelectedHabitsKeys] = useState<string[]>([]);
  const [habitsTransferItems, setHabitsTransferItems] = useState<any[]>([]);
  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [aimsTransferItems, setAimsTransferItems] = useState<any[]>([]);

  useEffect(() => {
    if (!aimsData.data || !habitData.data) return;

    setCurrentAimsKeys(
      aimsData.data
        .filter((aim) => aim.sphereId === sphereId)
        .map((aim) => aim.id),
    );
    setCurrentHabitsKeys(
      habitData.data
        .filter((habit) => habit.sphereId === sphereId)
        .map((habit) => habit.id),
    );
    setAimsTransferItems(
      aimsData.data.map((aim) => ({ key: aim.id, title: aim.title })),
    );
    setHabitsTransferItems(
      habitData.data.map((habit) => ({ key: habit.id, title: habit.title })),
    );
  }, [aimsData.data, habitData.data, sphereId]);

  useEffect(() => {
    if (sphereDetails.data) {
      form.setFieldsValue(sphereDetails.data);
    }
  }, [form, sphereDetails.data]);

  const onFinish = async (newSphereData: ISphere) => {
    const currentId = sphereId || uniqid();
    const previousAimIds =
      aimsData.data
        ?.filter((aim) => aim.sphereId === sphereId)
        .map((aim) => aim.id) || [];
    const previousHabitIds =
      habitData.data
        ?.filter((habit) => habit.sphereId === sphereId)
        .map((habit) => habit.id) || [];

    await updateSphere({ id: currentId, data: newSphereData }).unwrap();

    await Promise.all(
      getRelationshipUpdates(previousAimIds, currentAimsKeys, currentId).map(
        ({ id, relationId }) =>
          updateAim({ id, data: { sphereId: relationId } }).unwrap(),
      ),
    );
    await Promise.all(
      getRelationshipUpdates(
        previousHabitIds,
        currentHabitsKeys,
        currentId,
      ).map(({ id, relationId }) =>
        updateHabit({ id, data: { sphereId: relationId } }).unwrap(),
      ),
    );

    navigate(-1);
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

      <Form.Item label="Пов’язані звички">
        <Transfer
          dataSource={habitsTransferItems}
          titles={["Доступні", "Пов’язані"]}
          targetKeys={currentHabitsKeys}
          selectedKeys={selectedHabitsKeys}
          onChange={(nextTargetKeys) =>
            setCurrentHabitsKeys(nextTargetKeys as string[])
          }
          onSelectChange={(sourceKeys, targetKeys) =>
            setSelectedHabitsKeys([...sourceKeys, ...targetKeys] as string[])
          }
          render={(item) => item.title}
        />
      </Form.Item>

      <Form.Item label="Пов’язані цілі">
        <Transfer
          dataSource={aimsTransferItems}
          titles={["Доступні", "Пов’язані"]}
          targetKeys={currentAimsKeys}
          selectedKeys={selectedAimsKeys}
          onChange={(nextTargetKeys) =>
            setCurrentAimsKeys(nextTargetKeys as string[])
          }
          onSelectChange={(sourceKeys, targetKeys) =>
            setSelectedAimsKeys([...sourceKeys, ...targetKeys] as string[])
          }
          render={(item) => item.title}
        />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {sphereId ? "Записати зміни" : "Додати сферу життя"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditSphere;
