import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import RelatedWords from "./RelatedWords";

const tableConfigs: ColDef[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams) => (
      <Link to={`${routes.english.vocabulary.group.edit}/${data.id}`}>
        {value}
      </Link>
    ),
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Повязані слова",
    field: "relatedWords",
    cellRenderer: RelatedWords,
    flex: 1,
    wrapText: true,
    autoHeight: true,
  },
];

export default tableConfigs;
