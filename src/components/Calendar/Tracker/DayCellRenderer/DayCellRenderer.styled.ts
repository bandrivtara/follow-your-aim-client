import styled from "@emotion/styled";

interface IStyledDayCellRenderer {
  progressColor: string;
  isInPlan: boolean;
}

const StyledDayCellRenderer = styled.div<IStyledDayCellRenderer>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-width: 0;
  height: calc(100% - 8px);
  margin: 4px;
  padding: 3px 7px;
  color: #344054;
  text-align: end;
  border: 1px solid ${({ isInPlan }) => (isInPlan ? "#cbd2df" : "transparent")};
  border-radius: 8px;
  background-color: ${({ progressColor }) => progressColor};
  font-size: 11px;
  font-weight: 550;
`;

export default StyledDayCellRenderer;
