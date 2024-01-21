import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { IAimsCategory } from "types/aimsCategories.types";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import routes from "config/routes";

const AimsCategoriesList = () => {
  const navigate = useNavigate();
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
      <Button onClick={() => navigate(routes.aims.categories.add)}>
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

export default AimsCategoriesList;
