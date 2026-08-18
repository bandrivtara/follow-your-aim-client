import styled from "@emotion/styled";

const StyledEntityFormPage = styled.main`
  width: min(100%, 920px);
  margin: 0 auto;
  padding: 8px 0 24px;

  .entity-form-card {
    overflow: hidden;
    border: 1px solid #e4e8f0;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 18px 46px rgba(16, 24, 40, 0.08);
  }

  .entity-form {
    padding: clamp(18px, 3.5vw, 34px);
  }

  .form-section + .form-section {
    margin-top: 20px;
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

  .ant-input,
  .ant-select {
    width: 100%;
  }

  .transfer-scroll {
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .ant-transfer {
    display: flex;
    width: 100%;
    min-width: 610px;
  }

  .ant-transfer-list {
    flex: 1 1 0;
    width: auto;
    min-width: 240px;
    height: 310px;
    border-radius: 12px;
  }

  .ant-transfer-operation {
    flex: 0 0 auto;
  }

  .load-error {
    margin-bottom: 16px;
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
    .page-header {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
    }

    .page-header > button {
      width: 100%;
    }

    .field-grid {
      grid-template-columns: 1fr;
    }
  }

  @media only screen and (max-width: 480px) {
    .entity-form {
      padding: 14px;
    }

    .form-section {
      padding: 14px;
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

export default StyledEntityFormPage;
