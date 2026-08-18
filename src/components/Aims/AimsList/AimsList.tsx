import { useMemo } from "react";
import tableConfigs from "./tableConfigs";
import { AgGridReact } from "ag-grid-react";
import { useGetAimsListQuery } from "store/services/aims";
import { Button } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";

const AimsList = () => {
  const navigate = useNavigate();
  const { data = [] } = useGetAimsListQuery();
  const aimCategories = useGetAimsCategoriesListQuery();
  const columnDefs = useMemo(
    () => tableConfigs.getColDefs(aimCategories.data || []),
    [aimCategories.data],
  );

  return (
    <div>
      <Button onClick={() => navigate(routes.aims.add)}>Додати ціль</Button>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={data}
          columnDefs={columnDefs}
          overlayNoRowsTemplate="Цілей поки немає"
        />
      </div>
    </div>
  );
};

export default AimsList;
