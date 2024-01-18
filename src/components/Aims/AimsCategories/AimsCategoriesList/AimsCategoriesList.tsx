import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { IAimsCategory } from "types/aimsCategories.types";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import { AgGridReact } from "ag-grid-react";

const AimsCategoriesList = () => {
  const { data } = useGetAimsCategoriesListQuery();
  const [rowData, setRowData] = useState<IAimsCategory[]>([]);

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

export default AimsCategoriesList;
