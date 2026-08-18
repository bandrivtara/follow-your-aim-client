import { Alert, Button, Form, Input, Select, Spin } from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  SaveOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWordQuery, useUpdateWordMutation } from "store/services/english";
import TextArea from "antd/es/input/TextArea";
import { IGroupData, IWord } from "types/english.types";
import { useGetGroupsListQuery } from "store/services/english";
import { useEffect, useState } from "react";
import uniqid from "uniqid";
import StyledEntityFormPage from "share/components/Form/EntityFormPage.styled";

const formInitialValues: IWord = {
  title: "",
  translation: "",
  example: "",
  description: "",
  group: "",
  progress: 0,
};

const AddEditWord = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let { wordId } = useParams();
  const [updateWord, { isLoading: isSaving }] = useUpdateWordMutation();
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
    // navigate(-1);
  };

  return (
    <StyledEntityFormPage>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {wordId ? "Редагувати слово" : "Нове англійське слово"}
          </h1>
          <p className="page-subtitle">
            Додай переклад, живий приклад і групу для подальшого повторення.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>

      {wordDetails.isError && (
        <Alert
          className="load-error"
          type="error"
          showIcon
          message="Не вдалося завантажити слово"
          action={
            <Button size="small" onClick={() => wordDetails.refetch()}>
              Повторити
            </Button>
          }
        />
      )}

      <Spin spinning={wordDetails.isFetching || groups.isFetching}>
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
                <span className="section-icon"><BookOutlined /></span>
                <div>
                  <h2>Слово та переклад</h2>
                  <p>Запиши основну форму слова й короткий переклад.</p>
                </div>
              </div>
              <div className="field-grid">
                <Form.Item
                  rules={[{ required: true, message: "Вкажи англійське слово" }]}
                  name="title"
                  label="Англійською"
                >
                  <Input size="large" placeholder="consistency" />
                </Form.Item>
                <Form.Item
                  rules={[{ required: true, message: "Вкажи переклад" }]}
                  name="translation"
                  label="Переклад"
                >
                  <Input size="large" placeholder="послідовність" />
                </Form.Item>
              </div>
              <Form.Item name="example" label="Приклад у реченні">
                <TextArea rows={3} placeholder="Consistency matters more than intensity." />
              </Form.Item>
              <Form.Item name="description" label="Примітка">
                <TextArea rows={2} placeholder="Контекст, синоніми або підказка" />
              </Form.Item>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon"><TagsOutlined /></span>
                <div>
                  <h2>Організація</h2>
                  <p>Додай слово до тематичної групи.</p>
                </div>
              </div>
              <Form.Item label="Група" name="group">
                <Select size="large" placeholder="Вибери групу">
                  {wordsGroups.map((word) => (
                    <Select.Option key={word.id} value={word.id}>
                      {word.title}
                    </Select.Option>
                  ))}
                  <Select.Option key="no-category" value="">
                    Без групи
                  </Select.Option>
                </Select>
              </Form.Item>
            </section>

            <div className="form-actions">
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSaving}
              >
                {wordId ? "Зберегти зміни" : "Додати слово"}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </StyledEntityFormPage>
  );
};

export default AddEditWord;
