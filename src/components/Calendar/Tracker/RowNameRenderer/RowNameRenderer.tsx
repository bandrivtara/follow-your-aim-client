import { ICellRendererParams } from "ag-grid-community";
import { Link } from "react-router-dom";
import routes from "config/routes";
import StyledRowNameRenderer from "./RowNameRenderer.styled";
import { isNutritionHabitTitle } from "components/Nutrition/nutritionUtils";

const RowNameRenderer = ({ data, value }: ICellRendererParams) => {
  const getLink = () => {
    if (isNutritionHabitTitle(data.details.title)) {
      return routes.nutrition;
    }

    if (data.details.type === "tasksGroup") {
      return `${routes.taskGroups.edit}/${data.id}`;
    }

    return `${routes.habit.edit}/${data.id}`;
  };

  return (
    <StyledRowNameRenderer>
      <Link to={getLink()}>{value.title}</Link>
      {data.details.valueType === "number" && data.details.fields[0].unit}
      {data.details.valueType === "boolean" && "+/-"}
    </StyledRowNameRenderer>
  );
};

export default RowNameRenderer;
