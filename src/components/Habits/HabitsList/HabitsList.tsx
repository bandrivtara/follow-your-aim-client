import { useMemo } from "react";
import { useGetHabitListQuery } from "store/services/habits";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import { AgGridReact } from "ag-grid-react";
import tableConfigs from "./tableConfigs";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";

const HabitsList = () => {
  const { data = [] } = useGetHabitListQuery();
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const navigate = useNavigate();
  const columnDefs = useMemo(
    () => tableConfigs.getColDefs(habitsCategories.data || []),
    [habitsCategories.data],
  );

  return (
    <div>
      <Button onClick={() => navigate(routes.habit.add)}>Додати звичку</Button>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={data}
          columnDefs={columnDefs}
          overlayNoRowsTemplate="Звичок поки немає"
        />
      </div>
    </div>
  );
};

export default HabitsList;
