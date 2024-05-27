import { useEffect, useState } from "react";
import { ICellRendererParams } from "ag-grid-community";
import StyledAimCellRenderer from "./AimCellRenderer.styled";
import dayjs from "dayjs";
import { IAim } from "types/aims.types";
import { aimRendererConfigs } from "./aimRendererConfigs";

interface IProgressBarStyles {
  width: number;
  marginLeft: number;
}

const AimCellRenderer = ({
  value,
  data,
  colDef,
}: ICellRendererParams<IAim>) => {
  const [progressBarStyles, setProgressBarStyles] =
    useState<IProgressBarStyles | null>(null);
  const [progressData, setProgressData] = useState({
    currentValue: 0,
    progress: 0,
  });
  const [currentText, setCurrentText] = useState(value);

  useEffect(() => {
    const getAimProgressBarStyles = () => {
      if (progressBarStyles || !colDef?.width || !data) return;
      const differenceInDays = dayjs(data.dateFrom).diff(
        dayjs(data.dateTo),
        "day"
      );
      const maxDifferenceDays = dayjs(
        dayjs(data.dateFrom).format("YYYY/MM")
      ).diff(dayjs(data.dateTo).add(1, "month").format("YYYY/MM"), "day");

      setProgressBarStyles({
        width: (+differenceInDays / maxDifferenceDays) * 100,
        marginLeft:
          (+dayjs(data.dateFrom).format("D") / 30) * colDef?.width - 5,
      });
    };

    const getAimProgressData = async () => {
      if (!data) return;
      let newProgressData = {
        currentValue: data?.currentValue || 0,
        progress: ((data.currentValue || 0) / data.finalAim) * 100,
      };

      if (data.isRelatedWithHabit) {
        const relatedHobbyConfigs = aimRendererConfigs.relatedHobby;
        if (data.calculationType === "lastMeasureAsc") {
          newProgressData = await relatedHobbyConfigs.lastValue(data, "asc");
        }
        if (data.calculationType === "lastMeasureDesc") {
          newProgressData = await relatedHobbyConfigs.lastValue(data, "desc");
        }
        if (data.calculationType === "sum") {
          console.log(data);
          newProgressData = await relatedHobbyConfigs.sumOfValues(data);
        }
      } else if (data.relatedList) {
        newProgressData = await aimRendererConfigs.relatedTaskGroup(data);
      }

      setProgressData(newProgressData);
    };

    getAimProgressBarStyles();
    getAimProgressData();
  }, [colDef?.width, data, progressBarStyles]);

  const handleTextOnMouseEnter = () => {
    if (!data) return;

    if (data.relatedList) {
      setCurrentText(
        `${progressData.progress.toFixed(2)}/${progressData.currentValue}%`
      );
    } else {
      setCurrentText(
        `${progressData.currentValue}/${
          data.finalAim
        } (${progressData.progress.toFixed(2)}%)`
      );
    }
  };
  const handleTextOnMouseLeave = () => {
    setCurrentText(value);
  };

  return (
    <StyledAimCellRenderer
      progressBarStyles={progressBarStyles}
      progressData={progressData}
    >
      <div
        className={value ? "aim-progress-bar" : ""}
        onMouseEnter={handleTextOnMouseEnter}
        onMouseLeave={handleTextOnMouseLeave}
      >
        <span className="progress-value" />
        <p>{currentText}</p>
      </div>
    </StyledAimCellRenderer>
  );
};

export default AimCellRenderer;
