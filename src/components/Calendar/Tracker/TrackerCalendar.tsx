import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { CellClickedEvent, ColDef } from "ag-grid-community";
import { useGetHabitListQuery } from "store/services/habits";
import StyledTrackerCalendar from "./TrackerCalendar.styled";
import dayjs, { Dayjs } from "dayjs";
import FiltersBar from "./FiltersBar/FiltersBar";
import tableConfigs from "./tableConfigs";
import useIsMobile from "share/hooks/useIsMobile";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import { IHistoryDayRow } from "types/history.types";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { Drawer } from "@mui/material";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import { TrackerCategoryFilter } from "./rowFilters";
import {
  getTrackerDateRange,
  isDateInTrackerRange,
  TrackerRangeMode,
} from "./calendarRange";
import { buildTrackerExport, downloadTrackerExport } from "./trackerExport";
import { useSearchParams } from "react-router-dom";

export type ITrackerCalendarState = "tracking" | "planning";

const TrackerCalendar = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const habitsData = useGetHabitListQuery();
  const taskGroupsData = useGetTaskGroupListQuery();
  const gridRef = useRef<AgGridReact>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [editableCell, setEditableCell] = useState<CellClickedEvent | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const requestedRangeMode = searchParams.get("view");
  const initialRangeMode: Exclude<TrackerRangeMode, "custom"> =
    requestedRangeMode === "day" ||
    requestedRangeMode === "week" ||
    requestedRangeMode === "month"
      ? requestedRangeMode
      : isMobile
        ? "day"
        : "week";
  const [rangeMode, setRangeMode] =
    useState<TrackerRangeMode>(initialRangeMode);
  const [currentDate, setCurrentDate] = useState<(Dayjs | null)[]>(
    getTrackerDateRange(dayjs(), initialRangeMode),
  );
  const historyData = useGetHistoryBetweenDatesQuery([
    dayjs(dayjs(currentDate[0]).format("YYYY-MM")).unix(),
    dayjs(dayjs(currentDate[1]).format("YYYY-MM")).unix(),
  ]);

  const [rowData, setRowData] = useState<IHistoryDayRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [filteredCategory, setFilteredCategory] =
    useState<TrackerCategoryFilter>("all");
  const [rowSortingType, setRowSortingType] = useState("schedule-time");
  const [calendarMode, setCurrentMode] =
    useState<ITrackerCalendarState>("tracking");

  useEffect(() => {
    const newColumnDefs = tableConfigs.getColumnDefs(
      currentDate,
      calendarMode,
      isMobile,
    );
    const newRows = tableConfigs.getRows(
      habitsData.data,
      taskGroupsData.data,
      historyData.data,
      rowSortingType,
      filteredCategory,
    );
    setColumnDefs(newColumnDefs);
    setRowData(newRows);
  }, [
    currentDate,
    filteredCategory,
    calendarMode,
    habitsData,
    rowSortingType,
    taskGroupsData.data,
    historyData.data,
    isMobile,
  ]);

  useEffect(() => {
    if (!isDateInTrackerRange(dayjs(), currentDate)) return;

    const animationFrame = requestAnimationFrame(() => {
      gridRef.current?.api.ensureColumnVisible(dayjs().format("D"), "middle");
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [columnDefs, currentDate, rowData]);

  const onCellClicked = (event: CellClickedEvent) => {
    if (!event.colDef.field || event.colDef.field === "details") return;
    setEditableCell(event);
    setIsEditOpen(true);
  };

  const toggleCloseEditCell = () => {
    setIsEditOpen(false);
  };

  const handleExport = useCallback(() => {
    const [dateFrom, dateTo] = currentDate;
    if (!dateFrom || !dateTo) return;

    const content = buildTrackerExport({
      dateFrom,
      dateTo,
      history: (historyData.data || []) as Record<string, any>[],
      habits: habitsData.data || [],
      taskGroups: taskGroupsData.data || [],
    });
    downloadTrackerExport(
      content,
      `tracker-${dateFrom.format("YYYY-MM-DD")}--${dateTo.format(
        "YYYY-MM-DD",
      )}.md`,
    );
  }, [currentDate, habitsData.data, historyData.data, taskGroupsData.data]);

  return (
    <StyledTrackerCalendar>
      <FiltersBar
        gridRef={gridRef}
        calendarMode={calendarMode}
        setCurrentMode={setCurrentMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        filteredCategory={filteredCategory}
        setFilteredCategory={setFilteredCategory}
        rowSortingType={rowSortingType}
        setRowSortingType={setRowSortingType}
        rangeMode={rangeMode}
        setRangeMode={setRangeMode}
        onExport={handleExport}
        exportDisabled={historyData.isFetching}
      />
      <div className="ag-theme-material fyi-ag-theme" ref={gridContainerRef}>
        <AgGridReact
          key={rangeMode}
          rowHeight={30}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellClicked={onCellClicked}
          overlayNoRowsTemplate="Немає активностей для вибраного фільтра"
        ></AgGridReact>
        <Drawer
          open={isEditOpen}
          onClose={toggleCloseEditCell}
          anchor="right"
          container={isMobile ? undefined : gridContainerRef.current}
          elevation={2}
          PaperProps={{
            sx: {
              width: isMobile ? "100%" : "min(480px, 92vw)",
            },
          }}
        >
          <DayCellEditor
            editableCell={editableCell}
            stopEditing={toggleCloseEditCell}
          />
        </Drawer>
      </div>
    </StyledTrackerCalendar>
  );
};

export default TrackerCalendar;
