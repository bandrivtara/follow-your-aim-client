import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { ColDef } from "ag-grid-community";
import { useGetActivityListQuery } from "../../store/services/activity";
import StyledCalendar from "./Calendar.styled";
import dayjs, { Dayjs } from "dayjs";
import { getFirstDayOfWeek } from "../../share/functions/getFirstDayOfWeek";
import FiltersBar from "./FiltersBar/FiltersBar";
import tableConfigs, { IActivityRow } from "./tableConfigs";
import useIsMobile from "../../share/hooks/useIsMobile";

export type ICalendarState = "tracking" | "planning";

const initConfigs = {
  currentDate: [getFirstDayOfWeek(), dayjs().endOf("week")],
};

const Calendar = () => {
  const isMobile = useIsMobile();
  const { data } = useGetActivityListQuery();
  const gridRef = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<IActivityRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [currentDate, setCurrentDate] = useState<(Dayjs | null)[]>(
    initConfigs.currentDate
  );
  const [filteredCategory, setFilteredCategory] = useState("all");
  const [calendarMode, setCurrentMode] = useState<ICalendarState>("tracking");

  useEffect(() => {
    if (isMobile) {
      setCurrentDate([dayjs(), dayjs()]);
    }
  }, [isMobile]);

  useEffect(() => {
    const newColumnDefs = tableConfigs.getColumnDefs(currentDate);
    const newRows = tableConfigs.getRows(
      data,
      currentDate,
      calendarMode,
      filteredCategory
    );

    setColumnDefs(newColumnDefs);
    setRowData(newRows);
  }, [currentDate, data, filteredCategory, calendarMode]);

  return (
    <StyledCalendar>
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
    </StyledCalendar>
  );
};

export default Calendar;
