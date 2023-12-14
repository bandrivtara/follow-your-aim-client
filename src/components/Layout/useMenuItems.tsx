import { useNavigate } from "react-router-dom";
import {
  DesktopOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  PlusSquareOutlined,
  CalendarOutlined,
  CheckOutlined,
  AimOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import routes from "../../config/routes";

const useMenuItems = () => {
  const navigate = useNavigate();

  type MenuItem = Required<MenuProps>["items"][number];

  const items: MenuItem[] = [
    {
      key: 1,
      label: "Головна",
      onClick: () => navigate(routes.main),
      icon: <DesktopOutlined rev="string" />,
    },
    {
      key: 3,
      label: "Завдання",
      icon: <CheckOutlined rev="string" />,
      children: [
        {
          key: 30,
          label: "Календар завдань",
          onClick: () => navigate(routes.taskGroups.calendar),
          icon: <CalendarOutlined rev="string" />,
        },
        {
          key: 31,
          label: "Усі групи завдань",
          onClick: () => navigate(routes.taskGroups.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 32,
          label: "Додати групу завдань",
          onClick: () => navigate(routes.taskGroups.add),
          icon: <PlusSquareOutlined rev="string" />,
        },
        {
          key: 33,
          label: "Статистика",
          onClick: () => navigate(routes.taskGroups.statistic),
          icon: <LineChartOutlined rev="string" />,
        },
      ],
    },
    {
      key: 4,
      label: "Звички",
      icon: <CheckOutlined rev="string" />,
      children: [
        {
          key: 40,
          label: "Календар",
          onClick: () => navigate(routes.habit.calendar),
          icon: <CalendarOutlined rev="string" />,
        },
        {
          key: 41,
          label: "Усі звички",
          onClick: () => navigate(routes.habit.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 42,
          label: "Додати звичку",
          onClick: () => navigate(routes.habit.add),
          icon: <PlusSquareOutlined rev="string" />,
        },
        {
          key: 43,
          label: "Статистика",
          onClick: () => navigate(routes.habit.statistic),
          icon: <LineChartOutlined rev="string" />,
        },
      ],
    },
    {
      key: 5,
      label: "Цілі",
      icon: <AimOutlined rev="string" />,
      children: [
        {
          key: 50,
          label: "Календар",
          onClick: () => navigate(routes.aims.calendar),
          icon: <CalendarOutlined rev="string" />,
        },
        {
          key: 51,
          label: "Усі цілі",
          onClick: () => navigate(routes.aims.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 52,
          label: "Додати ціль",
          onClick: () => navigate(routes.aims.add),
          icon: <PlusSquareOutlined rev="string" />,
        },
        {
          key: 53,
          label: "Статистика",
          onClick: () => navigate(routes.aims.statistic),
          icon: <LineChartOutlined rev="string" />,
        },
      ],
    },
    {
      key: 6,
      label: "Сфери життя",
      icon: <AimOutlined rev="string" />,
      children: [
        {
          key: 61,
          label: "Усі сфери життя",
          onClick: () => navigate(routes.lifeCategories.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 62,
          label: "Додати сферу життя",
          onClick: () => navigate(routes.lifeCategories.add),
          icon: <PlusSquareOutlined rev="string" />,
        },
        {
          key: 63,
          label: "Статистика",
          onClick: () => navigate(routes.lifeCategories.statistic),
          icon: <LineChartOutlined rev="string" />,
        },
      ],
    },
  ];

  return items;
};

export default useMenuItems;
