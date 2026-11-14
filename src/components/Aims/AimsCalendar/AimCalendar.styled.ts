import styled from "@emotion/styled";

const StyledAimCalendar = styled.main`
  width: min(100%, 1680px);
  margin: 0 auto;
  padding: 12px 0 4px;
  color: #101828;

  .calendar-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 18px;
  }

  .calendar-kicker,
  .detail-kicker {
    color: #5965e8;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .calendar-header h1 {
    margin: 4px 0 2px;
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  .calendar-header p,
  .goal-detail-header p {
    max-width: 700px;
    margin: 0;
    color: #667085;
    line-height: 1.55;
  }

  .calendar-toolbar {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 14px;
    padding: 12px;
    border: 1px solid #e3e8f1;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 8px 24px rgba(24, 34, 64, 0.05);
  }

  .goal-filter {
    align-self: center;
  }

  .range-field {
    display: grid;
    gap: 4px;
    margin-left: auto;
  }

  .range-field label {
    color: #667085;
    font-size: 11px;
    font-weight: 650;
  }

  .range-field .ant-picker {
    width: 270px;
  }

  .toolbar-actions,
  .detail-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .calendar-alert {
    margin-bottom: 14px;
  }

  .roadmap-surface,
  .goal-detail {
    overflow: hidden;
    border: 1px solid #e0e5ee;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 14px 38px rgba(24, 34, 64, 0.07);
  }

  .roadmap-scroll {
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  .roadmap-grid {
    min-width: calc(280px + var(--fya-timeline-width));
  }

  .roadmap-header,
  .roadmap-row {
    display: grid;
    grid-template-columns: 280px var(--fya-timeline-width);
  }

  .roadmap-header {
    min-height: 48px;
    color: #667085;
    border-bottom: 1px solid #e1e6ef;
    background: #f8f9fc;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .roadmap-header > span {
    display: flex;
    align-items: center;
    padding: 0 18px;
  }

  .roadmap-months {
    display: grid;
  }

  .roadmap-months > span {
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-left: 1px solid #e1e6ef;
  }

  .roadmap-row {
    width: 100%;
    min-height: 86px;
    padding: 0;
    color: inherit;
    border: 0;
    border-bottom: 1px solid #e8ecf3;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 160ms ease;
  }

  .roadmap-row:last-child {
    border-bottom: 0;
  }

  .roadmap-row:hover {
    background: #f8f9ff;
  }

  .roadmap-row:focus-visible {
    position: relative;
    z-index: 4;
    outline: 2px solid #5965e8;
    outline-offset: -2px;
  }

  .roadmap-row.is-selected {
    background: #f0f2ff;
  }

  .goal-info {
    position: relative;
    display: grid;
    align-content: center;
    gap: 4px;
    min-width: 0;
    padding: 13px 18px;
  }

  .goal-title {
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .goal-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    overflow: hidden;
    color: #667085;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .goal-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    color: #667085;
    font-size: 12px;
    font-weight: 600;
  }

  .goal-status::before {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #18a874;
    content: "";
  }

  .goal-status.is-attention::before,
  .goal-status.is-upcoming::before {
    background: #e59a17;
  }

  .goal-status.is-overdue::before {
    background: #dc6674;
  }

  .goal-status.is-completed::before {
    background: #5965e8;
  }

  .goal-track {
    position: relative;
    display: block;
    min-width: 0;
    overflow: hidden;
    border-left: 1px solid #e1e6ef;
    background-image: linear-gradient(
      to right,
      #e7ebf2 0,
      #e7ebf2 1px,
      transparent 1px
    );
    background-position: -1px 0;
    background-size: calc(100% / var(--fya-month-count)) 100%;
  }

  .today-line {
    position: absolute;
    z-index: 2;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(220, 102, 116, 0.72);
  }

  .today-label {
    position: absolute;
    z-index: 3;
    top: 7px;
    color: #c94e5d;
    font-size: 11px;
    font-weight: 650;
  }

  .goal-bar {
    position: absolute;
    top: 32px;
    display: block;
    min-width: 86px;
    height: 26px;
    overflow: hidden;
    border-radius: 8px;
    background: #e7eaf2;
    box-shadow: 0 3px 8px rgba(51, 61, 108, 0.08);
  }

  .goal-bar-progress {
    position: absolute;
    inset: 0 auto 0 0;
    background: linear-gradient(90deg, #5965e8, #6b75f4);
  }

  .goal-bar-label {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 9px;
    overflow: hidden;
    color: #20284f;
    font-size: 11px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-progress-track {
    display: none;
  }

  .roadmap-empty,
  .trend-empty {
    display: grid;
    justify-items: center;
    gap: 7px;
    padding: 52px 20px;
    color: #667085;
    text-align: center;
  }

  .roadmap-empty > .anticon,
  .trend-empty > .anticon {
    color: #7b84ee;
    font-size: 28px;
  }

  .roadmap-empty strong,
  .trend-empty strong {
    color: #344054;
  }

  .goal-detail {
    margin-top: 14px;
    padding: clamp(18px, 2.5vw, 26px);
  }

  .goal-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .goal-detail-header h2 {
    margin: 4px 0 3px;
    font-size: 22px;
    line-height: 1.3;
  }

  .detail-actions strong {
    color: #5965e8;
    font-size: 30px;
    line-height: 1;
  }

  .goal-detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.7fr);
    gap: 26px;
    align-items: center;
  }

  .trend-panel {
    min-width: 0;
  }

  .trend-chart-wrap {
    width: 100%;
  }

  .trend-chart {
    display: block;
    width: 100%;
    height: 190px;
    overflow: visible;
  }

  .trend-grid-line {
    stroke: #e7ebf2;
    stroke-width: 1;
  }

  .trend-target-line {
    stroke: #18a874;
    stroke-width: 2;
    stroke-dasharray: 7 7;
  }

  .trend-line {
    fill: none;
    stroke: #5965e8;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .trend-point {
    fill: #ffffff;
    stroke: #5965e8;
    stroke-width: 4;
  }

  .trend-chart-caption {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    margin-top: 3px;
    color: #667085;
    font-size: 11px;
  }

  .trend-chart-caption span:nth-child(2) {
    color: #5965e8;
    font-weight: 700;
  }

  .trend-chart-caption span:last-child {
    text-align: right;
  }

  .trend-empty {
    min-height: 210px;
    align-content: center;
    border-radius: 14px;
    background: #f8f9fc;
  }

  .trend-empty span {
    max-width: 460px;
    line-height: 1.5;
  }

  .goal-milestones {
    display: grid;
    gap: 15px;
  }

  .milestone {
    display: grid;
    grid-template-columns: 12px 1fr;
    gap: 10px;
    align-items: start;
  }

  .milestone > span {
    width: 9px;
    height: 9px;
    margin-top: 5px;
    border-radius: 50%;
    background: #d5dae5;
    box-shadow: 0 0 0 4px #f1f3f7;
  }

  .milestone.is-done > span {
    background: #18a874;
    box-shadow: 0 0 0 4px rgba(24, 168, 116, 0.1);
  }

  .milestone small,
  .milestone strong {
    display: block;
  }

  .milestone small {
    margin-bottom: 2px;
    color: #667085;
    font-size: 11px;
  }

  .milestone strong {
    color: #344054;
    font-size: 13px;
    line-height: 1.4;
  }

  @media only screen and (max-width: 1080px) {
    .calendar-toolbar {
      align-items: stretch;
      flex-wrap: wrap;
    }

    .range-field {
      margin-left: 0;
    }

    .goal-filter {
      width: 100%;
    }

    .goal-detail-grid {
      grid-template-columns: minmax(0, 1.2fr) minmax(240px, 0.8fr);
    }
  }

  @media only screen and (max-width: 768px) {
    padding-top: 10px;

    .calendar-header,
    .calendar-toolbar,
    .goal-detail-header {
      align-items: stretch;
      flex-direction: column;
    }

    .calendar-header {
      gap: 12px;
    }

    .calendar-header h1 {
      font-size: 30px;
    }

    .calendar-header > button,
    .range-field .ant-picker {
      width: 100%;
    }

    .calendar-toolbar {
      padding: 12px;
    }

    .goal-filter .ant-segmented-group {
      display: grid;
      grid-template-columns: 1fr;
    }

    .goal-filter .ant-segmented-item-label {
      min-height: 34px;
      line-height: 34px;
    }

    .toolbar-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .roadmap-scroll {
      overflow-x: visible;
    }

    .roadmap-grid {
      min-width: 0;
    }

    .roadmap-header,
    .goal-track {
      display: none;
    }

    .roadmap-row {
      display: block;
      min-height: 0;
    }

    .goal-info {
      gap: 5px;
      padding: 15px;
    }

    .goal-title {
      white-space: normal;
    }

    .mobile-progress-track {
      display: block;
      height: 7px;
      margin-top: 5px;
      overflow: hidden;
      border-radius: 99px;
      background: #e7eaf2;
    }

    .mobile-progress-track > span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #5965e8;
    }

    .detail-actions {
      justify-content: space-between;
    }

    .goal-detail-grid {
      grid-template-columns: 1fr;
    }

    .trend-chart {
      height: 155px;
    }
  }

  @media only screen and (max-width: 420px) {
    .toolbar-actions {
      grid-template-columns: 1fr;
    }

    .goal-meta {
      flex-wrap: wrap;
      white-space: normal;
    }

    .detail-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .detail-actions button {
      width: 100%;
    }
  }
`;

export default StyledAimCalendar;
