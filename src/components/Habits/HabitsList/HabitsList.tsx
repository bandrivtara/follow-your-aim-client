import { useCallback, useMemo, useState } from "react";
import {
  useGetHabitListQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import { Alert, Button, Input, message, Segmented } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import { AgGridReact } from "ag-grid-react";
import tableConfigs from "./tableConfigs";
import { useGetHabitsCategoriesListQuery } from "store/services/habitsCategories";
import StyledHabitsList from "./HabitsList.styled";
import useIsMobile from "share/hooks/useIsMobile";

const HabitsList = () => {
  const habits = useGetHabitListQuery();
  const isMobile = useIsMobile();
  const { data = [] } = habits;
  const habitsCategories = useGetHabitsCategoriesListQuery();
  const [updateHabit] = useUpdateHabitMutation();
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
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
    () =>
      tableConfigs.getColDefs(
        habitsCategories.data || [],
        toggleArchive,
        isMobile,
      ),
    [habitsCategories.data, isMobile, toggleArchive],
  );
  const visibleHabits = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("uk");
    return data.filter((habit) => {
      if (Boolean(habit.isArchived) !== showArchived) return false;
      if (!normalizedSearch) return true;
      return [habit.title, habit.description]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase("uk").includes(normalizedSearch),
        );
    });
  }, [data, search, showArchived]);

  return (
    <StyledHabitsList>
      <header className="page-header">
        <div>
          <h1 className="page-title">Звички</h1>
          <p className="page-subtitle">
            Керуй активними звичками, їх складністю, часом і категоріями.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(routes.habit.add)}
        >
          Додати звичку
        </Button>
      </header>
      <div className="habits-toolbar">
        <div className="habits-toolbar-group">
          <Segmented
            value={showArchived ? "archive" : "active"}
            options={[
              { label: "Активні", value: "active" },
              { label: "Архів", value: "archive" },
            ]}
            onChange={(value) => setShowArchived(value === "archive")}
          />
          <span className="habits-count">
            {visibleHabits.length} {showArchived ? "в архіві" : "активних"}
          </span>
        </div>
        <Input
          className="habits-search"
          allowClear
          prefix={<SearchOutlined />}
          value={search}
          placeholder="Знайти звичку"
          aria-label="Пошук звичок"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {(habits.isError || habitsCategories.isError) && (
        <Alert
          showIcon
          type="error"
          message="Не вдалося завантажити звички"
          action={
            <Button
              size="small"
              onClick={() => {
                habits.refetch();
                habitsCategories.refetch();
              }}
            >
              Повторити
            </Button>
          }
        />
      )}
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={44}
          headerHeight={48}
          rowData={visibleHabits}
          columnDefs={columnDefs}
          loadingOverlayComponentParams={{ loadingMessage: "Завантаження…" }}
          overlayNoRowsTemplate="Звичок поки немає"
        />
      </div>
    </StyledHabitsList>
  );
};

export default HabitsList;
