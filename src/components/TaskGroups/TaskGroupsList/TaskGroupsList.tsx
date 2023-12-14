import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { AgGridReact } from "ag-grid-react";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { ITaskGroups } from "types/taskGroups";

const TaskGroupsList = () => {
  const { data } = useGetTaskGroupListQuery();
  const [rowData, setRowData] = useState<ITaskGroups[]>([]);

  useEffect(() => {
    if (data) {
      console.log(data);
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

export default TaskGroupsList;
