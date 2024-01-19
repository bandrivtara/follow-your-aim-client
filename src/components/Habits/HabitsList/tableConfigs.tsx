import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import HabitCategoryCellRenderer from "./CellRenderer/HabitCategoryCellRenderer";
import { IHabitsCategory } from "types/habitsCategories.types";
import { IHabitData } from "types/habits.types";

const getColDefs = (
  habitsCategories: IHabitsCategory[]
): ColDef<IHabitData>[] => [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.habit.edit}/${data.id}`}>{value}</Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Категорія",
    field: "category",
    cellRenderer: HabitCategoryCellRenderer,
    cellRendererParams: {
      habitsCategories,
    },
    flex: 1,
  },
  {
    headerName: "Тип звички",
    field: "valueType",
    flex: 1,
  },
  {
    headerName: "Запланований час",
    field: "scheduleTime",
    flex: 1,
    cellRenderer: ({ value }: any) => value && `${value[0]}:${value[1]}`,
  },
];

const tableConfigs = { getColDefs };

export default tableConfigs;
