import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { IGroup } from "types/english.types";
import { useGetGroupsListQuery } from "store/services/english";
import { AgGridReact } from "ag-grid-react";
import { Button } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";

const GroupsList = () => {
  const navigate = useNavigate();
  const { data } = useGetGroupsListQuery();
  const [rowData, setRowData] = useState<IGroup[]>([]);

  useEffect(() => {
    if (!data) return;

    const groupsList = [];
    for (const [groupId, groupData] of Object.entries(data)) {
      groupsList.push({ ...groupData, id: groupId });
    }

    if (data) {
      setRowData(groupsList);
    }
  }, [data]);

  return (
    <div>
      <Button onClick={() => navigate(routes.english.vocabulary.group.add)}>
        Додати групу
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

export default GroupsList;
