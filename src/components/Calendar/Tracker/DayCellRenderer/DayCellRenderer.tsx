import { ICellRendererParams } from "ag-grid-community";
import StyledDayCellRenderer from "./DayCellRenderer.styled";
import { IDayCellEditor } from "../DayCellEditor/DayCellEditor";
import { trackerConfigs } from "./trackerConfigs";

const DayCellRenderer = ({
  value,
  data,
  ...rest
}: ICellRendererParams<IDayCellEditor>) => {
  const currentCellRendererData =
    value &&
    data &&
    data.details.valueType &&
    trackerConfigs?.[data.details.valueType]?.cellRenderer(value, data);

  const getProgressColor = () => {
    if (!currentCellRendererData) return "transparent";
    const { progress } = currentCellRendererData;

    if (progress >= 1) {
      return "#bae637";
    } else if (progress >= 0.5) {
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
