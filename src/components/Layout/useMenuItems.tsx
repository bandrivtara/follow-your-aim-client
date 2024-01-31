import { useNavigate } from "react-router-dom";
import {
  DesktopOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  PlusSquareOutlined,
  CalendarOutlined,
  CheckOutlined,
  AimOutlined,
  OrderedListOutlined,
  HeatMapOutlined,
  CarryOutOutlined,
  InsertRowAboveOutlined,
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
      key: 2,
      label: "Календар",
      icon: <CalendarOutlined rev="string" />,
      children: [
        {
          key: 21,
          label: "Розклад",
          onClick: () => navigate(routes.calendar.scheduler),
          icon: <InsertRowAboveOutlined rev="string" />,
        },
        {
          key: 22,
          label: "Трекер",
          onClick: () => navigate(routes.calendar.tracker),
          icon: <CarryOutOutlined rev="string" />,
        },
        {
          key: 23,
          label: "Цілі",
          onClick: () => navigate(routes.calendar.aims),
          icon: <AimOutlined rev="string" />,
        },
      ],
    },
    {
      key: 3,
      label: "Завдання",
      icon: <OrderedListOutlined rev="string" />,
      children: [
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
          key: 41,
          label: "Усі звички",
          onClick: () => navigate(routes.habit.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 42,
          label: "Категорії",
          onClick: () => navigate(routes.habit.categories.list),
          icon: <UnorderedListOutlined rev="string" />,
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
          key: 51,
          label: "Усі цілі",
          onClick: () => navigate(routes.aims.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 52,
          label: "Категорії",
          onClick: () => navigate(routes.aims.categories.list),
          icon: <UnorderedListOutlined rev="string" />,
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
      icon: <HeatMapOutlined rev="string" />,
      children: [
        {
          key: 61,
          label: "Усі сфери життя",
          onClick: () => navigate(routes.spheres.list),
          icon: <UnorderedListOutlined rev="string" />,
        },
        {
          key: 62,
          label: "Додати сферу життя",
          onClick: () => navigate(routes.spheres.add),
          icon: <PlusSquareOutlined rev="string" />,
        },
        {
          key: 63,
          label: "Статистика",
          onClick: () => navigate(routes.spheres.statistic),
          icon: <LineChartOutlined rev="string" />,
        },
      ],
    },
  ];

  return items;
};

export default useMenuItems;
