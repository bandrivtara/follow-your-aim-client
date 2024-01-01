import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { ColDef } from "ag-grid-community";
import { useGetHabitListQuery } from "store/services/habits";
import StyledTrackerCalendar from "./TrackerCalendar.styled";
import dayjs, { Dayjs } from "dayjs";
import { getFirstDayOfWeek } from "share/functions/getFirstDayOfWeek";
import FiltersBar from "./FiltersBar/FiltersBar";
import tableConfigs from "./tableConfigs";
import useIsMobile from "share/hooks/useIsMobile";
import { useGetHistoryQuery } from "store/services/history";
import { IHistoryDayRow } from "types/history.types";

export type ITrackerCalendarState = "tracking" | "planning";

const initConfigs = {
  currentDate: [getFirstDayOfWeek(), dayjs().endOf("week")],
};

const TrackerCalendar = () => {
  const isMobile = useIsMobile();
  const habitsData = useGetHabitListQuery();
  const gridRef = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<IHistoryDayRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [currentDate, setCurrentDate] = useState<(Dayjs | null)[]>(
    initConfigs.currentDate
  );

  const historyData = useGetHistoryQuery(
    dayjs(currentDate[0]).format("MM-YYYY")
  );

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
      historyData.data,
      currentDate,
      rowSortingType
    );

    setColumnDefs(newColumnDefs);
    setRowData(newRows);
  }, [
    currentDate,
    filteredCategory,
    calendarMode,
    habitsData,
    historyData,
    rowSortingType,
  ]);

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
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
        ></AgGridReact>
      </div>
    </StyledTrackerCalendar>
  );
};

export default TrackerCalendar;
