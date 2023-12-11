import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { AgGridReact } from "ag-grid-react";
import { useGetAimsListQuery } from "../../../store/services/aims";
import { IAim } from "../../../types/aim.types";

const AimsList = () => {
  const { data } = useGetAimsListQuery();
  const [rowData, setRowData] = useState<IAim[]>([]);

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

export default AimsList;
