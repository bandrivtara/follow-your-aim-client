import { RefObject, useCallback, useState } from "react";
import {
  Button,
  DatePicker,
  Radio,
  Select,
  TimeRangePickerProps,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { AgGridReact } from "ag-grid-react";
import dayjs, { Dayjs } from "dayjs";
import StyledFiltersBarRow from "./FiltersBar.styled";
import useIsMobile from "share/hooks/useIsMobile";
import { ITrackerCalendarState } from "../TrackerCalendar";
import { TrackerCategoryFilter } from "../rowFilters";
import {
  getTrackerDateRange,
  shiftTrackerDateRange,
  TrackerRangeMode,
} from "../calendarRange";

interface IProps {
  gridRef: RefObject<AgGridReact<any>>;
  setCurrentDate: (date: (Dayjs | null)[]) => void;
  currentDate: (Dayjs | null)[];
  setFilteredCategory: (filteredCategory: TrackerCategoryFilter) => void;
  filteredCategory: TrackerCategoryFilter;
  setRowSortingType: (rowSortingType: string) => void;
  rowSortingType: string;
  setCurrentMode: (mode: ITrackerCalendarState) => void;
  calendarMode: ITrackerCalendarState;
  rangeMode: TrackerRangeMode;
  setRangeMode: (mode: TrackerRangeMode) => void;
  onExport: () => void;
  exportDisabled?: boolean;
}

const FiltersBar = ({
  setCurrentDate,
  currentDate,
  setFilteredCategory,
  filteredCategory,
  setRowSortingType,
  rowSortingType,
  setCurrentMode,
  calendarMode,
  rangeMode,
  setRangeMode,
  gridRef,
  onExport,
  exportDisabled,
}: IProps) => {
  const isMobile = useIsMobile();
  const [showMoreFilters, setShowMoreFilters] = useState(!isMobile);

  const onPickerSelect = useCallback(
    (selectedDate: Dayjs) => {
      gridRef.current?.api.ensureColumnVisible(
        selectedDate.format("D"),
        "middle",
      );
    },
    [gridRef],
  );

  const onChange = (dates: null | (Dayjs | null)[]) => {
    if (!dates) return;
    setRangeMode("custom");
    setCurrentDate(dates);
  };

  const showRange = (mode: Exclude<TrackerRangeMode, "custom">) => {
    setRangeMode(mode);
    setCurrentDate(getTrackerDateRange(dayjs(), mode));
  };

  const showToday = () => {
    const mode =
      rangeMode === "custom" ? (isMobile ? "day" : "week") : rangeMode;
    showRange(mode);
  };

  const moveRange = (direction: -1 | 1) => {
    setCurrentDate(shiftTrackerDateRange(currentDate, rangeMode, direction));
  };

  const handleTrackingMode = () => setCurrentMode("tracking");
  const handlePlanningMode = () => {
    setCurrentMode("planning");
    setFilteredCategory("all");
  };

  const rangePresets: TimeRangePickerProps["presets"] = [
    { label: "Сьогодні", value: getTrackerDateRange(dayjs(), "day") },
    { label: "Поточний тиждень", value: getTrackerDateRange(dayjs(), "week") },
    { label: "Поточний місяць", value: getTrackerDateRange(dayjs(), "month") },
  ];

  return (
    <StyledFiltersBarRow>
      <div className="calendar-navigation">
        <Tooltip title="Попередній період">
          <Button
            aria-label="Попередній період"
            icon={<LeftOutlined />}
            onClick={() => moveRange(-1)}
          />
        </Tooltip>
        <Radio.Group
          value={rangeMode}
          optionType="button"
          buttonStyle="solid"
          onChange={(event) => showRange(event.target.value)}
        >
          <Radio.Button value="day">День</Radio.Button>
          <Radio.Button value="week">Тиждень</Radio.Button>
          <Radio.Button value="month">Місяць</Radio.Button>
        </Radio.Group>
        <Button icon={<CalendarOutlined />} onClick={showToday}>
          Сьогодні
        </Button>
        <Tooltip title="Наступний період">
          <Button
            aria-label="Наступний період"
            icon={<RightOutlined />}
            onClick={() => moveRange(1)}
          />
        </Tooltip>
        <DatePicker.RangePicker
          presets={isMobile ? [] : rangePresets}
          // @ts-ignore
          value={currentDate}
          allowClear={false}
          format="DD.MM.YYYY"
          onChange={onChange}
          onSelect={onPickerSelect}
        />
      </div>

      {isMobile && (
        <Button
          className="mobile-filters-toggle"
          icon={<FilterOutlined />}
          onClick={() => setShowMoreFilters((current) => !current)}
        >
          {showMoreFilters ? "Сховати додаткове" : "Фільтри й експорт"}
        </Button>
      )}

      <div
        className={`tracker-filters ${!showMoreFilters ? "tracker-filters--hidden" : ""}`}
      >
        <Select
          aria-label="Фільтр активностей"
          onChange={setFilteredCategory}
          value={filteredCategory}
        >
          <Select.Option value="all">Усі активності</Select.Option>
          <Select.Option value="only-planned">Тільки заплановані</Select.Option>
          <Select.Option value="grouped">Погруповані</Select.Option>
          <Select.Option value="daily">Денні</Select.Option>
          <Select.Option value="sport">Спорт</Select.Option>
        </Select>

        <Select
          aria-label="Сортування активностей"
          onChange={setRowSortingType}
          value={rowSortingType}
        >
          <Select.Option value="schedule-time">
            Сортувати за часом
          </Select.Option>
          <Select.Option value="alphabetic">
            Сортувати за алфавітом
          </Select.Option>
        </Select>

        <Radio.Group value={calendarMode} optionType="button">
          <Radio.Button value="tracking" onClick={handleTrackingMode}>
            Трекінг
          </Radio.Button>
          <Radio.Button value="planning" onClick={handlePlanningMode}>
            Планування
          </Radio.Button>
        </Radio.Group>

        <Button
          icon={<DownloadOutlined />}
          onClick={onExport}
          disabled={exportDisabled}
        >
          Завантажити витяг
        </Button>
      </div>
    </StyledFiltersBarRow>
  );
};

export default FiltersBar;
