import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetAimsCategoryQuery,
  useUpdateAimsCategoryMutation,
} from "store/services/aimsCategories";
import { IAimsCategory } from "types/aimsCategories.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useGetAimsListQuery, useUpdateAimMutation } from "store/services/aims";
import uniqid from "uniqid";
import { getRelationshipUpdates } from "share/functions/getRelationshipUpdates";

const formInitialValues = {
  title: "",
  description: "",
};

const AddEditAimsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { aimsCategoryId } = useParams();
  const [updateAimsCategory] = useUpdateAimsCategoryMutation();
  const [updateAim] = useUpdateAimMutation();
  const aimsCategoryDetails = useGetAimsCategoryQuery(aimsCategoryId, {
    skip: !aimsCategoryId,
  });
  const aimData = useGetAimsListQuery();

  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [aimsTransferItems, setAimsTransferItems] = useState<any[]>([]);

  useEffect(() => {
    if (!aimData.data) return;
    setCurrentAimsKeys(
      aimData.data
        .filter((aim) => aim.aimsCategoryId === aimsCategoryId)
        .map((aim) => aim.id),
    );
    setAimsTransferItems(
      aimData.data.map((aim) => ({ key: aim.id, title: aim.title })),
    );
  }, [aimData.data, aimsCategoryId]);

  useEffect(() => {
    if (aimsCategoryDetails.data) {
      form.setFieldsValue(aimsCategoryDetails.data);
    }
  }, [aimsCategoryDetails.data, form]);

  const onFinish = async (newAimsCategoryData: IAimsCategory) => {
    const currentId = aimsCategoryId || uniqid();
    const previousAimIds =
      aimData.data
        ?.filter((aim) => aim.aimsCategoryId === aimsCategoryId)
        .map((aim) => aim.id) || [];

    await updateAimsCategory({
      id: currentId,
      data: newAimsCategoryData,
    }).unwrap();
    await Promise.all(
      getRelationshipUpdates(previousAimIds, currentAimsKeys, currentId).map(
        ({ id, relationId }) =>
          updateAim({ id, data: { aimsCategoryId: relationId } }).unwrap(),
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
          {aimsCategoryId ? "Записати зміни" : "Додати категорію"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditAimsCategory;
