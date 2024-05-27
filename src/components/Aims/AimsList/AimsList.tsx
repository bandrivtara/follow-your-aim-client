import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { AgGridReact } from "ag-grid-react";
import { useGetAimsListQuery } from "store/services/aims";
import { IAim } from "types/aims.types";
import { Button } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";

const AimsList = () => {
  const navigate = useNavigate();
  const { data } = useGetAimsListQuery();
  const [rowData, setRowData] = useState<IAim[]>([]);

  useEffect(() => {
    if (data) {
      setRowData(data);
    }
  }, [data]);

  return (
    <div>
      <Button onClick={() => navigate(routes.aims.add)}>Додати ціль</Button>
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

export default AimsList;
