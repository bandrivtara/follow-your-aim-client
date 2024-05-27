import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import StyledAimCalendar from "./AimCalendar.styled";
import dayjs, { Dayjs } from "dayjs";
import { ColDef } from "ag-grid-community";
import { DatePicker } from "antd";
import tableConfigs from "./tableConfigs";
import { useGetAimsListQuery } from "store/services/aims";

export type IAimCalendarState = "tracking" | "planning";

const initConfigs = {
  currentDate: [dayjs(dayjs().startOf("y")), dayjs().endOf("y")],
};

const AimCalendar = () => {
  const allAims = useGetAimsListQuery();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [monthsDates, setMonthsDates] = useState<(Dayjs | null)[]>(
    initConfigs.currentDate
  );

  useEffect(() => {
    const newColumnDefs = tableConfigs.getColumnDefs(monthsDates);
    const newRows = tableConfigs.getRows(allAims.data);
    console.log(newRows);
    setColumnDefs(newColumnDefs);
    setRowData(newRows);
  }, [allAims, monthsDates]);

  const onChange = (dates: null | (Dayjs | null)[]) => {
    if (dates) {
      setMonthsDates(dates);
    }
  };

  return (
    <StyledAimCalendar>
      <DatePicker.RangePicker
        picker="month"
        // @ts-ignore
        value={monthsDates}
        onChange={onChange}
        format={"MMM YYYY"}
      />

      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
        ></AgGridReact>
      </div>
    </StyledAimCalendar>
  );
};

export default AimCalendar;
