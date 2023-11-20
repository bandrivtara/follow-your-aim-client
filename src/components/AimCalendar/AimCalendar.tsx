import { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import StyledAimCalendar from "./AimCalendar.styled";
import tableConfigs from "./tableConfigs";

export type IAimCalendarState = "tracking" | "planning";

const AimCalendar = () => {
  const gridRef = useRef<AgGridReact>(null);

  return (
    <StyledAimCalendar>
      <div className="ag-theme-alpine fyi-ag-theme">
        <AgGridReact
          ref={gridRef}
          // rowData={tableConfigs.ROWS}
          // columnDefs={tableConfigs.COLUMN_DEFS}
        ></AgGridReact>
      </div>
    </StyledAimCalendar>
  );
};

export default AimCalendar;
