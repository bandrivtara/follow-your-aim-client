import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddAimsCategoryMutation,
  useGetAimsCategoryQuery,
  useUpdateAimsCategoryMutation,
} from "store/services/aimsCategories";
import { IAimsCategory } from "types/aimsCategories.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useGetAimsListQuery, useUpdateAimMutation } from "store/services/aims";
import uniqid from "uniqid";

const formInitialValues = {
  title: "",
  description: "",
  relatedAims: [],
};

const AddEditAimsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { aimsCategoryId } = useParams();
  const [addAimsCategory] = useAddAimsCategoryMutation();
  const [updateAimsCategory] = useUpdateAimsCategoryMutation();
  const [updateAim] = useUpdateAimMutation();
  const aimsCategoryDetails = useGetAimsCategoryQuery(aimsCategoryId);
  const aimData = useGetAimsListQuery();

  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [notSelectedAims, setNotSelectedAims] = useState<any[]>([]);

  useEffect(() => {
    if (aimsCategoryDetails.data && aimData.data) {
      const relatedAims = aimData.data
        .filter((aim) => aim.aimsCategoryId === aimsCategoryId)
        .map((aim) => aim.id);

      form.setFieldsValue(aimsCategoryDetails.data);
      setCurrentAimsKeys(relatedAims);
    }

    if (aimData.data) {
      const allAims = [];
      for (let i = 0; i < aimData?.data?.length; i++) {
        const data = {
          key: aimData?.data[i].id,
          title: aimData?.data[i].title,
        };

        allAims.push(data);
      }
      console.log(allAims);
      setNotSelectedAims(allAims);
    }
  }, [aimsCategoryDetails, form, aimData.data, aimsCategoryId]);

  const onAimsTransferChange = (nextTargetKeys: string[]) => {
    setCurrentAimsKeys(nextTargetKeys);
  };

  const onAimsTransferSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedAimsKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onFinish = async (newAimsCategoryData: IAimsCategory) => {
    const currentId = aimsCategoryId || uniqid();
    const aimsCategoryToUpdate = {
      id: currentId,
      data: newAimsCategoryData,
      path: "",
    };
    await updateAimsCategory(aimsCategoryToUpdate).unwrap();

    await Promise.all(
      currentAimsKeys.map(async (aimId) => {
        const aimToUpdate = {
          id: aimId,
          data: { aimsCategoryId: currentId },
          path: "",
        };
        await updateAim(aimToUpdate);
      })
    );

    // navigate(routes.aim.categories.list);
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

      <Form.Item label="Повязані ">
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
          {aimsCategoryId ? "Записати зміни" : "Додати категорію"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditAimsCategory;
