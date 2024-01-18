import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { IHabitsCategory } from "types/habitsCategories.types";
import { AgGridReact } from "ag-grid-react";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";

const HabitsCategoriesList = () => {
  const { data } = useGetHabitsCategoriesListQuery();
  const [rowData, setRowData] = useState<IHabitsCategory[]>([]);

  useEffect(() => {
    console.log(data);
    if (data) {
      setRowData(data);
    }
  }, [data]);

  return (
    <div>
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
