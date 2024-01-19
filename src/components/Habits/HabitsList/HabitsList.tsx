import { useEffect, useState } from "react";
import { useGetHabitListQuery } from "store/services/habits";
import { IHabitData } from "types/habits.types";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import { AgGridReact } from "ag-grid-react";
import tableConfigs from "./tableConfigs";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";
import { ColDef } from "ag-grid-community";

const Habit = () => {
  const { data } = useGetHabitListQuery();
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const [rowData, setRowData] = useState<IHabitData[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (habitsCategories.data && data) {
      const newColumnDefs = tableConfigs.getColDefs(habitsCategories.data);
      setRowData(data);
      setColumnDefs(newColumnDefs);
    }
  }, [data, habitsCategories]);

  return (
    <div>
      <Button onClick={() => navigate(routes.habit.add)}>Додати звичку</Button>
      {data && (
        <div className="ag-theme-material fyi-ag-theme">
          <AgGridReact
            rowHeight={30}
            rowData={rowData}
            columnDefs={columnDefs}
          ></AgGridReact>
        </div>
      )}
    </div>
  );
};

export default Habit;
