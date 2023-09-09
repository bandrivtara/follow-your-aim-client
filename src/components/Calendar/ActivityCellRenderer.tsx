import { ICellRendererParams } from "ag-grid-community";
import { Link } from "react-router-dom";
import routes from "../../config/routes";

const ActivityCellRenderer = ({ data, value }: ICellRendererParams) => {
  return <Link to={`${routes.activity.edit}/${data.id}`}>{value.title}</Link>;
};

export default ActivityCellRenderer;
