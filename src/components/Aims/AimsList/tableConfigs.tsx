import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { IAimData } from "types/aims.types";
import { IAimsCategoryData } from "types/aimsCategories.types";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";
import { Button, Popconfirm } from "antd";

const getColDefs = (
  aimCategories: IAimsCategoryData[],
  onToggleArchive: (aim: IAimData) => void,
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
    headerName: "З",
    field: "dateFrom",
    flex: 1,
  },
  {
    headerName: "До",
    field: "dateTo",
    flex: 1,
  },
  {
    headerName: "Архів",
    width: 120,
    sortable: false,
    cellRenderer: ({ data }: ICellRendererParams<IAimData>) =>
      data && (
        <Popconfirm
          title={data.isArchived ? "Повернути ціль?" : "Архівувати ціль?"}
          description="Історія та Firebase-документ не видаляються."
          okText={data.isArchived ? "Повернути" : "Архівувати"}
          cancelText="Скасувати"
          onConfirm={() => onToggleArchive(data)}
        >
          <Button type="link">
            {data.isArchived ? "Повернути" : "В архів"}
          </Button>
        </Popconfirm>
      ),
  },
];

const tableConfigs = { getColDefs };

export default tableConfigs;
