import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import AimCategoryCellRenderer from "./CellRenderer/AimCategoryCellRenderer";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`/${routes.aims.edit}/${data.id}`}>{value}</Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Категорія",
    field: "aimsCategory",
    cellRenderer: AimCategoryCellRenderer,
    flex: 1,
  },
  {
    headerName: "З...",
    field: "dateFrom",
    flex: 1,
  },
  {
    headerName: "До...",
    field: "dateTo",
    flex: 1,
  },
];

export default tableConfigs;
