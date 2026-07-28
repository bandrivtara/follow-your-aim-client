import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { IAimData } from "types/aims.types";
import { IAimsCategoryData } from "types/aimsCategories.types";
import { ISphereData } from "types/spheres.types";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";

const getColDefs = (
  aimCategories: IAimsCategoryData[],
  spheres: ISphereData[],
): ColDef<IAimData>[] => [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams<IAimData>) =>
      data && <Link to={`${routes.aims.edit}/${data.id}`}>{value}</Link>,
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Категорія",
    valueGetter: ({ data }) =>
      getRelationTitle(data?.aimsCategoryId, aimCategories, "Без категорії"),
    flex: 1,
  },
  {
    headerName: "Сфера життя",
    valueGetter: ({ data }) =>
      getRelationTitle(data?.sphereId, spheres, "Без сфери"),
    flex: 1,
  },
  {
    headerName: "З",
    field: "dateFrom",
    flex: 1,
  },
  {
    headerName: "До",
    field: "dateTo",
    flex: 1,
  },
];

const tableConfigs = { getColDefs };

export default tableConfigs;
