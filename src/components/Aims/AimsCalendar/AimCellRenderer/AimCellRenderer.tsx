import { useEffect, useState } from "react";
import { ICellRendererParams } from "ag-grid-community";
import StyledAimCellRenderer from "./AimCellRenderer.styled";
import dayjs from "dayjs";
import { IAim } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import { aimRendererConfigs } from "./aimRendererConfigs";

interface IProgressBarStyles {
  width: number;
  marginLeft: number;
}

type IAimCellRendererData = IAim & {
  taskGroupsData?: ITasksGroup[];
  calendarDateFrom?: string;
  calendarDateTo?: string;
};

const AimCellRenderer = ({
  value,
  data,
  colDef,
}: ICellRendererParams<IAimCellRendererData>) => {
  const [progressBarStyles, setProgressBarStyles] =
    useState<IProgressBarStyles | null>(null);
  const [progressData, setProgressData] = useState({
    currentValue: 0,
    progress: 0,
  });
  const [currentText, setCurrentText] = useState(value);

  useEffect(() => {
    if (!colDef?.width || !data) return;
    const dateFrom = data.calendarDateFrom || data.dateFrom;
    const dateTo = data.calendarDateTo || data.dateTo;
    const differenceInDays = dayjs(dateFrom).diff(dayjs(dateTo), "day");
    const maxDifferenceDays = dayjs(dayjs(dateFrom).format("YYYY/MM")).diff(
      dayjs(dateTo).add(1, "month").format("YYYY/MM"),
      "day",
    );

    setProgressBarStyles({
      width: (+differenceInDays / maxDifferenceDays) * 100,
      marginLeft: (+dayjs(dateFrom).format("D") / 30) * colDef.width - 5,
    });
  }, [colDef?.width, data]);

  useEffect(() => {
    let isCurrent = true;
    const getAimProgressData = async () => {
      if (!data) return;
      let newProgressData = {
        currentValue: data.currentValue || 0,
        progress: data.finalAim
          ? ((data.currentValue || 0) / data.finalAim) * 100
          : 0,
      };

      if (data.isRelatedWithHabit) {
        const relatedHabitConfigs = aimRendererConfigs.relatedHabit;
        if (
          data.calculationType === "lastMeasureAsc" ||
          data.calculationType === "lastMeasureDesc"
        ) {
          newProgressData = await relatedHabitConfigs.lastValue(data);
        }
        if (data.calculationType === "sum") {
          newProgressData = await relatedHabitConfigs.sumOfValues(data);
        }
      } else if (data.aimType === "list") {
        newProgressData = aimRendererConfigs.relatedTaskGroup(
          data,
          data.taskGroupsData,
        );
      }

      if (isCurrent) setProgressData(newProgressData);
    };

    getAimProgressData();
    return () => {
      isCurrent = false;
    };
  }, [data]);

  const handleTextOnMouseEnter = () => {
    if (!data) return;

    if (data.aimType === "list") {
      setCurrentText(
        `${progressData.progress.toFixed(2)}/${progressData.currentValue}%`,
      );
    } else {
      setCurrentText(
        `${progressData.currentValue}/${
          data.finalAim
        } (${progressData.progress.toFixed(2)}%)`,
      );
    }
  };
  const handleTextOnMouseLeave = () => {
    setCurrentText(value);
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(progressData.progress || 0)),
  );
  const progressLabel = data
    ? `${data.title}: виконано ${progressPercent}%`
    : undefined;

  return (
    <StyledAimCellRenderer
      progressBarStyles={progressBarStyles}
      progressData={progressData}
    >
      <div
        className={value ? "aim-progress-bar" : ""}
        onMouseEnter={handleTextOnMouseEnter}
        onMouseLeave={handleTextOnMouseLeave}
        onFocus={handleTextOnMouseEnter}
        onBlur={handleTextOnMouseLeave}
        role={value ? "progressbar" : undefined}
        aria-label={value ? progressLabel : undefined}
        aria-valuemin={value ? 0 : undefined}
        aria-valuemax={value ? 100 : undefined}
        aria-valuenow={value ? progressPercent : undefined}
        tabIndex={value ? 0 : -1}
        title={progressLabel}
      >
        <span className="progress-value" />
        <p>{currentText}</p>
      </div>
    </StyledAimCellRenderer>
  );
};

export default AimCellRenderer;
