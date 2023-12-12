import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { ICategory } from "types/categories.types";
import { useGetCategoriesListQuery } from "store/services/categories";
import { AgGridReact } from "ag-grid-react";

const Category = () => {
  const { data } = useGetCategoriesListQuery();
  const [rowData, setRowData] = useState<ICategory[]>([]);

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

export default Category;
