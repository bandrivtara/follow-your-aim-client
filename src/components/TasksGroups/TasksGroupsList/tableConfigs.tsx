import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.taskGroups.edit}/${data.id}`}>{value}</Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    minWidth: 500,
  },
  {
    headerName: "Кількість",
    field: "tasksStore",
    cellRenderer: ({ value }: ICellRendererParams) =>
      value && value[0] && value.length,
    minWidth: 500,
  },
];

export default tableConfigs;
