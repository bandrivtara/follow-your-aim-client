import styled from "@emotion/styled";

interface IStyledAimCellRenderer {
  progressBarStyles: { width: number; marginLeft: number } | null;
  progressData: { totalValue: number; progress: number };
}

const StyledAimCellRenderer = styled.div<IStyledAimCellRenderer>`
  .aim-progress-bar {
    position: relative;
    width: ${({ progressBarStyles }) => `${progressBarStyles?.width || 0}%`};
    height: 22px;
    margin-top: 3px;
    display: flex;
    align-items: center;
    padding-left: 6px;
    border: 1px solid black;
    border-radius: 4px;
    margin-left: ${({ progressBarStyles }) =>
      `${progressBarStyles?.marginLeft || 0}px`};

    p {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .progress-value {
      height: 100%;
      width: ${({ progressData }) => `${progressData.progress || 0}%`};
      background-color: green;
      opacity: 0.5;
      position: absolute;
      left: 0;
    }
  }
`;

export default StyledAimCellRenderer;
