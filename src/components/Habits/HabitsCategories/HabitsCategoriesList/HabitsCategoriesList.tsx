import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { IHabitsCategory } from "types/habitsCategories.types";
import { AgGridReact } from "ag-grid-react";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";

const HabitsCategoriesList = () => {
  const { data } = useGetHabitsCategoriesListQuery();
  const [rowData, setRowData] = useState<IHabitsCategory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(data);
    if (data) {
      setRowData(data);
    }
  }, [data]);

  return (
    <div>
      <Button onClick={() => navigate(routes.habit.categories.add)}>
        Додати категорію
      </Button>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={rowData}
          columnDefs={tableConfigs}
        ></AgGridReact>
      </div>
    </div>
  );
};

export default HabitsCategoriesList;
