import { Form, Input, Button, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWordQuery, useUpdateWordMutation } from "store/services/english";
import TextArea from "antd/es/input/TextArea";
import { IGroupData, IWord } from "types/english.types";
import { useGetGroupsListQuery } from "store/services/english";
import { useEffect, useState } from "react";
import uniqid from "uniqid";

const formInitialValues: IWord = {
  title: "",
  translation: "",
  example: "",
  description: "",
  group: "",
  progress: 0,
};

const AddEditWord = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  let { wordId } = useParams();
  const [updateWord] = useUpdateWordMutation();
  const wordDetails = useGetWordQuery(wordId);
  const groups = useGetGroupsListQuery();
  const [wordsGroups, setWordsGroups] = useState<IGroupData[]>([]);

  useEffect(() => {
    if (!groups.data) return;
    const newWordsGroups = [];
    for (const [groupId, groupData] of Object.entries(groups.data)) {
      newWordsGroups.push({ ...groupData, id: groupId });
    }

    setWordsGroups(newWordsGroups);

    if (wordDetails.data) {
      form.setFieldsValue(wordDetails.data);
    }
  }, [form, groups, wordDetails.data]);

  const onFinish = async (newWordData: IWord) => {
    const data = newWordData;
    const currentId = wordId || uniqid();

    const wordToUpdate = {
      data,
      path: currentId,
    };
    await updateWord(wordToUpdate).unwrap();
    console.log(data.title, "was ADDED");
    // navigate(-1);
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

      <Form.Item name="example" label="Приклад">
        <TextArea rows={2} />
      </Form.Item>
      <Form.Item
        rules={[{ required: true }]}
        name="translation"
        label="Переклад"
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Опис">
        <TextArea rows={2} />
      </Form.Item>

      <Form.Item label="Група" name="group">
        <Select placeholder="Виберіть категорію">
          {wordsGroups &&
            wordsGroups.map((word) => (
              <Select.Option key={word.id} value={word.id}>
                {word.title}
              </Select.Option>
            ))}
          <Select.Option key={"no-category"} value={""}>
            Без групи
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {wordId ? "Записати зміни" : "Додати слово"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditWord;
