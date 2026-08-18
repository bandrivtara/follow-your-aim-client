import { Alert, Button, Form, Input, Spin, Transfer } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  SaveOutlined,
} from "@ant-design/icons";
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
import StyledEntityFormPage from "share/components/Form/EntityFormPage.styled";

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

  const [updateGroup, { isLoading: isSavingGroup }] =
    useUpdateGroupMutation();
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
    await updateGroup(groupToUpdate).unwrap();
    await Promise.all(
      currentWordsKeys.map(async (wordId) => {
        const wordToUpdate = {
          data: currentId,
          path: `${wordId}.group`,
        };
        await updateWord(wordToUpdate).unwrap();
      })
    );

    navigate(-1);
  };

  return (
    <StyledEntityFormPage>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {groupId ? "Редагувати групу слів" : "Нова група слів"}
          </h1>
          <p className="page-subtitle">
            Об’єднай слова за темою, курсом або ситуацією використання.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>

      {groupDetails.isError && (
        <Alert
          className="load-error"
          type="error"
          showIcon
          message="Не вдалося завантажити групу"
          action={
            <Button size="small" onClick={() => groupDetails.refetch()}>
              Повторити
            </Button>
          }
        />
      )}

      <Spin spinning={groupDetails.isFetching || wordsData.isFetching}>
        <div className="entity-form-card">
          <Form
            className="entity-form"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={formInitialValues}
          >
            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon"><FolderOpenOutlined /></span>
                <div>
                  <h2>Основна інформація</h2>
                  <p>Назва має коротко пояснювати тему групи.</p>
                </div>
              </div>
              <Form.Item
                rules={[{ required: true, message: "Вкажи назву групи" }]}
                name="title"
                label="Назва"
              >
                <Input size="large" placeholder="Наприклад, Робота й кар’єра" />
              </Form.Item>
              <Form.Item name="description" label="Опис">
                <TextArea rows={3} maxLength={400} showCount />
              </Form.Item>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon"><LinkOutlined /></span>
                <div>
                  <h2>Слова групи</h2>
                  <p>Перемісти до правого списку слова, які належать цій темі.</p>
                </div>
              </div>
              <div className="transfer-scroll">
                <Transfer
                  dataSource={notSelectedWords}
                  titles={["Доступні", "У групі"]}
                  targetKeys={currentWordsKeys}
                  selectedKeys={selectedWordsKeys}
                  onChange={onWordsTransferChange}
                  onSelectChange={onWordsTransferSelectChange}
                  render={(item) => item.title}
                />
              </div>
            </section>

            <div className="form-actions">
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSavingGroup}
              >
                {groupId ? "Зберегти зміни" : "Додати групу"}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </StyledEntityFormPage>
  );
};

export default AddEditGroup;
