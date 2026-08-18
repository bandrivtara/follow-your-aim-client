import { useMemo } from "react";
import tableConfigs from "./tableConfigs";
import { useGetSpheresListQuery } from "store/services/spheres";
import { AgGridReact } from "ag-grid-react";
import { Button } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";
import { useGetHabitListQuery } from "store/services/habits";
import { useGetAimsListQuery } from "store/services/aims";

const SpheresList = () => {
  const navigate = useNavigate();
  const { data = [] } = useGetSpheresListQuery();
  const habits = useGetHabitListQuery();
  const aims = useGetAimsListQuery();
  const columnDefs = useMemo(
    () => tableConfigs.getColDefs(habits.data || [], aims.data || []),
    [aims.data, habits.data],
  );

  return (
    <div>
      <Button onClick={() => navigate(routes.spheres.add)}>
        Додати сферу життя
      </Button>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={data}
          columnDefs={columnDefs}
          overlayNoRowsTemplate="Сфер життя поки немає"
        />
      </div>
    </div>
  );
};

export default SpheresList;
