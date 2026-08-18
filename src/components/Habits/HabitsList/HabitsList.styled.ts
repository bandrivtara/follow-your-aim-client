import styled from "@emotion/styled";

const StyledHabitsList = styled.main`
  max-width: 1740px;
  margin: 0 auto;

  .habits-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 14px;
    padding: 14px;
    border: 1px solid var(--fya-border);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: var(--fya-shadow);
  }

  .habits-toolbar-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .habits-search {
    width: min(320px, 40vw);
  }

  .habits-count {
    color: var(--fya-muted);
    font-size: 13px;
    font-weight: 550;
  }

  .fyi-ag-theme {
    height: calc(100vh - 245px);
    min-height: 480px;
  }

  .life-area-chip,
  .complexity-chip {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    padding: 3px 8px;
    border-radius: 999px;
    background: #f1f3f8;
    font-size: 12px;
    font-weight: 550;
  }

  .life-area-chip::before {
    width: 7px;
    height: 7px;
    margin-right: 6px;
    border-radius: 50%;
    background: var(--area-color, #98a2b3);
    content: "";
  }

  .complexity-chip {
    min-width: 30px;
    justify-content: center;
    color: var(--fya-primary-dark);
    background: #eef0ff;
  }

  @media only screen and (max-width: 768px) {
    padding-top: 12px;

    .habits-toolbar,
    .habits-toolbar-group {
      align-items: stretch;
      flex-direction: column;
    }

    .habits-toolbar-group,
    .habits-toolbar-group > *,
    .habits-search {
      width: 100%;
    }

    .fyi-ag-theme {
      height: calc(100vh - 360px);
      min-height: 390px;
    }
  }
`;

export default StyledHabitsList;
