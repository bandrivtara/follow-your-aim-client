import styled from "@emotion/styled";

interface IStyledAimCellRenderer {
  progressBarStyles: { width: number; marginLeft: number } | null;
  progressData: { currentValue: number; progress: number };
}

const clampPercent = (value: number | undefined) =>
  Math.max(0, Math.min(100, value || 0));

const StyledAimCellRenderer = styled.div<IStyledAimCellRenderer>`
  width: 100%;

  .aim-progress-bar {
    position: relative;
    display: flex;
    align-items: center;
    width: ${({ progressBarStyles }) =>
      `${clampPercent(progressBarStyles?.width)}%`};
    min-width: 92px;
    height: 34px;
    margin-left: ${({ progressBarStyles }) =>
      `${Math.max(0, progressBarStyles?.marginLeft || 0)}px`};
    overflow: hidden;
    color: #293056;
    border: 1px solid rgba(91, 101, 245, 0.3);
    border-radius: 10px;
    outline: none;
    background: linear-gradient(135deg, #f4f5ff 0%, #eef8f5 100%);
    box-shadow: 0 4px 10px rgba(63, 73, 175, 0.08);
    cursor: default;
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease,
      transform 160ms ease;
  }

  .aim-progress-bar:hover,
  .aim-progress-bar:focus-visible {
    z-index: 2;
    border-color: rgba(91, 101, 245, 0.7);
    box-shadow: 0 6px 16px rgba(63, 73, 175, 0.18);
    transform: translateY(-1px);
  }

  .aim-progress-bar p {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 0 10px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .progress-value {
    position: absolute;
    inset: 0 auto 0 0;
    width: ${({ progressData }) =>
      `${clampPercent(progressData.progress)}%`};
    background: linear-gradient(
      90deg,
      rgba(91, 101, 245, 0.28),
      rgba(25, 173, 131, 0.34)
    );
    transition: width 220ms ease;
  }
`;

export default StyledAimCellRenderer;
