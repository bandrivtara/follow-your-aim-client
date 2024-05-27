import { ICellRendererParams } from "ag-grid-community";
import StyledDayCellRenderer from "./DayCellRenderer.styled";
import { IDayData, cellConfigs } from "../cellConfigs";

const DayCellRenderer = ({ value, data }: ICellRendererParams<IDayData>) => {
  const activityType = value?.type;
  const activityValueType = value?.valueType;

  const currentCellRendererData =
    value &&
    data &&
    activityType &&
    cellConfigs[activityType][activityValueType]?.cellRenderer(value, data);

  const getProgressColor = () => {
    if (!currentCellRendererData) return "transparent";
    const { progress } = currentCellRendererData;

    if (progress >= 100) {
      return "#bae637";
    } else if (progress >= 50) {
      return "#fffb8f";
    } else if (progress > 0) {
      return "#ff9c6e";
    } else {
      return "transparent";
    }
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
