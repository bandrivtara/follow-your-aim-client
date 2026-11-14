import styled from "@emotion/styled";

const StyledDayCellForm = styled.div`
  width: min(320px, calc(100vw - 32px));
  padding: 16px;

  .time-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .ant-form-item {
    margin-bottom: 16px;
  }

  .ant-form-item-label {
    padding-bottom: 5px;
  }

  .ant-form-item-label > label {
    color: #344054;
    font-size: 12px;
    font-weight: 600;
  }

  .ant-cascader {
    width: 100%;
  }

  .editor-actions {
    margin-bottom: 0;
    padding-top: 4px;
    border-top: 1px solid #edf0f5;
  }

  .editor-actions .ant-form-item-control-input-content {
    display: flex;
    gap: 8px;
    padding-top: 12px;
  }

  .editor-actions button {
    flex: 1;
    margin-left: 0 !important;
  }

  @media only screen and (max-width: 380px) {
    width: min(280px, calc(100vw - 24px));
    padding: 12px;

    .time-grid {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
`;

export default StyledDayCellForm;
