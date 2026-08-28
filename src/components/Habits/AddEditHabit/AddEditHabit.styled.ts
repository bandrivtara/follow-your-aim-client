import styled from "@emotion/styled";

const StyledAddEditHabit = styled.div`
  max-width: 980px;
  margin: 0 auto;

  .habit-form-card {
    padding: clamp(18px, 3vw, 34px);
  }

  .habit-form {
    max-width: none;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 18px;
  }

  .ant-form-item {
    margin-bottom: 22px;
  }

  .ant-form-item-label > label {
    color: #344054;
    font-weight: 550;
  }

  .ant-form-item-extra {
    max-width: 480px;
    margin-top: 7px;
    color: var(--fya-muted);
    line-height: 1.5;
  }

  .ant-input,
  .ant-input-number,
  .ant-select,
  .ant-cascader {
    width: 100%;
  }

  .ant-radio-group {
    display: flex;
    flex-wrap: wrap;
  }

  .habit-type-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  .habit-type-group .ant-radio-button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    border: 1px solid #dfe4ec;
    border-radius: 11px;
  }

  .habit-type-group .ant-radio-button-wrapper::before {
    display: none;
  }

  .habit-type-group .ant-radio-button-wrapper-checked {
    color: #4051d6;
    border-color: #5b6cf9;
    background: rgba(91, 108, 249, 0.07);
    box-shadow: 0 0 0 3px rgba(91, 108, 249, 0.08);
  }

  .ant-slider {
    margin-inline: 8px;
  }

  .ant-space-compact {
    width: 100%;
  }

  .main-field .ant-space-compact {
    padding: 4px;
    border: 1px solid rgba(24, 168, 116, 0.45);
    border-radius: 12px;
    background: rgba(24, 168, 116, 0.045);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
    padding-top: 22px;
    border-top: 1px solid #edf0f5;
  }

  @media only screen and (max-width: 760px) {
    padding-top: 12px;

    .habit-form-card {
      padding: 18px 14px;
    }

    .ant-form-item {
      margin-bottom: 18px;
    }

    .ant-form-item-label {
      padding-bottom: 6px;
    }

    .field-grid,
    .habit-type-group {
      grid-template-columns: 1fr;
    }

    .form-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .form-actions button {
      width: 100%;
    }
  }
`;

export default StyledAddEditHabit;
