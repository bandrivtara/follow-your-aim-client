import { RefObject, useCallback } from "react";
import {
  Col,
  DatePicker,
  Radio,
  Row,
  Select,
  TimeRangePickerProps,
} from "antd";
import { AgGridReact } from "ag-grid-react";
import dayjs, { Dayjs } from "dayjs";
import StyledFiltersBarRow from "./FiltersBar.styled";
import { ICalendarState } from "../Calendar";
import { getFirstDayOfWeek } from "../../../share/functions/getFirstDayOfWeek";
import useIsMobile from "../../../share/hooks/useIsMobile";

interface IProps {
  gridRef: RefObject<AgGridReact<any>>;
  setCurrentDate: (date: (Dayjs | null)[]) => void;
  currentDate: (Dayjs | null)[];
  setFilteredCategory: (filteredCategory: string) => void;
  filteredCategory: string;
  setCurrentMode: (mode: ICalendarState) => void;
  calendarMode: ICalendarState;
}

const FiltersBar = ({
  setCurrentDate,
  currentDate,
  setFilteredCategory,
  filteredCategory,
  setCurrentMode,
  calendarMode,
  gridRef,
}: IProps) => {
  const isMobile = useIsMobile();

  const onPickerSelect = useCallback(
    (selectedDate: Dayjs) => {
      if (gridRef.current?.api) {
        if (selectedDate.month() === dayjs().month()) {
          gridRef.current.api.ensureColumnVisible(`${dayjs().date()}`, "start");
        } else {
          gridRef.current.api.ensureColumnVisible("1", "start");
        }
      }
    },
    [gridRef]
  );

  const onChange = (dates: null | (Dayjs | null)[]) => {
    if (dates) {
      setCurrentDate(dates);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFilteredCategory(value);
  };

  const disabledDate = useCallback(
    (current: Dayjs) => {
      if (!currentDate[0]) {
        return false;
      }

      return currentDate[0].month() !== current.month();
    },
    [currentDate]
  );

  const handleTrackingMode = () => {
    setCurrentMode("tracking");
  };

  const handlePlanningMode = () => {
    setCurrentMode("planning");
    setFilteredCategory("all");
  };

  const rangePresets: TimeRangePickerProps["presets"] = [
    { label: "Сьогодні", value: [dayjs(), dayjs()] },
    { label: "Завтра", value: [dayjs().add(1, "d"), dayjs().add(1, "d")] },
    {
      label: "Поточний тиждень",
      value: [getFirstDayOfWeek(), dayjs().endOf("week")],
    },
    {
      label: "Поточний місяць",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
  ];

  return (
    <StyledFiltersBarRow>
      <div className="filters">
        <DatePicker.RangePicker
          disabledDate={disabledDate}
          presets={isMobile ? [] : rangePresets}
          // @ts-ignore
          value={currentDate}
          onChange={onChange}
          onSelect={onPickerSelect}
        />
        <Select
          defaultValue={"only-planned"}
          onChange={handleCategoryChange}
          value={filteredCategory}
        >
          <Select.Option value="all">Усі активності</Select.Option>
          <Select.Option value="only-planned">Тільки заплановані</Select.Option>
          <Select.Option value="grouped">Погруповані</Select.Option>
          <Select.Option value="daily">Денні</Select.Option>
          <Select.Option value="sport">Спорт</Select.Option>
        </Select>
      </div>
      <div className="mods">
        <Radio.Group value={calendarMode}>
          <Radio.Button value="tracking" onClick={handleTrackingMode}>
            Трекінг
          </Radio.Button>
          <Radio.Button value="planning" onClick={handlePlanningMode}>
            Планування
          </Radio.Button>
        </Radio.Group>
      </div>
    </StyledFiltersBarRow>
  );
};

export default FiltersBar;
