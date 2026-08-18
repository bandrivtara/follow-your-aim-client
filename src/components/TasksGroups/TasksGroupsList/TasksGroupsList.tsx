import { AgGridReact } from "ag-grid-react";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import tableConfigs from "./tableConfigs";

const TasksGroupsList = () => {
  const { data = [] } = useGetTaskGroupListQuery();
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate(routes.taskGroups.add)}>
        Додати групу завдань
      </Button>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={data}
          columnDefs={tableConfigs}
          overlayNoRowsTemplate="Груп завдань поки немає"
        />
      </div>
    </div>
  );
};

export default TasksGroupsList;
