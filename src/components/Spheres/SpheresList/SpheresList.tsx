import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { ISphere } from "types/spheres.types";
import { useGetSpheresListQuery } from "store/services/spheres";
import { AgGridReact } from "ag-grid-react";

const SpheresList = () => {
  const { data } = useGetSpheresListQuery();
  const [rowData, setRowData] = useState<ISphere[]>([]);

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

export default SpheresList;
