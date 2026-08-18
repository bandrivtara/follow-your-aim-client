import styled from "@emotion/styled";

const StyledAddEditHabit = styled.div`
  max-width: 980px;
  margin: 0 auto;

  .habit-form-card {
    padding: clamp(18px, 3vw, 34px);
  }

  .habit-form {
    max-width: 820px;
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
    margin-top: 8px;
    margin-bottom: 0;
    padding-top: 22px;
    border-top: 1px solid #edf0f5;
  }

  @media only screen and (max-width: 576px) {
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

    .form-actions .ant-space,
    .form-actions .ant-space-item,
    .form-actions button {
      width: 100%;
    }
  }
`;

export default StyledAddEditHabit;
