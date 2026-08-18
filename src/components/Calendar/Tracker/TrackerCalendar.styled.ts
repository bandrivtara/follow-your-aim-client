import styled from "@emotion/styled";

const StyledHabitsCalendar = styled.div`
  max-width: 1880px;
  margin: 0 auto;

  .tracker-header {
    margin-bottom: 16px;
  }

  .tracker-mode-pill {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 7px 12px;
    color: var(--fya-primary-dark);
    border: 1px solid #dfe3ff;
    border-radius: 999px;
    background: #f1f3ff;
    font-size: 12px;
    font-weight: 750;
  }

  .tracker-mode-pill--planning {
    color: #9a6200;
    border-color: #f8dda6;
    background: #fff8e8;
  }

  .fyi-ag-theme {
    height: calc(100vh - 300px);
    min-height: 470px;
    box-sizing: border-box;
    position: relative;
  }

  .MuiDrawer-paper {
    position: absolute;
  }

  .MuiDrawer-root {
    overflow: hidden;
    position: absolute;
  }

  .ag-header-cell {
    padding: 0 10px;
  }

  .ag-header-cell,
  .ag-cell {
    border-left: 1px solid #edf0f5;
  }

  .ag-header-cell-label {
    text-overflow: clip;
    overflow: visible;
    white-space: normal;
  }

  .day-header--today {
    color: var(--fya-primary-dark);
    background: #eef0ff;
    font-weight: 800;
  }

  .day-cell--today {
    background: rgba(91, 108, 249, 0.055);
    box-shadow:
      inset 2px 0 rgba(91, 108, 249, 0.75),
      inset -2px 0 rgba(91, 108, 249, 0.75);
  }

  .ag-row:hover .day-cell {
    background-color: rgba(91, 108, 249, 0.08);
  }

  .ag-row {
    cursor: pointer;
  }

  .ag-popup-editor {
    width: auto;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  .day-cell {
    padding: 0;
  }

  .filters-bar {
    display: flex;
  }

  @media only screen and (max-width: 768px) {
    .ag-popup-editor {
      top: -1px !important;
      transform: translate(-50%, 0) !important;
      width: calc(100vw - 50px);
    }

    .fyi-ag-theme {
      height: calc(100vh - 306px);
      min-height: 360px;
    }

    .tracker-mode-pill {
      align-self: flex-start;
    }
  }
`;

export default StyledHabitsCalendar;
