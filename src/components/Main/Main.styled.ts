import styled from "@emotion/styled";

const StyledMain = styled.main`
  padding: 20px 0 8px;

  .dashboard-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .dashboard-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
    gap: 16px;
    align-items: start;
  }

  .side-column {
    display: grid;
    gap: 16px;
  }

  .metric-card,
  .dashboard-card {
    border: 1px solid #ece5dd;
    border-radius: 16px;
    box-shadow: 0 10px 28px rgba(64, 48, 35, 0.07);
  }

  .metric-card {
    min-height: 126px;
  }

  .metric-value {
    margin: 6px 0 0;
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 700;
    line-height: 1;
    color: #403023;
  }

  .schedule-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0ebe6;
  }

  .schedule-row:last-child {
    border-bottom: 0;
  }

  @media only screen and (max-width: 980px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media only screen and (max-width: 600px) {
    padding-top: 10px;

    .dashboard-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .dashboard-actions > button {
      flex: 1;
    }
  }
`;

export default StyledMain;
