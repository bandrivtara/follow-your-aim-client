import styled from "@emotion/styled";

const StyledMain = styled.main`
  max-width: 1680px;
  margin: 0 auto;
  padding: 6px 0 8px;

  .dashboard-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .dashboard-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .daily-guidance-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .guidance-card {
    overflow: hidden;
    border: 1px solid var(--fya-border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: var(--fya-shadow);
  }

  .guidance-card .MuiCardContent-root {
    padding: 18px;
  }

  .guidance-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .guidance-icon {
    display: grid;
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 12px;
  }

  .guidance-icon--focus {
    color: #d97706;
    background: rgba(245, 158, 11, 0.12);
  }

  .guidance-icon--recovery {
    color: #0f9f8f;
    background: rgba(20, 184, 166, 0.12);
  }

  .guidance-card .MuiButton-root {
    margin-top: 10px;
  }

  .recovery-habit-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  .content-grid {
    display: grid;
    grid-template-areas:
      "goals goals plan plan water water"
      "week week week balance balance balance";
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
    align-items: stretch;
  }

  .dashboard-flow,
  .side-column {
    display: contents;
  }

  .week-card {
    grid-area: week;
  }

  .balance-card {
    grid-area: balance;
  }

  .goals-card {
    grid-area: goals;
  }

  .plan-card {
    grid-area: plan;
  }

  .daily-counters {
    grid-area: water;
  }

  .metric-card,
  .dashboard-card {
    overflow: hidden;
    border: 1px solid var(--fya-border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: var(--fya-shadow);
  }

  .metric-card {
    position: relative;
    min-height: 112px;
  }

  .metric-card .MuiCardContent-root {
    padding: 18px;
  }

  .metric-card--interactive {
    cursor: pointer;
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .metric-card--interactive:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(31, 42, 68, 0.12);
  }

  .metric-card::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 4px;
    background: var(--metric-color, var(--fya-primary));
    content: "";
  }

  .metric-card:nth-child(1) {
    --metric-color: #5b6cf9;
  }

  .metric-card:nth-child(2) {
    --metric-color: #14b8a6;
  }

  .metric-card:nth-child(3) {
    --metric-color: #f59e0b;
  }

  .metric-card:nth-child(4) {
    --metric-color: #8b5cf6;
  }

  .metric-value {
    margin: 4px 0 0;
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 700;
    line-height: 1;
    color: var(--fya-ink);
    letter-spacing: -0.04em;
  }

  .agenda-row {
    display: grid;
    grid-template-columns: minmax(72px, auto) minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #edf0f5;
  }

  .agenda-scroll {
    max-height: min(42vh, 360px);
    padding-right: 5px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
  }

  .agenda-action {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .agenda-focus {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    margin: 12px 0 4px;
    padding: 9px 11px;
    border: 1px solid #dfe3ff;
    border-radius: 12px;
    background: linear-gradient(135deg, #f1f3ff, #f8f9ff);
  }

  .agenda-focus span {
    padding: 3px 7px;
    border-radius: 999px;
    background: var(--fya-primary);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 750;
  }

  .agenda-focus strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .agenda-focus small {
    color: var(--fya-primary-dark);
    font-weight: 700;
  }

  .agenda-row--current {
    margin: 0 -10px;
    padding-right: 10px;
    padding-left: 10px;
    border-radius: 10px;
    background: linear-gradient(90deg, #eef0ff, #f7f8ff);
  }

  .agenda-row:last-child {
    border-bottom: 0;
  }

  .agenda-time {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--fya-primary-dark);
  }

  .card-more-link {
    margin-top: 8px;
  }

  .chart-empty-state {
    display: grid;
    align-content: center;
    justify-items: center;
    min-height: 235px;
    padding: 24px;
    text-align: center;
  }

  .chart-empty-state button {
    margin-top: 14px;
  }

  .plan-empty-state {
    display: grid;
    gap: 12px;
    justify-items: start;
    margin-top: 16px;
  }

  .goals-card .MuiCardContent-root,
  .plan-card .MuiCardContent-root {
    height: 100%;
  }

  .mobile-quick-task-fab {
    position: fixed;
    z-index: 26;
    right: 16px;
    bottom: calc(82px + env(safe-area-inset-bottom));
    gap: 7px;
    box-shadow: 0 14px 28px rgba(64, 81, 214, 0.28);
  }

  @media only screen and (max-width: 980px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .daily-guidance-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .content-grid {
      grid-template-areas:
        "plan water"
        "goals goals"
        "week balance";
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media only screen and (max-width: 600px) {
    padding-top: 12px;

    .dashboard-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .content-grid {
      grid-template-areas:
        "plan"
        "goals"
        "water"
        "week"
        "balance";
      grid-template-columns: minmax(0, 1fr);
    }

    .metric-card {
      min-height: 118px;
    }

    .metric-card .MuiCardContent-root {
      padding: 14px;
    }

    .dashboard-actions > button {
      flex: 1;
      min-width: calc(50% - 4px);
    }

    .dashboard-action--desktop-secondary {
      display: none;
    }

    .guidance-card .MuiCardContent-root {
      padding: 15px;
    }

    .guidance-card .MuiTypography-h6 {
      font-size: 1rem;
      line-height: 1.35;
    }

    .agenda-row {
      grid-template-columns: 66px minmax(0, 1fr) auto;
      gap: 8px;
    }

    .agenda-scroll {
      max-height: min(52vh, 460px);
    }

    .agenda-action .MuiChip-root {
      display: none;
    }
  }
`;

export default StyledMain;
