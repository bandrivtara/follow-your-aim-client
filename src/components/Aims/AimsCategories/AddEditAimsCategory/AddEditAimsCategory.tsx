import { Alert, Button, Form, Input, Spin, Transfer } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  SaveOutlined,
} from "@ant-design/icons";
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
import StyledEntityFormPage from "share/components/Form/EntityFormPage.styled";

const formInitialValues = {
  title: "",
  description: "",
};

const AddEditAimsCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { aimsCategoryId } = useParams();
  const [updateAimsCategory, { isLoading: isSavingCategory }] =
    useUpdateAimsCategoryMutation();
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
    <StyledEntityFormPage>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {aimsCategoryId ? "Редагувати категорію цілей" : "Нова категорія цілей"}
          </h1>
          <p className="page-subtitle">
            Об’єднай споріднені цілі, щоб швидше знаходити їх у списку та календарі.
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </header>

      {aimsCategoryDetails.isError && (
        <Alert
          className="load-error"
          type="error"
          showIcon
          message="Не вдалося завантажити категорію"
          action={
            <Button size="small" onClick={() => aimsCategoryDetails.refetch()}>
              Повторити
            </Button>
          }
        />
      )}

      <Spin spinning={aimsCategoryDetails.isFetching || aimData.isFetching}>
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
                  <p>Дай категорії коротку й зрозумілу назву.</p>
                </div>
              </div>
              <Form.Item
                rules={[{ required: true, message: "Вкажи назву категорії" }]}
                name="title"
                label="Назва"
              >
                <Input size="large" placeholder="Наприклад, Здоров’я" />
              </Form.Item>
              <Form.Item name="description" label="Опис">
                <TextArea rows={3} maxLength={400} showCount />
              </Form.Item>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <span className="section-icon"><LinkOutlined /></span>
                <div>
                  <h2>Пов’язані цілі</h2>
                  <p>Перемісти до правого списку цілі, що належать категорії.</p>
                </div>
              </div>
              <div className="transfer-scroll">
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
              </div>
            </section>

            <div className="form-actions">
              <Button onClick={() => navigate(-1)}>Скасувати</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSavingCategory}
              >
                {aimsCategoryId ? "Зберегти зміни" : "Додати категорію"}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </StyledEntityFormPage>
  );
};

export default AddEditAimsCategory;
