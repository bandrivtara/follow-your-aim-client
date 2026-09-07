import styled from "@emotion/styled";

const StyledTasksOverview = styled.main`
  display: grid;
  gap: 18px;
  min-width: 0;

  .overview-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .summary-card {
    min-height: 104px;
    padding: 16px 18px;
    border: 1px solid var(--fya-border, #e4e8f0);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 10px 28px rgba(16, 24, 40, 0.05);
  }

  .summary-label {
    display: block;
    margin-bottom: 8px;
    color: #667085;
    font-size: 13px;
  }

  .summary-value {
    color: #172033;
    font-size: 28px;
    font-weight: 780;
    letter-spacing: -0.04em;
  }

  .filters-card {
    display: grid;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--fya-border, #e4e8f0);
    border-radius: 18px;
    background: #fff;
  }

  .filter-row {
    display: grid;
    grid-template-columns: minmax(220px, 1.5fr) repeat(3, minmax(150px, 0.7fr));
    gap: 12px;
  }

  .view-filter {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .group-list {
    display: grid;
    gap: 14px;
  }

  .group-card {
    overflow: hidden;
    border: 1px solid var(--fya-border, #e4e8f0);
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 10px 28px rgba(16, 24, 40, 0.05);
  }

  .group-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px 18px;
    border-bottom: 1px solid #edf0f5;
    background: linear-gradient(135deg, #fbfcff, #f6f7ff);
  }

  .group-heading h2 {
    margin: 0;
    color: #172033;
    font-size: 17px;
  }

  .task-table-header,
  .task-row {
    display: grid;
    grid-template-columns: minmax(240px, 2.2fr) minmax(130px, 1fr) minmax(
        120px,
        0.8fr
      ) minmax(110px, 0.75fr) minmax(120px, 0.8fr) auto;
    align-items: center;
    gap: 12px;
  }

  .task-table-header {
    padding: 10px 18px;
    color: #667085;
    background: #fbfcfe;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .task-row {
    min-height: 72px;
    padding: 12px 18px;
    border-top: 1px solid #edf0f5;
  }

  .task-row:first-of-type {
    border-top: 0;
  }

  .task-row--overdue {
    background: rgba(229, 72, 77, 0.035);
  }

  .task-title {
    margin: 0 0 5px;
    color: #172033;
    font-size: 15px;
    font-weight: 720;
    line-height: 1.3;
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    color: #667085;
    font-size: 12px;
  }

  .date-cell,
  .category-cell {
    color: #344054;
    font-size: 13px;
  }

  .overdue-label {
    color: #d92d20;
    font-weight: 700;
  }

  .task-actions {
    display: flex;
    justify-content: flex-end;
    gap: 2px;
  }

  .empty-state,
  .loading-state {
    display: grid;
    place-items: center;
    min-height: 240px;
    padding: 36px;
    text-align: center;
  }

  @media (max-width: 1100px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .task-table-header {
      display: none;
    }

    .task-row {
      grid-template-columns: minmax(0, 1.8fr) repeat(
          3,
          minmax(110px, 0.65fr)
        ) auto;
    }

    .category-cell {
      display: none;
    }
  }

  @media (max-width: 700px) {
    gap: 14px;

    .overview-header {
      align-items: stretch;
      flex-direction: column;
    }

    .overview-header button {
      width: 100%;
    }

    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .summary-card {
      min-height: 88px;
      padding: 13px;
    }

    .summary-value {
      font-size: 24px;
    }

    .filter-row {
      grid-template-columns: 1fr;
    }

    .group-heading {
      padding: 13px 14px;
    }

    .task-row {
      grid-template-columns: 1fr auto;
      gap: 10px;
      padding: 14px;
    }

    .date-cell,
    .priority-cell,
    .status-cell {
      grid-column: 1;
    }

    .task-actions {
      grid-column: 2;
      grid-row: 1 / span 4;
      align-items: center;
      flex-direction: column;
    }
  }
`;

export default StyledTasksOverview;
