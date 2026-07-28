import styled from "@emotion/styled";

interface IStyledDayCellRenderer {
  progressColor: string;
  isInPlan: boolean;
}

const StyledDayCellRenderer = styled.div<IStyledDayCellRenderer>`
  text-align: end;
  font-size: 8px;
  height: 100%;
  background-color: ${({ progressColor }) => progressColor};
  border: 1px solid ${({ isInPlan }) => (isInPlan ? "grey" : "transparent")};
  border-radius: 4px;
  display: flex;
    align-items: self-end;
    justify-content: end;
`;

export default StyledDayCellRenderer;
