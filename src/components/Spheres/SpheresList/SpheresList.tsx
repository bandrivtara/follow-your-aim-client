import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { ISphere } from "types/spheres.types";
import { useGetSpheresListQuery } from "store/services/spheres";
import { AgGridReact } from "ag-grid-react";
import { Button } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";

const SpheresList = () => {
  const navigate = useNavigate();
  const { data } = useGetSpheresListQuery();
  const [rowData, setRowData] = useState<ISphere[]>([]);

  useEffect(() => {
    if (data) {
      setRowData(data);
    }
  }, [data]);

  return (
    <div>
      <Button onClick={() => navigate(routes.spheres.add)}>
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

export default SpheresList;
