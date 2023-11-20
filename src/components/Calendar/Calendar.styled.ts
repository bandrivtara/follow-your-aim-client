import styled from "@emotion/styled";

const StyledCalendar = styled.div`
  .fyi-ag-theme {
    height: calc(100vh - 200px);
    box-sizing: border-box;
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

  .ag-root.ag-layout-normal,
  .ag-root-wrapper {
    overflow: visible;
  }

  .ag-popup-editor {
    width: 924px;
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
  }
`;

export default StyledCalendar;
