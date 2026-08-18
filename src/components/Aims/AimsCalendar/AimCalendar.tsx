import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import StyledAimCalendar from "./AimCalendar.styled";
import dayjs, { Dayjs } from "dayjs";
import { ColDef } from "ag-grid-community";
import { Button, DatePicker, Space } from "antd";
import tableConfigs from "./tableConfigs";
import { useGetAimsListQuery } from "store/services/aims";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import { getAimsDateRange } from "./aimCalendarCalculations";

export type IAimCalendarState = "tracking" | "planning";

const AimCalendar = () => {
  const allAims = useGetAimsListQuery();
  const taskGroups = useGetTaskGroupListQuery();
  const aimCategories = useGetAimsCategoriesListQuery();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [monthsDates, setMonthsDates] = useState<(Dayjs | null)[]>(() => [
    dayjs().startOf("year"),
    dayjs().endOf("year"),
  ]);

  useEffect(() => {
    const newColumnDefs = tableConfigs.getColumnDefs(monthsDates);
    const newRows = tableConfigs.getRows(
      allAims.data,
      taskGroups.data,
      monthsDates,
      aimCategories.data,
    );
    setColumnDefs(newColumnDefs);
    setRowData(newRows);
  }, [aimCategories.data, allAims.data, monthsDates, taskGroups.data]);

  const onChange = (dates: null | (Dayjs | null)[]) => {
    if (dates) {
      setMonthsDates(dates);
    }
  };

  const showAllAims = () => {
    const aimsRange = getAimsDateRange(
      allAims.data?.filter((aim) => !aim.isArchived),
    );
    aimsRange && setMonthsDates(aimsRange);
  };

  const showCurrentYear = () => {
    setMonthsDates([dayjs().startOf("year"), dayjs().endOf("year")]);
  };

  return (
    <StyledAimCalendar>
      <Space wrap>
        <DatePicker.RangePicker
          picker="month"
          // @ts-ignore
          value={monthsDates}
          onChange={onChange}
          format="MMM YYYY"
        />
        <Button onClick={showAllAims} disabled={!allAims.data?.length}>
          Показати всі цілі
        </Button>
        <Button onClick={showCurrentYear}>Поточний рік</Button>
      </Space>

      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          overlayNoRowsTemplate="У вибраному періоді цілей немає"
        />
      </div>
    </StyledAimCalendar>
  );
};

export default AimCalendar;
