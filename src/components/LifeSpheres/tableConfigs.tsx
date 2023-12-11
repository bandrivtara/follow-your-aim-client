import { Link } from "react-router-dom";
import routes from "../../config/routes";
import RelatedActivities from "./cellRenderer/RelatedActivities";
import { ColDef, ICellRendererParams } from "ag-grid-community";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.lifeSpheres.edit}/${data.id}`}>{value}</Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    minWidth: 500,
  },
  {
    headerName: "Повязані звички",
    field: "relatedActivities",
    cellRenderer: RelatedActivities,
    flex: 1,
    wrapText: true,
    autoHeight: true,
  },
];

export default tableConfigs;
