import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddCategoryMutation,
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "store/services/categories";
import { ICategory } from "types/categories.types";
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

const AddEditCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { categoryId } = useParams();
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const categoryDetails = useGetCategoryQuery(categoryId);
  const habitData = useGetHabitListQuery();
  const aimsData = useGetAimsListQuery();

  const [currentHabitsKeys, setCurrentHabitsKeys] = useState<string[]>([]);
  const [selectedHabitsKeys, setSelectedHabitsKeys] = useState<string[]>([]);
  const [notSelectedHabits, setNotSelectedHabits] = useState<any[]>([]);
  const [currentAimsKeys, setCurrentAimsKeys] = useState<string[]>([]);
  const [selectedAimsKeys, setSelectedAimsKeys] = useState<string[]>([]);
  const [notSelectedAims, setNotSelectedAims] = useState<any[]>([]);

  useEffect(() => {
    if (categoryDetails) {
      if (categoryDetails.data && categoryDetails.data) {
        console.log(categoryDetails.data);
        form.setFieldsValue(categoryDetails.data);
        setCurrentHabitsKeys(categoryDetails.data.relatedHabits);
        setCurrentAimsKeys(categoryDetails.data.relatedAims);
      }
    }
  }, [categoryDetails, form]);

  useEffect(() => {
    console.log(selectedHabitsKeys, notSelectedHabits);
  }, [notSelectedHabits, selectedHabitsKeys]);

  useEffect(() => {
    const allHabits = [];
    const allAims = [];

    if (habitData && habitData.data && habitData.data.length) {
      for (let i = 0; i < habitData?.data?.length; i++) {
        const data = {
          key: habitData?.data[i].id,
          title: habitData?.data[i].title,
        };

        allHabits.push(data);
      }

      setNotSelectedHabits(allHabits);
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
  }, [habitData, aimsData, form]);

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

  const onFinish = async (newCategoryData: ICategory) => {
    if (categoryId) {
      const categoryToUpdate = {
        id: categoryId,
        data: newCategoryData,
        path: "",
      };
      console.log(newCategoryData);
      await updateCategory(categoryToUpdate).unwrap();
    } else {
      console.log(newCategoryData, 333);
      await addCategory(newCategoryData);
    }

    navigate(routes.lifeCategories.list);
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

      <Form.Item name="relatedHabits" label="Повязані активності">
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

export default AddEditCategory;
