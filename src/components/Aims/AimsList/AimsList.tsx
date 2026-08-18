import { useCallback, useMemo, useState } from "react";
import tableConfigs from "./tableConfigs";
import { AgGridReact } from "ag-grid-react";
import { useGetAimsListQuery, useUpdateAimMutation } from "store/services/aims";
import { Button, message, Segmented, Space } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";

const AimsList = () => {
  const navigate = useNavigate();
  const { data = [] } = useGetAimsListQuery();
  const [updateAim] = useUpdateAimMutation();
  const [showArchived, setShowArchived] = useState(false);
  const aimCategories = useGetAimsCategoriesListQuery();
  const toggleArchive = useCallback(
    async (aim: (typeof data)[number]) => {
      try {
        await updateAim({
          id: aim.id,
          data: { isArchived: !aim.isArchived },
        }).unwrap();
        message.success(aim.isArchived ? "Ціль повернуто" : "Ціль архівовано");
      } catch {
        message.error("Не вдалося змінити стан архіву");
      }
    },
    [updateAim],
  );
  const columnDefs = useMemo(
    () => tableConfigs.getColDefs(aimCategories.data || [], toggleArchive),
    [aimCategories.data, toggleArchive],
  );
  const visibleAims = useMemo(
    () => data.filter((aim) => Boolean(aim.isArchived) === showArchived),
    [data, showArchived],
  );

  return (
    <div>
      <Space wrap>
        <Button type="primary" onClick={() => navigate(routes.aims.add)}>
          Додати ціль
        </Button>
        <Segmented
          value={showArchived ? "archive" : "active"}
          options={[
            { label: "Активні", value: "active" },
            { label: "Архів", value: "archive" },
          ]}
          onChange={(value) => setShowArchived(value === "archive")}
        />
      </Space>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={visibleAims}
          columnDefs={columnDefs}
          overlayNoRowsTemplate="Цілей поки немає"
        />
      </div>
    </div>
  );
};

export default AimsList;
