import { Form, Input, Button, Transfer } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetGroupQuery,
  useUpdateGroupMutation,
} from "store/services/english";
import { IGroup } from "types/english.types";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";

import {
  useGetWordsListQuery,
  useUpdateWordMutation,
} from "store/services/english";
import uniqid from "uniqid";

const formInitialValues = {
  title: "",
  description: "",
  relatedHabits: [],
  relatedWords: [],
};

const AddEditGroup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { groupId } = useParams();

  const [updateGroup] = useUpdateGroupMutation();
  const [updateWord] = useUpdateWordMutation();
  const groupDetails = useGetGroupQuery(groupId);
  const wordsData = useGetWordsListQuery();

  const [currentWordsKeys, setCurrentWordsKeys] = useState<string[]>([]);
  const [selectedWordsKeys, setSelectedWordsKeys] = useState<string[]>([]);
  const [notSelectedWords, setNotSelectedWords] = useState<any[]>([]);

  useEffect(() => {
    if (wordsData.data) {
      const relatedWords = [];
      const allWords = [];

      for (const [wordId, wordData] of Object.entries(wordsData.data)) {
        if (wordData.group === groupId) {
          relatedWords.push(wordId);
        }

        allWords.push({ key: wordId, title: wordData.title });
      }

      setCurrentWordsKeys(relatedWords);

      for (let i = 0; i < wordsData?.data?.length; i++) {
        const data = {
          key: wordsData?.data[i].id,
          title: wordsData?.data[i].title,
        };

        allWords.push(data);
      }

      setNotSelectedWords(allWords);
      if (groupDetails.data) {
        form.setFieldsValue(groupDetails.data);
      }
    }
  }, [groupDetails, form, wordsData.data, groupId]);

  const onWordsTransferChange = (nextTargetKeys: string[]) => {
    setCurrentWordsKeys(nextTargetKeys);
  };

  const onWordsTransferSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedWordsKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onFinish = async (newGroupData: IGroup) => {
    const currentId = groupId || uniqid();
    const groupToUpdate = {
      data: newGroupData,
      path: currentId,
    };
    console.log(currentWordsKeys);
    await updateGroup(groupToUpdate).unwrap();
    await Promise.all(
      currentWordsKeys.map(async (wordId) => {
        console.log(wordId);
        const wordToUpdate = {
          data: currentId,
          path: `${wordId}.group`,
        };
        await updateWord(wordToUpdate);
      })
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

      <Form.Item label="Повязані цілі">
        <Transfer
          dataSource={notSelectedWords}
          titles={["Source", "Target"]}
          targetKeys={currentWordsKeys}
          selectedKeys={selectedWordsKeys}
          onChange={onWordsTransferChange}
          onSelectChange={onWordsTransferSelectChange}
          render={(item) => item.title}
        />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">
          {groupId ? "Записати зміни" : "Додати групу"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEditGroup;
