import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { CellClickedEvent, ColDef } from "ag-grid-community";
import { useGetHabitListQuery } from "store/services/habits";
import StyledTrackerCalendar from "./TrackerCalendar.styled";
import dayjs, { Dayjs } from "dayjs";
import { getFirstDayOfWeek } from "share/functions/getFirstDayOfWeek";
import FiltersBar from "./FiltersBar/FiltersBar";
import tableConfigs from "./tableConfigs";
import useIsMobile from "share/hooks/useIsMobile";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import { IHistoryDayRow } from "types/history.types";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { Drawer } from "@mui/material";
import DayCellEditor from "./DayCellEditor/DayCellEditor";

export type ITrackerCalendarState = "tracking" | "planning";

const initConfigs = {
  currentDate: [getFirstDayOfWeek(), dayjs().endOf("week")],
};

const TrackerCalendar = () => {
  const isMobile = useIsMobile();
  const habitsData = useGetHabitListQuery();
  const taskGroupsData = useGetTaskGroupListQuery();
  const gridRef = useRef<AgGridReact>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [editableCell, setEditableCell] = useState<CellClickedEvent | null>(
    null
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<(Dayjs | null)[]>(
    initConfigs.currentDate
  );
  const historyData = useGetHistoryBetweenDatesQuery([
    dayjs(dayjs(currentDate[0]).format("YYYY-MM")).unix(),
    dayjs(dayjs(currentDate[1]).format("YYYY-MM")).unix(),
  ]);

  const [rowData, setRowData] = useState<IHistoryDayRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [filteredCategory, setFilteredCategory] = useState("all");
  const [rowSortingType, setRowSortingType] = useState("schedule-time");
  const [calendarMode, setCurrentMode] =
    useState<ITrackerCalendarState>("tracking");

  useEffect(() => {
    if (isMobile) {
      setCurrentDate([dayjs(), dayjs()]);
    }
  }, [isMobile]);

  useEffect(() => {
    const newColumnDefs = tableConfigs.getColumnDefs(currentDate, calendarMode);
    const newRows = tableConfigs.getRows(
      habitsData.data,
      taskGroupsData.data,
      historyData.data,
      rowSortingType
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
  ]);

  const onCellDoubleClicked = (event: CellClickedEvent) => {
    setEditableCell(event);
    setIsEditOpen(true);
  };

  const toggleCloseEditCell = () => {
    setIsEditOpen(false);
  };

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
      />
      <div className="ag-theme-material fyi-ag-theme" ref={gridContainerRef}>
        <AgGridReact
          rowHeight={30}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellDoubleClicked={onCellDoubleClicked}
        ></AgGridReact>
        <Drawer
          open={isEditOpen}
          onClose={toggleCloseEditCell}
          container={isMobile ? undefined : gridContainerRef.current}
          elevation={2}
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
