import styled from "@emotion/styled";

const StyledHabitsCalendar = styled.div`
  max-width: 1880px;
  min-width: 0;
  margin: 0 auto;

  .tracker-header {
    margin-bottom: 16px;
  }

  .tracker-mode-switch {
    display: flex;
    flex-shrink: 0;
    padding: 4px;
    gap: 4px;
    border: 1px solid var(--fya-border);
    border-radius: 14px;
    background: #fff;
  }

  .tracker-mode-switch .ant-radio-button-wrapper {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    height: auto;
    border: 0;
    border-radius: 10px;
    font-weight: 650;
  }

  .tracker-mode-switch .ant-radio-button-wrapper::before {
    display: none;
  }

  .tracker-mode-switch--planning .ant-radio-button-wrapper-checked {
    background: #b56a00;
    color: #fff;
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

  @media only screen and (max-width: 1199px) {
    .fyi-ag-theme {
      height: calc(100vh - 500px);
      height: calc(100dvh - 500px);
      min-height: 360px;
    }
  }

  @media only screen and (max-width: 768px) {
    .ag-popup-editor {
      top: -1px !important;
      transform: translate(-50%, 0) !important;
      width: calc(100vw - 50px);
    }

    .fyi-ag-theme {
      height: calc(100vh - 306px);
      height: calc(100dvh - 306px);
      min-height: 360px;
    }

    .tracker-header > [role="radiogroup"],
    .tracker-mode-switch {
      width: 100%;
    }
  }
`;

export default StyledHabitsCalendar;
