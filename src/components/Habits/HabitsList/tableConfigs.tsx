import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Button, Popconfirm } from "antd";
import { IHabitsCategoryData } from "types/habitsCategories.types";
import { IHabitData } from "types/habits.types";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";
import { getLifeArea, getLifeAreaTitle } from "config/lifeAreas";

const getColDefs = (
  habitsCategories: IHabitsCategoryData[],
  onToggleArchive: (habit: IHabitData) => void,
  isMobile = false,
): ColDef<IHabitData>[] => {
  const columns: ColDef<IHabitData>[] = [
    {
      headerName: "Назва",
      field: "title",
      minWidth: isMobile ? 150 : 190,
      pinned: isMobile ? "left" : undefined,
      cellRenderer: ({ data, value }: ICellRendererParams<IHabitData>) =>
        data && <Link to={`${routes.habit.edit}/${data.id}`}>{value}</Link>,
    },
    {
      headerName: "Опис",
      field: "description",
      minWidth: 220,
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
      minWidth: 190,
      flex: 1,
    },
    {
      headerName: "Сфера життя",
      field: "lifeArea",
      minWidth: 190,
      cellRenderer: ({ value }: ICellRendererParams<IHabitData>) => {
        const area = getLifeArea(value);
        return (
          <span
            className="life-area-chip"
            style={{ "--area-color": area?.color || "#98a2b3" } as any}
          >
            {getLifeAreaTitle(value)}
          </span>
        );
      },
      flex: 1,
    },
    {
      headerName: "Складність",
      field: "complexity",
      width: 120,
      cellRenderer: ({ value }: ICellRendererParams<IHabitData>) => (
        <span className="complexity-chip">{value || "—"}</span>
      ),
    },
    {
      headerName: "Тип звички",
      field: "valueType",
      valueFormatter: ({ value }) =>
        value === "measures" ? "Вимірювана" : "Так / ні",
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Запланований час",
      field: "scheduleTime",
      minWidth: 155,
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

  return isMobile ? [columns[0], columns[3], columns[6], columns[7]] : columns;
};

const tableConfigs = { getColDefs };

export default tableConfigs;
