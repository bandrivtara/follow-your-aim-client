import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import GroupCellRenderer from "./GroupCellRenderer";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    filter: "agTextColumnFilter",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.english.vocabulary.word.edit}/${data.id}`}>
        {value}
      </Link>
    ),
  },
  {
    headerName: "Переклад",
    field: "translation",
    flex: 1,
  },
  {
    headerName: "Приклад",
    field: "example",
    flex: 1,
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Група",
    field: "group",
    cellRenderer: GroupCellRenderer,
    flex: 1,
  },
  {
    headerName: "Прогрес",
    field: "progress",
    flex: 1,
  },
];

export default tableConfigs;
