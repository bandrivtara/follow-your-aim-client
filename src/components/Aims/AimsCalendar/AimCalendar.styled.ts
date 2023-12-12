import styled from "@emotion/styled";

const StyledCalendar = styled.div`
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

  .day-cell {
    padding: 0;
  }

  .filters-bar {
    display: flex;
  }
`;

export default StyledCalendar;
