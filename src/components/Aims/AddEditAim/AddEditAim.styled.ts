import styled from "@emotion/styled";

const StyledAddEditAim = styled.main`
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 8px 0 24px;

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 18px;
  }

  .page-kicker {
    display: block;
    margin-bottom: 5px;
    color: var(--fya-primary, #5b6cf9);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .page-title {
    margin: 0;
    color: #172033;
    font-size: clamp(30px, 4vw, 42px);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  .page-subtitle {
    max-width: 660px;
    margin: 8px 0 0;
    color: #667085;
    line-height: 1.55;
  }

  .load-error {
    margin-bottom: 16px;
  }

  .aim-form-card {
    overflow: hidden;
    border: 1px solid #e4e8f0;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 18px 46px rgba(16, 24, 40, 0.08);
  }

  .aim-form {
    padding: clamp(18px, 3.5vw, 36px);
  }

  .form-section + .form-section {
    margin-top: 22px;
  }

  .form-section {
    padding: 20px;
    border: 1px solid #e8ebf2;
    border-radius: 16px;
    background: #fbfcff;
  }

  .section-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
  }

  .section-icon {
    display: grid;
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    place-items: center;
    color: #5b6cf9;
    border-radius: 11px;
    background: rgba(91, 108, 249, 0.1);
    font-size: 18px;
  }

  .section-heading h2 {
    margin: 0;
    color: #172033;
    font-size: 17px;
    line-height: 1.35;
  }

  .section-heading p {
    margin: 3px 0 0;
    color: #667085;
    font-size: 13px;
    line-height: 1.45;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 18px;
  }

  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-form-item:last-child {
    margin-bottom: 0;
  }

  .ant-form-item-label > label {
    color: #344054;
    font-weight: 600;
  }

  .ant-form-item-extra {
    margin-top: 6px;
    color: #667085;
    font-size: 12px;
    line-height: 1.45;
  }

  .ant-input,
  .ant-input-number,
  .ant-picker,
  .ant-select,
  .ant-cascader {
    width: 100%;
  }

  .complexity-field {
    padding-inline: 2px;
  }

  .complexity-field .ant-slider {
    margin: 10px 8px 22px;
  }

  .complexity-field .ant-slider-mark-text {
    color: #7b8497;
    font-size: 11px;
  }

  .goal-type-group,
  .calculation-type-group {
    display: grid;
    width: 100%;
    gap: 8px;
  }

  .goal-type-group {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .calculation-type-group {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .goal-type-group .ant-radio-button-wrapper,
  .calculation-type-group .ant-radio-button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto;
    min-height: 44px;
    padding: 9px 12px;
    border: 1px solid #dfe4ec;
    border-radius: 11px;
    line-height: 1.35;
    text-align: center;
    white-space: normal;
  }

  .goal-type-group .ant-radio-button-wrapper::before,
  .calculation-type-group .ant-radio-button-wrapper::before {
    display: none;
  }

  .goal-type-group .ant-radio-button-wrapper-checked,
  .calculation-type-group .ant-radio-button-wrapper-checked {
    color: #4051d6;
    border-color: #5b6cf9;
    background: rgba(91, 108, 249, 0.07);
    box-shadow: 0 0 0 3px rgba(91, 108, 249, 0.08);
  }

  .relationship-panel {
    margin-top: 16px;
    padding: 16px;
    border: 1px dashed #d8deea;
    border-radius: 14px;
    background: #ffffff;
  }

  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .switch-copy strong,
  .switch-copy span {
    display: block;
  }

  .switch-copy strong {
    color: #344054;
    font-size: 14px;
  }

  .switch-copy span {
    margin-top: 3px;
    color: #667085;
    font-size: 12px;
    line-height: 1.45;
  }

  .relationship-fields {
    display: grid;
    gap: 0;
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid #edf0f5;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid #edf0f5;
  }

  @media only screen and (max-width: 760px) {
    padding-top: 4px;

    .page-header {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
    }

    .page-header > button {
      width: 100%;
    }

    .page-title {
      font-size: 30px;
    }

    .field-grid,
    .goal-type-group,
    .calculation-type-group {
      grid-template-columns: 1fr;
    }

    .form-section {
      padding: 16px;
    }
  }

  @media only screen and (max-width: 480px) {
    .aim-form {
      padding: 14px;
    }

    .form-section {
      padding: 14px;
      border-radius: 14px;
    }

    .section-heading {
      margin-bottom: 15px;
    }

    .switch-row,
    .form-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .form-actions button {
      width: 100%;
    }
  }
`;

export default StyledAddEditAim;
