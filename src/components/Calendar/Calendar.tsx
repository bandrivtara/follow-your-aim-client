import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef } from "ag-grid-community";
import { useGetActivityListQuery } from "../../store/services/activity";
import StyledCalendar from "./Calendar.styled";
import DayCellRenderer from "./DayCellRenderer/DayCellRenderer";
import DayCellEditor from "./DayCellEditor/DayCellEditor";
import ActivityCellRenderer from "./ActivityCellRenderer";
import {
  Col,
  DatePicker,
  Radio,
  Row,
  Select,
  Switch,
  TimeRangePickerProps,
} from "antd";
import dayjs, { Dayjs } from "dayjs";

export type ICalendarState = "tracking" | "planning";

const Calendar = () => {
  const { data } = useGetActivityListQuery();

  const gridRef = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);

  const [currentDate, setCurrentDate] = useState<(Dayjs | null)[]>([
    dayjs(),
    dayjs(),
  ]);
  const [filteredCategory, setFilteredCategory] = useState("only-planned");
  const [calendarMode, setCurrentMode] = useState<ICalendarState>("tracking");

  useEffect(() => {
    if (currentDate[0]?.toDate() !== currentDate[1]?.toDate()) {
      setFilteredCategory("all");
    }
  }, [currentDate]);

  const getDaysOfMonth = (month: number, year: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayObject = {
        month,
        year,
        day: day.toString(),
        weekday: dayjs(`${year}-${month}-${day}`).locale("uk").format("ddd"),
      };
      daysArray.push(dayObject);
    }

    return daysArray;
  };

  const onPickerSelect = useCallback((selectedDate: Dayjs) => {
    if (gridRef.current?.api) {
      if (selectedDate.month() === dayjs().month()) {
        gridRef.current.api.ensureColumnVisible(`${dayjs().date()}`, "start");
      } else {
        gridRef.current.api.ensureColumnVisible("1", "start");
      }
    }
  }, []);

  useEffect(() => {
    if (!currentDate[0] || !currentDate[1]) return;
    const days = getDaysOfMonth(
      currentDate[0].month() + 1,
      currentDate[0].year()
    );
    const dayCols: ColDef[] = [];

    days.forEach((day) => {
      if (
        currentDate[0] &&
        currentDate[1] &&
        parseFloat(day.day) >= currentDate[0].date() &&
        parseFloat(day.day) <= currentDate[1].date()
      ) {
        dayCols.push({
          field: day.day,
          headerName: `${day.day} ${day.weekday}`,
          minWidth: 60,
          editable: true,
          cellEditorPopup: true,
          cellRenderer: DayCellRenderer,
          cellEditor: DayCellEditor,
          cellClass: "day-cell",
          flex: 1,
        });
      }
    });

    const newColumnDefs: ColDef[] = [
      {
        field: "activityData",
        headerName: "Назва",
        cellRenderer: ActivityCellRenderer,
        pinned: "left",
        width: 220,
      },
    ];

    setColumnDefs([...newColumnDefs, ...dayCols]);

    const newRows = data
      ?.map((activityData, index) => {
        const activityRows = {
          id: activityData.id,
          activityData: activityData.details,
          scheduleTime: activityData.details.scheduleTime,
          currentDate: {
            year: currentDate[0] && currentDate[0].year(),
            month: currentDate[0] && currentDate[0].month() + 1,
          },
          category: activityData.details.category,
          calendarMode,
        };

        if (
          activityData.history &&
          currentDate[0] &&
          activityData.history[currentDate[0].year()]
        ) {
          return {
            ...activityRows,
            ...activityData.history[currentDate[0].year()][
              currentDate[0].month() + 1
            ],
          };
        }

        return activityRows;
      })
      .sort((a, b) => {
        const timeA = a.activityData.scheduleTime;
        const timeB = b.activityData.scheduleTime;

        if (!timeA && !timeB) {
          return 0; // No scheduleTime for both, maintain order
        } else if (!timeA) {
          return 1; // No scheduleTime for A, move it after B
        } else if (!timeB) {
          return -1; // No scheduleTime for B, move it after A
        } else {
          if (timeA[0] !== timeB[0]) {
            return +timeA[0] - +timeB[0]; // Compare hours
          } else {
            return +timeA[1] - +timeB[1]; // Compare minutes
          }
        }
      })
      .filter((activity) => {
        if (filteredCategory === "all") {
          return activity;
        } else if (
          filteredCategory === "only-planned" &&
          currentDate[0] &&
          currentDate[1] &&
          currentDate[0].date() - currentDate[1].date() === 0
        ) {
          // @ts-ignore
          const currentActivityData = activity[`${currentDate[0].date()}`];

          return (
            currentActivityData &&
            (currentActivityData.value ||
              currentActivityData.isPlanned ||
              currentActivityData.plannedValue ||
              currentActivityData.isComplete)
          );
        } else {
          return activity.category === filteredCategory;
        }
      });

    if (newRows) {
      setRowData(newRows);
    }
  }, [currentDate, data, filteredCategory, calendarMode]);

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

  const onOpenChange = (open: boolean) => {
    if (open) {
      setCurrentDate([null, null]);
    }
  };

  const handleTrackingMode = () => {
    setCurrentMode("tracking");
    setCurrentDate([dayjs(), dayjs()]);
    setFilteredCategory("only-planned");
  };

  const handlePlanningMode = () => {
    setCurrentMode("planning");
    setFilteredCategory("all");
  };

  const getFirstDayOfWeek = () => {
    return dayjs().get("D") < 7
      ? dayjs().startOf("month")
      : dayjs().startOf("week");
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
    <StyledCalendar>
      <Row className="filters-bar" gutter={8}>
        <Col>
          <DatePicker.RangePicker
            disabledDate={disabledDate}
            presets={rangePresets}
            // @ts-ignore
            value={currentDate}
            onChange={onChange}
            onSelect={onPickerSelect}
            onOpenChange={onOpenChange}
          />
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            defaultValue={"only-planned"}
            onChange={handleCategoryChange}
            value={filteredCategory}
          >
            <Select.Option value="all">Усі категорії</Select.Option>
            <Select.Option value="only-planned">
              Тільки заплановані
            </Select.Option>
            <Select.Option value="morning">Ранкові</Select.Option>
            <Select.Option value="daily">Денні</Select.Option>
            <Select.Option value="sport">Спорт</Select.Option>
            <Select.Option value="meal">Харчування</Select.Option>
          </Select>
        </Col>
        <Col>
          <Radio.Group value={calendarMode}>
            <Radio.Button value="tracking" onClick={handleTrackingMode}>
              Трекінг
            </Radio.Button>
            <Radio.Button value="planning" onClick={handlePlanningMode}>
              Планування
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <div
        className="ag-theme-alpine fyi-ag-theme"
        style={{ height: "600px", boxSizing: "border-box" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
        ></AgGridReact>
      </div>
    </StyledCalendar>
  );
};

export default Calendar;
