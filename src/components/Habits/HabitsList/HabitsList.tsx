import { useCallback, useMemo, useState } from "react";
import {
  useGetHabitListQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import { Button, message, Segmented, Space } from "antd";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import { AgGridReact } from "ag-grid-react";
import tableConfigs from "./tableConfigs";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";

const HabitsList = () => {
  const { data = [] } = useGetHabitListQuery();
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const [updateHabit] = useUpdateHabitMutation();
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();
  const toggleArchive = useCallback(
    async (habit: (typeof data)[number]) => {
      try {
        await updateHabit({
          id: habit.id,
          data: { isArchived: !habit.isArchived },
        }).unwrap();
        message.success(
          habit.isArchived ? "Звичку повернуто" : "Звичку архівовано",
        );
      } catch {
        message.error("Не вдалося змінити стан архіву");
      }
    },
    [updateHabit],
  );
  const columnDefs = useMemo(
    () => tableConfigs.getColDefs(habitsCategories.data || [], toggleArchive),
    [habitsCategories.data, toggleArchive],
  );
  const visibleHabits = useMemo(
    () => data.filter((habit) => Boolean(habit.isArchived) === showArchived),
    [data, showArchived],
  );

  return (
    <div>
      <Space wrap>
        <Button type="primary" onClick={() => navigate(routes.habit.add)}>
          Додати звичку
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
          rowData={visibleHabits}
          columnDefs={columnDefs}
          overlayNoRowsTemplate="Звичок поки немає"
        />
      </div>
    </div>
  );
};

export default HabitsList;
