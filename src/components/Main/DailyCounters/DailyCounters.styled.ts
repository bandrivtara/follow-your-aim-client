import styled from "@emotion/styled";

const StyledDailyCounters = styled.div`
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 14px;
  min-width: 0;

  .counter-card {
    position: relative;
    overflow: hidden;
    min-width: 0;
    border: 1px solid var(--fya-border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: var(--fya-shadow);
  }

  .counter-card::before {
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    content: "";
  }

  .counter-card--water::before {
    background: linear-gradient(180deg, #5b6cf9, #38bdf8);
  }

  .counter-card--steps::before {
    background: linear-gradient(180deg, #14b8a6, #22c55e);
  }

  .counter-content {
    display: grid;
    align-content: center;
    height: 100%;
    padding: 18px;
  }

  .counter-heading {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }

  .counter-icon {
    display: grid;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 13px;
  }

  .counter-icon--water {
    color: #4f65f5;
    background: linear-gradient(145deg, #eef0ff, #e4f5ff);
  }

  .counter-icon--steps {
    color: #0f9f8f;
    background: linear-gradient(145deg, #e8fbf7, #ebf9ec);
  }

  .counter-value {
    font-size: clamp(1.3rem, 2vw, 1.7rem);
    font-weight: 800;
    line-height: 1;
    color: var(--fya-ink);
    letter-spacing: -0.04em;
    white-space: nowrap;
  }

  .counter-progress-label {
    display: flex;
    justify-content: space-between;
    margin: 14px 0 6px;
    color: #657089;
    font-size: 0.76rem;
  }

  .counter-progress-label strong {
    color: var(--fya-ink);
  }

  .counter-progress {
    height: 8px;
    border-radius: 999px;
    background-color: #edf0f5;
  }

  .counter-progress .MuiLinearProgress-bar {
    border-radius: inherit;
  }

  .counter-progress--water .MuiLinearProgress-bar {
    background: linear-gradient(90deg, #5b6cf9, #38bdf8);
  }

  .counter-progress--steps .MuiLinearProgress-bar {
    background: linear-gradient(90deg, #14b8a6, #22c55e);
  }

  .counter-controls,
  .steps-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 15px;
  }

  .portion-options {
    flex: 1;
  }

  .portion-options .MuiToggleButton-root {
    flex: 1;
    min-width: 0;
    padding: 5px 8px;
    border-color: #e1e5ee;
    color: #556078;
    font-weight: 700;
    text-transform: none;
  }

  .portion-options .MuiToggleButton-root.Mui-selected {
    border-color: #aeb7ff;
    background: #eef0ff;
    color: #4457e8;
  }

  .counter-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .counter-actions .MuiIconButton-root,
  .steps-save {
    border: 1px solid #dfe3ec;
    border-radius: 11px;
  }

  .counter-actions .MuiButton-root,
  .steps-controls .MuiButton-root {
    min-width: 0;
    border-radius: 11px;
    text-transform: none;
  }

  .steps-input {
    flex: 1;
    min-width: 100px;
  }

  .steps-input .MuiOutlinedInput-root {
    border-radius: 11px;
  }

  @media only screen and (max-width: 1180px) {
    .counter-controls,
    .steps-controls {
      align-items: stretch;
      flex-wrap: wrap;
    }

    .portion-options,
    .steps-input {
      flex-basis: 100%;
    }

    .counter-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  @media only screen and (max-width: 600px) {
    grid-template-rows: none;
    grid-template-columns: minmax(0, 1fr);

    .counter-content {
      padding: 16px;
    }

    .counter-controls,
    .steps-controls {
      align-items: center;
      flex-wrap: nowrap;
    }

    .portion-options,
    .steps-input {
      flex-basis: auto;
    }

    .portion-options .MuiToggleButton-root {
      padding-inline: 7px;
    }

    .steps-controls .MuiButton-root:first-of-type {
      display: none;
    }
  }

  @media only screen and (max-width: 410px) {
    .counter-heading {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .counter-value {
      grid-column: 2;
      font-size: 1.25rem;
    }

    .counter-controls,
    .steps-controls {
      align-items: stretch;
      flex-wrap: wrap;
    }

    .portion-options,
    .steps-input {
      flex-basis: 100%;
    }

    .counter-actions {
      width: 100%;
      justify-content: flex-end;
    }

  }
`;

export default StyledDailyCounters;
