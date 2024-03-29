import { ICellRendererParams } from "ag-grid-community";
import { Link } from "react-router-dom";
import routes from "config/routes";

const RowNameRenderer = ({ data, value }: ICellRendererParams) => {
  return <Link to={`${routes.habit.edit}/${data.id}`}>{value.title}</Link>;
};

export default RowNameRenderer;
