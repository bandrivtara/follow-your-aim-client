import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import RelatedHabits from "./CellRenderer/RelatedHabits";
import RelatedAims from "./CellRenderer/RelatedAims";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.spheres.edit}/${data.id}`}>{value}</Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Повязані звички",
    field: "relatedHabits",
    cellRenderer: RelatedHabits,
    flex: 1,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: "Повязані цілі",
    field: "relatedAims",
    cellRenderer: RelatedAims,
    flex: 1,
    wrapText: true,
    autoHeight: true,
  },
];

export default tableConfigs;
