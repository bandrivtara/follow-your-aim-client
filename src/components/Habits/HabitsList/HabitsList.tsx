import { useMemo } from "react";
import { useGetHabitListQuery } from "store/services/habits";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import { AgGridReact } from "ag-grid-react";
import tableConfigs from "./tableConfigs";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";
import { useGetSpheresListQuery } from "store/services/spheres";

const HabitsList = () => {
  const { data = [] } = useGetHabitListQuery();
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const spheres = useGetSpheresListQuery();
  const navigate = useNavigate();
  const columnDefs = useMemo(
    () =>
      tableConfigs.getColDefs(habitsCategories.data || [], spheres.data || []),
    [habitsCategories.data, spheres.data],
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
