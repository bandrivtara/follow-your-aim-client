import { Link } from "react-router-dom";
import routes from "config/routes";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { ITasksGroup } from "types/taskGroups";

const tableConfigs: ColDef<ITasksGroup>[] = [
  {
    headerName: "Назва",
    field: "title",
    cellRenderer: ({ data, value }: ICellRendererParams<ITasksGroup>) =>
      data && <Link to={`${routes.taskGroups.edit}/${data.id}`}>{value}</Link>,
  },
  {
    headerName: "Опис",
    field: "description",
    flex: 1,
  },
  {
    headerName: "Завдань у сховищі",
    valueGetter: ({ data }) => data?.tasksStore?.length || 0,
    flex: 1,
  },
  {
    headerName: "Етапів",
    valueGetter: ({ data }) => data?.tasksStages?.length || 0,
    flex: 1,
  },
];

export default tableConfigs;
