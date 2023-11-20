import styled from "@emotion/styled";

const StyledCalendar = styled.div`
  .fyi-ag-theme {
    height: 100vh - 200px;
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
`;

export default StyledCalendar;
