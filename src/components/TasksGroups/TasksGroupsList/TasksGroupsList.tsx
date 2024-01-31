import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { AgGridReact } from "ag-grid-react";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { ITasksGroup } from "types/taskGroups";

const TasksGroupsList = () => {
  const { data } = useGetTaskGroupListQuery();
  const [rowData, setRowData] = useState<ITasksGroup[]>([]);

  useEffect(() => {
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

export default TasksGroupsList;
