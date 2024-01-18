import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddAimsCategoryMutation,
  useGetAimsCategoryQuery,
  useUpdateAimsCategoryMutation,
} from "store/services/aimsCategories";
import { IAimsCategory } from "types/aimsCategories.types";
import routes from "config/routes";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useGetHabitListQuery } from "store/services/habits";
import { useGetAimsListQuery } from "store/services/aims";

const formInitialValues = {
  title: "",
  description: "",
  relatedHabits: [],
  relatedAims: [],
};

const AddEditAimsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { categoryId } = useParams();
  const [addAimsCategory] = useAddAimsCategoryMutation();
  const [updateAimsCategory] = useUpdateAimsCategoryMutation();
  const categoryDetails = useGetAimsCategoryQuery(categoryId);
  const habitData = useGetHabitListQuery();
  const aimsData = useGetAimsListQuery();

  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [notSelectedAims, setNotSelectedAims] = useState<any[]>([]);

  useEffect(() => {
    if (categoryDetails) {
      if (categoryDetails.data && categoryDetails.data) {
        console.log(categoryDetails.data);
        form.setFieldsValue(categoryDetails.data);
        setCurrentAimsKeys(categoryDetails.data.relatedAims);
      }
    }
  }, [categoryDetails, form]);

  useEffect(() => {
    const allAims = [];

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
  }, [habitData, aimsData, form]);

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
    if (categoryId) {
      const categoryToUpdate = {
        id: categoryId,
        data: newAimsCategoryData,
        path: "",
      };
      console.log(newAimsCategoryData);
      await updateAimsCategory(categoryToUpdate).unwrap();
    } else {
      console.log(newAimsCategoryData, 333);
      await addAimsCategory(newAimsCategoryData);
    }

    navigate(routes.spheres.list);
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
          {categoryId ? "Записати зміни" : "Додати звичку"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditAimsCategory;
