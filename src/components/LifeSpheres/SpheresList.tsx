import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { ILifeSphere } from "../../types/lifeSpheres.types";
import { useGetSpheresListQuery } from "../../store/services/lifeSpheres";
import { AgGridReact } from "ag-grid-react";

const Sphere = () => {
  const { data } = useGetSpheresListQuery();
  const [rowData, setRowData] = useState<ILifeSphere[]>([]);

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

export default Sphere;
