import { Link } from "react-router-dom";
import routes from "../../../config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.aims.edit}/${data.id}`}>{value}</Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    minWidth: 500,
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
