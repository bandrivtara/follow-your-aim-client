import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Button, Popconfirm } from "antd";
import { IHabitsCategoryData } from "types/habitsCategories.types";
import { IHabitData } from "types/habits.types";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";
import { getLifeAreaTitle } from "config/lifeAreas";

const getColDefs = (
  habitsCategories: IHabitsCategoryData[],
  onToggleArchive: (habit: IHabitData) => void,
): ColDef<IHabitData>[] => [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams<IHabitData>) =>
      data && <Link to={`${routes.habit.edit}/${data.id}`}>{value}</Link>,
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Категорія",
    valueGetter: ({ data }) =>
      getRelationTitle(
        data?.habitsCategoryId,
        habitsCategories,
        "Без категорії",
      ),
    flex: 1,
  },
  {
    headerName: "Сфера життя",
    field: "lifeArea",
    valueFormatter: ({ value }) => getLifeAreaTitle(value),
    flex: 1,
  },
  {
    headerName: "Складність",
    field: "complexity",
    width: 120,
  },
  {
    headerName: "Тип звички",
    field: "valueType",
    valueFormatter: ({ value }) =>
      value === "measures" ? "Вимірювана" : "Так / ні",
    flex: 1,
  },
  {
    headerName: "Запланований час",
    field: "scheduleTime",
    flex: 1,
    valueFormatter: ({ value }) =>
      Array.isArray(value) && value.length >= 2
        ? `${String(value[0]).padStart(2, "0")}:${String(value[1]).padStart(
            2,
            "0",
          )}`
        : "—",
  },
  {
    headerName: "Архів",
    width: 120,
    sortable: false,
    cellRenderer: ({ data }: ICellRendererParams<IHabitData>) =>
      data && (
        <Popconfirm
          title={data.isArchived ? "Повернути звичку?" : "Архівувати звичку?"}
          description="Записи трекера та Firebase-документ не видаляються."
          okText={data.isArchived ? "Повернути" : "Архівувати"}
          cancelText="Скасувати"
          onConfirm={() => onToggleArchive(data)}
        >
          <Button type="link">
            {data.isArchived ? "Повернути" : "В архів"}
          </Button>
        </Popconfirm>
      ),
  },
];

const tableConfigs = { getColDefs };

export default tableConfigs;
