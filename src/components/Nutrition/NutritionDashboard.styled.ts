import styled from "@emotion/styled";

const NutritionLayout = styled.main`
  max-width: 1680px;
  margin: 0 auto;
  padding: 6px 0 8px;

  .nutrition-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .nutrition-header > div,
  .card-heading > div,
  .import-heading > div,
  .dashboard-card,
  .metric-card {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .nutrition-kicker,
  .section-eyebrow {
    display: block;
    margin-bottom: 5px;
    color: var(--fya-primary-dark);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .nutrition-header-actions,
  .planner-actions,
  .import-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  > .MuiAlert-root {
    margin-bottom: 14px;
    border-radius: 14px;
  }

  .nutrition-tabs {
    min-height: 48px;
    padding: 4px;
    margin-bottom: 18px;
    overflow: hidden;
    border: 1px solid var(--fya-border);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.04);
  }

  .nutrition-tabs .MuiTabs-flexContainer {
    gap: 4px;
  }

  .nutrition-tabs .MuiTabs-scroller {
    overflow: auto !important;
  }

  .nutrition-tabs .MuiTab-root {
    min-height: 40px;
    padding: 8px 16px;
    border-radius: 10px;
    color: var(--fya-muted);
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: none;
  }

  .nutrition-tabs .MuiTab-root.Mui-selected {
    color: var(--fya-primary-dark);
    background: #eef0ff;
  }

  .nutrition-tabs .MuiTabs-indicator {
    display: none;
  }

  .nutrition-panel {
    min-width: 0;
  }

  .nutrition-section-heading,
  .planner-header,
  .card-heading,
  .settings-heading,
  .import-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .nutrition-section-heading {
    align-items: center;
    margin-bottom: 12px;
  }

  .macro-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .metric-card,
  .dashboard-card,
  .day-card {
    overflow: hidden;
    border: 1px solid var(--fya-border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: var(--fya-shadow);
  }

  .metric-card {
    position: relative;
    min-height: 132px;
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

  .metric-card--calories {
    --metric-color: #5b6cf9;
  }

  .metric-card--protein {
    --metric-color: #14b8a6;
  }

  .metric-card--fat {
    --metric-color: #f59e0b;
  }

  .metric-card--carbs {
    --metric-color: #8b5cf6;
  }

  .metric-card .MuiCardContent-root {
    display: grid;
    gap: 6px;
    padding: 18px;
  }

  .metric-card .MuiTypography-caption,
  .metric-card small {
    color: var(--fya-muted);
  }

  .metric-value {
    margin: 3px 0 1px;
    color: var(--fya-ink);
    font-size: clamp(27px, 3vw, 36px);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .metric-card .MuiLinearProgress-root,
  .day-card .MuiLinearProgress-root {
    height: 7px;
    margin-top: 6px;
    overflow: hidden;
    border-radius: 99px;
    background: #edf0f5;
  }

  .metric-card .MuiLinearProgress-bar {
    background: var(--metric-color);
  }

  .nutrition-dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.72fr);
    gap: 14px;
    align-items: stretch;
  }

  .today-meals-card .MuiCardContent-root,
  .goal-card .MuiCardContent-root,
  .integration-card .MuiCardContent-root,
  .import-card .MuiCardContent-root,
  .settings-grid .dashboard-card .MuiCardContent-root {
    display: grid;
    gap: 16px;
    padding: 18px;
  }

  .meal-list {
    max-height: min(44vh, 380px);
    padding-right: 5px;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .meal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 11px 0;
    border-bottom: 1px solid #edf0f5;
  }

  .meal-row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .meal-row > div {
    display: grid;
    min-width: 0;
    gap: 2px;
  }

  .meal-row span {
    color: var(--fya-muted);
    font-size: 0.78rem;
  }

  .card-empty-state {
    display: grid;
    min-height: 220px;
    place-items: center;
    align-content: center;
    gap: 10px;
    padding: 24px;
    color: var(--fya-muted);
    text-align: center;
  }

  .card-empty-state > svg {
    color: #a5adbd;
    font-size: 36px;
  }

  .nutrition-side-stack {
    display: grid;
    gap: 14px;
  }

  .card-icon {
    display: grid;
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 12px;
  }

  .card-icon--goal {
    color: #0f9f8f;
    background: rgba(20, 184, 166, 0.12);
  }

  .card-icon--integration {
    color: #5965e8;
    background: rgba(91, 108, 249, 0.12);
  }

  .card-icon--ai {
    color: #7c3aed;
    background: rgba(139, 92, 246, 0.12);
  }

  .planner-section {
    display: grid;
    gap: 16px;
  }

  .planner-header {
    align-items: flex-end;
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    align-items: stretch;
    padding: 2px 2px 8px;
  }

  .day-card {
    min-width: 0;
    box-shadow: 0 8px 22px rgba(16, 24, 40, 0.055);
  }

  .day-card--today {
    border-color: rgba(91, 108, 249, 0.55);
    background: linear-gradient(180deg, #f7f8ff 0%, #ffffff 58%);
    box-shadow: 0 10px 26px rgba(91, 108, 249, 0.12);
  }

  .day-card--complete {
    border-color: rgba(24, 168, 116, 0.45);
    background: linear-gradient(180deg, #f5fcf9 0%, #ffffff 54%);
  }

  .day-card .MuiCardContent-root {
    display: grid;
    height: 100%;
    gap: 12px;
    padding: 18px;
  }

  .day-heading {
    display: flex;
    min-height: 46px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .day-name {
    color: var(--fya-ink);
    font-size: 1.02rem;
    font-weight: 750;
    text-transform: capitalize;
  }

  .day-date {
    display: block;
    margin-top: 2px;
    color: var(--fya-muted);
    font-size: 0.76rem;
  }

  .day-heading > b {
    padding: 7px 10px;
    border-radius: 10px;
    color: var(--fya-primary-dark);
    background: #eef0ff;
    font-size: 0.88rem;
    white-space: nowrap;
  }

  .day-macro-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .day-macro-row span {
    padding: 4px 8px;
    border: 1px solid #e8ebf2;
    border-radius: 99px;
    color: var(--fya-muted);
    background: #f8f9fc;
    font-size: 0.72rem;
    font-weight: 650;
  }

  .day-progress {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }

  .day-progress .MuiLinearProgress-root {
    margin: 0;
  }

  .day-progress > span {
    color: var(--fya-muted);
    font-size: 0.72rem;
    white-space: nowrap;
  }

  .compact-meal-list {
    display: grid;
    max-height: 255px;
    padding-right: 3px;
    overflow-y: auto;
  }

  .compact-meal {
    display: grid;
    gap: 2px;
    padding: 8px 0;
    border-bottom: 1px solid #edf0f5;
  }

  .compact-meal:last-child {
    border-bottom: 0;
  }

  .compact-meal span {
    color: var(--fya-ink);
    font-size: 0.82rem;
    font-weight: 650;
    line-height: 1.3;
  }

  .compact-meal small,
  .day-empty {
    color: var(--fya-muted);
    font-size: 0.74rem;
  }

  .day-empty {
    min-height: 86px;
    padding-top: 10px;
    text-align: center;
  }

  .import-actions {
    justify-content: space-between;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.2fr);
    gap: 14px;
    align-items: start;
  }

  .targets-grid,
  .lists-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .settings-heading {
    align-items: center;
  }

  .settings-grid .MuiFormHelperText-root {
    margin-right: 0;
    margin-left: 0;
  }

  .nutrition-loading,
  .nutrition-first-import .MuiCardContent-root {
    display: grid;
    min-height: 280px;
    place-items: center;
    align-content: center;
    gap: 12px;
    text-align: center;
  }

  .nutrition-first-import {
    max-width: 680px;
    margin: 48px auto;
  }

  .nutrition-first-import svg {
    color: var(--fya-primary);
    font-size: 44px;
  }

  .week-toolbar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    max-width: 620px;
    padding: 10px 12px;
    margin-bottom: 14px;
    border: 1px solid var(--fya-border);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.04);
    text-align: center;
  }

  .day-card {
    align-self: stretch;
  }

  .day-note {
    padding: 10px 12px;
    border-left: 3px solid #f2c94c;
    border-radius: 8px;
    color: #70520b;
    background: #fff8df;
    line-height: 1.35;
  }

  .day-meals {
    display: grid;
    align-content: start;
    gap: 10px;
  }

  .planned-meal {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 118px;
    align-items: center;
    gap: 12px;
    padding: 11px;
    border: 1px solid #e8ebf2;
    border-radius: 12px;
    background: #fafbfc;
  }

  .planned-meal:last-child {
    border-bottom: 1px solid #e8ebf2;
  }

  .planned-meal button {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    column-gap: 10px;
    row-gap: 3px;
    align-items: center;
    min-width: 0;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .planned-meal button:hover strong {
    color: var(--fya-primary-dark);
  }

  .planned-meal button > span,
  .planned-meal button > small {
    color: var(--fya-muted);
    font-size: 0.74rem;
  }

  .planned-meal button > span {
    display: grid;
    grid-row: 1 / 4;
    width: 52px;
    min-height: 38px;
    place-items: center;
    border-radius: 9px;
    color: var(--fya-primary-dark);
    background: #eef0ff;
    font-weight: 750;
  }

  .planned-meal button > strong,
  .planned-meal button > small {
    grid-column: 2;
    min-width: 0;
  }

  .planned-meal button > strong {
    line-height: 1.3;
  }

  .planned-meal button > .meal-portion {
    display: -webkit-box;
    overflow: hidden;
    color: #5965e8;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .planned-meal select {
    width: 100%;
    min-height: 38px;
    padding: 6px 9px;
    border: 1px solid var(--fya-border);
    border-radius: 9px;
    color: var(--fya-ink);
    background: #fff;
    font-weight: 650;
  }

  .planned-meal .meal-status--eaten {
    border-color: rgba(24, 168, 116, 0.4);
    color: #087a52;
    background: #effaf6;
  }

  .planned-meal .meal-status--skipped {
    border-color: rgba(229, 72, 77, 0.35);
    color: #b4232b;
    background: #fff3f3;
  }

  .shopping-section,
  .recipes-section,
  .prep-section {
    display: grid;
    gap: 14px;
  }

  .shopping-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    align-items: start;
  }

  .shopping-card .MuiCardContent-root,
  .recipe-card .MuiCardContent-root {
    display: grid;
    gap: 12px;
    padding: 18px;
  }

  .shopping-card .MuiLinearProgress-root {
    height: 7px;
    border-radius: 99px;
  }

  .shopping-list {
    display: grid;
    max-height: 520px;
    overflow-y: auto;
  }

  .shopping-item {
    padding: 5px 0;
    margin: 0;
    border-bottom: 1px solid #edf0f5;
  }

  .shopping-item .MuiFormControlLabel-label {
    width: 100%;
  }

  .shopping-item .MuiFormControlLabel-label > span {
    display: grid;
    gap: 2px;
  }

  .shopping-item small {
    color: var(--fya-muted);
  }

  .shopping-item.is-checked strong {
    color: var(--fya-muted);
    text-decoration: line-through;
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .recipe-card {
    cursor: pointer;
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(31, 42, 68, 0.12);
  }

  .recipe-preview {
    min-height: 42px;
    color: var(--fya-muted);
    font-size: 0.84rem;
  }

  .recipe-dialog-content {
    display: grid;
    gap: 14px;
  }

  .recipe-dialog-content ul,
  .recipe-dialog-content ol {
    display: grid;
    gap: 7px;
    padding-left: 22px;
    margin: 0;
  }

  .portion-detail {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border: 1px solid #dfe3ff;
    border-radius: 12px;
    color: var(--fya-ink);
    background: #f5f6ff;
  }

  .portion-detail > svg {
    flex: 0 0 auto;
    margin-top: 1px;
  }

  .portion-detail > div {
    display: grid;
    gap: 3px;
  }

  .portion-detail strong {
    color: var(--fya-primary-dark);
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .prep-grid,
  .freezer-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    align-items: start;
  }

  .prep-session-card .MuiCardContent-root,
  .freezer-card .MuiCardContent-root {
    display: grid;
    gap: 14px;
    padding: 18px;
  }

  .prep-session-card .MuiLinearProgress-root {
    height: 7px;
    overflow: hidden;
    border-radius: 99px;
    background: #edf0f5;
  }

  .equipment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .equipment-list .MuiChip-root {
    color: #4c5670;
    background: #f1f3f8;
  }

  .prep-task-list {
    display: grid;
  }

  .prep-task {
    align-items: flex-start;
    padding: 7px 0;
    margin: 0;
    border-bottom: 1px solid #edf0f5;
  }

  .prep-task:last-child {
    border-bottom: 0;
  }

  .prep-task .MuiCheckbox-root {
    padding-top: 4px;
  }

  .prep-task .MuiFormControlLabel-label {
    width: 100%;
  }

  .prep-task .MuiFormControlLabel-label > span {
    display: grid;
    gap: 3px;
  }

  .prep-task small,
  .prep-task em {
    color: var(--fya-muted);
    font-size: 0.76rem;
  }

  .prep-task em {
    color: var(--fya-primary-dark);
    font-style: normal;
  }

  .prep-task.is-checked strong {
    color: var(--fya-muted);
    text-decoration: line-through;
  }

  .freezer-section {
    display: grid;
    gap: 12px;
    padding-top: 10px;
  }

  .subsection-heading {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .subsection-heading > svg {
    padding: 8px;
    border-radius: 12px;
    color: #2474a7;
    background: #e9f5ff;
    font-size: 40px;
  }

  .portion-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .portion-summary span {
    display: grid;
    gap: 2px;
    padding: 10px;
    border: 1px solid #e8ebf2;
    border-radius: 10px;
    color: var(--fya-muted);
    background: #fafbfc;
    font-size: 0.72rem;
  }

  .portion-summary b {
    color: var(--fya-ink);
    font-size: 1.05rem;
  }

  .defrost-plan {
    display: grid;
    gap: 7px;
  }

  .defrost-plan > div {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border-radius: 10px;
    color: #315d7c;
    background: #edf7ff;
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .finish-note {
    padding: 10px 12px;
    border-left: 3px solid #5b6cf9;
    border-radius: 8px;
    background: #f4f5ff;
  }

  @media only screen and (max-width: 1100px) {
    .macro-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .nutrition-dashboard-grid,
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .nutrition-side-stack {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .recipes-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .week-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media only screen and (max-width: 700px) {
    padding-top: 12px;

    .nutrition-header,
    .planner-header,
    .import-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .nutrition-header-actions,
    .planner-actions {
      width: 100%;
    }

    .nutrition-header-actions .MuiButton-root,
    .planner-actions .MuiButton-root,
    .import-actions .MuiButton-root {
      flex: 1 1 auto;
    }

    .nutrition-tabs .MuiTab-root {
      min-width: 126px;
      padding-right: 8px;
      padding-left: 8px;
    }

    .macro-grid {
      gap: 8px;
    }

    .metric-card {
      min-height: 124px;
    }

    .metric-card .MuiCardContent-root,
    .today-meals-card .MuiCardContent-root,
    .goal-card .MuiCardContent-root,
    .integration-card .MuiCardContent-root,
    .import-card .MuiCardContent-root,
    .settings-grid .dashboard-card .MuiCardContent-root {
      padding: 15px;
    }

    .nutrition-side-stack,
    .targets-grid,
    .lists-grid,
    .shopping-grid,
    .recipes-grid,
    .prep-grid,
    .freezer-grid {
      grid-template-columns: 1fr;
    }

    .week-grid {
      grid-template-columns: 1fr;
      padding-right: 2px;
    }
  }

  @media only screen and (max-width: 420px) {
    .metric-card .MuiCardContent-root {
      padding: 14px 12px;
    }

    .metric-value {
      font-size: 25px;
    }

    .nutrition-section-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .planned-meal {
      grid-template-columns: 1fr;
    }

    .portion-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

export default NutritionLayout;
