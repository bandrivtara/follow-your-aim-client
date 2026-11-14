import styled from "@emotion/styled";

const StyledHabitsCalendar = styled.div`
  & * {
    color: #403023 !important;
  }

  .fyi-ag-theme {
    height: calc(100vh - 245px);
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
    border-left: 1px solid #dde2eb;
  }

  .ag-header-cell-label {
    text-overflow: clip;
    overflow: visible;
    white-space: normal;
  }

  .day-header--today {
    background: #fff1dc;
    font-weight: 700;
  }

  .day-cell--today {
    background: rgba(250, 173, 20, 0.08);
    box-shadow:
      inset 2px 0 #faad14,
      inset -2px 0 #faad14;
  }

  .ag-row:hover .day-cell {
    background-color: rgba(82, 196, 26, 0.08);
  }

  .ag-root.ag-layout-normal,
  .ag-root-wrapper {
    overflow: visible;
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
      height: calc(100vh - 260px);
      min-height: 360px;
    }
  }
`;

export default StyledHabitsCalendar;
