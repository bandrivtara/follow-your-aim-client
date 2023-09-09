import styled from "@emotion/styled";

interface IStyledDayCellRenderer {
  progressColor: string;
  isInPlan: boolean;
}

const StyledDayCellRenderer = styled.div<IStyledDayCellRenderer>`
  text-align: center;
  height: 100%;
  background-color: ${({ progressColor }) => progressColor};
  border: 1px solid ${({ isInPlan }) => (isInPlan ? "#000" : "transparent")};
`;

export default StyledDayCellRenderer;
