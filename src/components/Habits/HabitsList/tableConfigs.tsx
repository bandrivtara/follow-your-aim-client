import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { IHabitsCategoryData } from "types/habitsCategories.types";
import { IHabitData } from "types/habits.types";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";

const getColDefs = (
  habitsCategories: IHabitsCategoryData[],
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
];

const tableConfigs = { getColDefs };

export default tableConfigs;
