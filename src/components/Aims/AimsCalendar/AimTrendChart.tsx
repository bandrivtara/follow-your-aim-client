import dayjs from "dayjs";
import { useMemo } from "react";
import { IAimTrendPoint } from "./aimRoadmapCalculations";

interface IProps {
  points: IAimTrendPoint[];
  targetValue?: number;
  title: string;
  unit?: string;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 184;
const CHART_PADDING = 18;

const formatValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const AimTrendChart = ({ points, targetValue, title, unit = "" }: IProps) => {
  const chart = useMemo(() => {
    const numericTarget = Number(targetValue);
    const allValues = [
      ...points.map(({ value }) => value),
      ...(Number.isFinite(numericTarget) ? [numericTarget] : []),
    ];
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue || 1;
    const valuePadding = Math.max(valueRange * 0.12, 0.5);
    const domainMin = minValue - valuePadding;
    const domainMax = maxValue + valuePadding;
    const domainRange = domainMax - domainMin;
    const firstDate = dayjs(points[0]?.date);
    const lastDate = dayjs(points[points.length - 1]?.date);
    const dateRange = Math.max(1, lastDate.diff(firstDate, "day"));
    const x = (date: string) =>
      CHART_PADDING +
      (dayjs(date).diff(firstDate, "day") / dateRange) *
        (CHART_WIDTH - CHART_PADDING * 2);
    const y = (value: number) =>
      CHART_HEIGHT -
      CHART_PADDING -
      ((value - domainMin) / domainRange) * (CHART_HEIGHT - CHART_PADDING * 2);
    const plottedPoints = points.map((point) => ({
      ...point,
      x: points.length === 1 ? CHART_WIDTH / 2 : x(point.date),
      y: y(point.value),
    }));

    return {
      path: plottedPoints
        .map(
          ({ x: pointX, y: pointY }, index) =>
            `${index ? "L" : "M"} ${pointX} ${pointY}`,
        )
        .join(" "),
      plottedPoints,
      targetY: Number.isFinite(numericTarget) ? y(numericTarget) : null,
      minValue,
      maxValue,
    };
  }, [points, targetValue]);

  const unitSuffix = unit ? ` ${unit}` : "";

  return (
    <div className="trend-chart-wrap">
      <svg
        className="trend-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`${title}: динаміка від ${formatValue(
          points[0].value,
        )}${unitSuffix} до ${formatValue(
          points[points.length - 1].value,
        )}${unitSuffix}`}
        preserveAspectRatio="none"
      >
        {[0.25, 0.5, 0.75].map((position) => (
          <line
            key={position}
            className="trend-grid-line"
            x1={CHART_PADDING}
            x2={CHART_WIDTH - CHART_PADDING}
            y1={CHART_HEIGHT * position}
            y2={CHART_HEIGHT * position}
          />
        ))}
        {chart.targetY !== null && (
          <line
            className="trend-target-line"
            x1={CHART_PADDING}
            x2={CHART_WIDTH - CHART_PADDING}
            y1={chart.targetY}
            y2={chart.targetY}
          />
        )}
        {chart.path && <path className="trend-line" d={chart.path} />}
        {chart.plottedPoints.map((point) => (
          <circle
            key={`${point.date}-${point.value}`}
            className="trend-point"
            cx={point.x}
            cy={point.y}
            r={5}
          >
            <title>
              {dayjs(point.date).format("D MMM")}: {formatValue(point.value)}
              {unitSuffix}
            </title>
          </circle>
        ))}
      </svg>
      <div className="trend-chart-caption">
        <span>{dayjs(points[0].date).format("D MMM")}</span>
        <span>
          {formatValue(points[points.length - 1].value)}
          {unitSuffix}
        </span>
        <span>{dayjs(points[points.length - 1].date).format("D MMM")}</span>
      </div>
    </div>
  );
};

export default AimTrendChart;
