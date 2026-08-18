// @ts-nocheck

import { ICellRendererParams } from "ag-grid-community";
import StyledDayCellRenderer from "./DayCellRenderer.styled";
import { cellConfigs } from "../cellConfigs";

const DayCellRenderer = ({ value, data }: ICellRendererParams) => {
  const activityType = value?.type || data?.details?.type;
  const activityValueType = value?.valueType || data?.details?.valueType;
  const rendererConfig =
    activityType && activityValueType
      ? cellConfigs[activityType]?.[activityValueType]
      : undefined;
  const currentCellRendererData =
    value && data && rendererConfig?.cellRenderer(value, data);

  const getProgressColor = () => {
    if (!currentCellRendererData) return "transparent";
    const { progress } = currentCellRendererData;
    if (progress >= 100) {
      return "#d9f7ec";
    } else if (progress >= 50) {
      return "#fff1c7";
    } else if (progress > 0) {
      return "#ffe1dc";
    }
    return "transparent";
  };

  return (
    value && (
      <StyledDayCellRenderer
        progressColor={getProgressColor()}
        isInPlan={currentCellRendererData?.isPlanned}
      >
        {currentCellRendererData?.component}
      </StyledDayCellRenderer>
    )
  );
};

export default DayCellRenderer;
