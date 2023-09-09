import { ColumnsType } from "antd/es/table";
import { IActivityDetails } from "../../types/activity.types";
import { Link } from "react-router-dom";
import routes from "../../config/routes";

const configs: ColumnsType<IActivityDetails> = [
  {
    title: "Назва",
    dataIndex: "title",
    key: "title",
    render: (text, activity) => (
      <Link to={`${routes.activity.edit}/${activity.id}`}>{text}</Link>
    ),
  },
  {
    title: "Опис",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Складність",
    dataIndex: "complexity",
    key: "complexity",
  },
  {
    title: "Категорія",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Тип звички",
    dataIndex: "valueType",
    key: "valueType",
  },
  {
    title: "Мінімум для виконання",
    dataIndex: "minToComplete",
    key: "minToComplete",
  },
  {
    title: "Міра значення",
    dataIndex: "measure",
    key: "measure",
  },
  {
    title: "Створено",
    dataIndex: "createAt",
    key: "createAt",
  },
  {
    title: "Запланований час",
    dataIndex: "scheduleTime",
    key: "scheduleTime",
    render: (value) => value && `${value[0]}:${value[1]}`,
  },
];

export default configs;
