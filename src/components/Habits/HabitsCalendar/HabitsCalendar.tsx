import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { ColDef } from "ag-grid-community";
import { useGetHabitListQuery } from "store/services/habits";
import StyledHabitsCalendar from "./HabitsCalendar.styled";
import dayjs, { Dayjs } from "dayjs";
import { getFirstDayOfWeek } from "share/functions/getFirstDayOfWeek";
import FiltersBar from "./FiltersBar/FiltersBar";
import tableConfigs, { IHabitRow } from "./tableConfigs";
import useIsMobile from "share/hooks/useIsMobile";
import {
  useGetHistoryListQuery,
  useGetHistoryQuery,
} from "store/services/history";

export type IHabitsCalendarState = "tracking" | "planning";

const initConfigs = {
  currentDate: [getFirstDayOfWeek(), dayjs().endOf("week")],
};

const HabitsCalendar = () => {
  const isMobile = useIsMobile();
  const habitsData = useGetHabitListQuery();
  const gridRef = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<IHabitRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [currentDate, setCurrentDate] = useState<(Dayjs | null)[]>(
    initConfigs.currentDate
  );

  const historyData = useGetHistoryQuery(
    dayjs(currentDate[0]).format("MM-YYYY")
  );

  const [filteredCategory, setFilteredCategory] = useState("all");
  const [calendarMode, setCurrentMode] =
    useState<IHabitsCalendarState>("tracking");

  useEffect(() => {
    if (isMobile) {
      setCurrentDate([dayjs(), dayjs()]);
    }
  }, [isMobile]);

  useEffect(() => {
    const newColumnDefs = tableConfigs.getColumnDefs(currentDate);
    const newRows = tableConfigs.getRows(
      habitsData.data,
      currentDate,
      calendarMode,
      filteredCategory,
      historyData.data
    );

    setColumnDefs(newColumnDefs);
    setRowData(newRows);
  }, [currentDate, filteredCategory, calendarMode, habitsData, historyData]);

  return (
    <StyledHabitsCalendar>
      <FiltersBar
        gridRef={gridRef}
        calendarMode={calendarMode}
        setCurrentMode={setCurrentMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        filteredCategory={filteredCategory}
        setFilteredCategory={setFilteredCategory}
      />
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
        ></AgGridReact>
      </div>
    </StyledHabitsCalendar>
  );
};

export default HabitsCalendar;
