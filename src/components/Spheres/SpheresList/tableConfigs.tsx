import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Tag } from "antd";
import { IHabitData } from "types/habits.types";
import { IAimData } from "types/aims.types";
import { ISphereData } from "types/spheres.types";

const getColDefs = (
  habits: IHabitData[],
  aims: IAimData[],
): ColDef<ISphereData>[] => [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams<ISphereData>) =>
      data && <Link to={`${routes.spheres.edit}/${data.id}`}>{value}</Link>,
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Пов’язані звички",
    cellRenderer: ({ data }: ICellRendererParams<ISphereData>) =>
      habits
        .filter((habit) => habit.sphereId === data?.id)
        .map((habit) => (
          <Tag key={habit.id} color="processing">
            {habit.title}
          </Tag>
        )),
    flex: 1,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: "Пов’язані цілі",
    cellRenderer: ({ data }: ICellRendererParams<ISphereData>) =>
      aims
        .filter((aim) => aim.sphereId === data?.id)
        .map((aim) => (
          <Tag key={aim.id} color="processing">
            {aim.title}
          </Tag>
        )),
    flex: 1,
    wrapText: true,
    autoHeight: true,
  },
];

const tableConfigs = { getColDefs };

export default tableConfigs;
