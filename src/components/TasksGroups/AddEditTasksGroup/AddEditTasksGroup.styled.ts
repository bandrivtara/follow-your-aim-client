import styled from "@emotion/styled";

const StyledAddEditTasksGroup = styled.div`
  width: min(100%, 1040px);
  margin: 0 auto;
  padding: 12px 0 4px;

  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .page-title {
    margin: 0 0 4px;
    color: #101828;
    font-size: clamp(28px, 4vw, 42px);
    line-height: 1.1;
    letter-spacing: -0.035em;
  }

  .page-subtitle {
    max-width: 700px;
    margin: 0;
    color: #667085;
    line-height: 1.55;
  }

  .load-error {
    margin-bottom: 16px;
  }

  .task-group-form-card {
    padding: clamp(20px, 3vw, 36px);
    border: 1px solid #e3e8f1;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 14px 38px rgba(24, 34, 64, 0.07);
  }

  .task-group-form {
    display: grid;
    gap: 22px;
  }

  .form-section {
    max-width: 760px;
  }

  .section-heading,
  .card-heading,
  .stage-copy {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .section-heading {
    margin-bottom: 22px;
  }

  .section-heading h2,
  .section-heading p,
  .card-heading strong,
  .card-heading span,
  .stage-copy strong,
  .stage-copy span {
    display: block;
    margin: 0;
  }

  .section-heading h2 {
    color: var(--fya-text, #101828);
    font-size: 18px;
    line-height: 1.35;
  }

  .section-heading p,
  .card-heading span,
  .stage-copy span {
    margin-top: 3px;
    color: var(--fya-muted, #667085);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.45;
  }

  .section-icon {
    display: inline-grid;
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    place-items: center;
    color: var(--fya-primary, #5965e8);
    border-radius: 12px;
    background: rgba(91, 101, 255, 0.1);
  }

  .task-group-form > .ant-form-item,
  .general-section .ant-form-item {
    margin-bottom: 18px;
  }

  .general-section .ant-form-item:last-child {
    margin-bottom: 0;
  }

  .ant-form-item-label > label {
    color: #344054;
    font-weight: 600;
  }

  .section-card {
    overflow: hidden;
    border-color: #e3e8f1;
    border-radius: 18px;
    box-shadow: none;
  }

  .section-card > .ant-card-head {
    min-height: 72px;
    padding: 0 22px;
    border-bottom-color: #edf0f5;
    background: #fafbff;
  }

  .section-card > .ant-card-body {
    padding: 22px;
  }

  .card-heading {
    align-items: center;
  }

  .card-heading > .anticon {
    color: var(--fya-primary, #5965e8);
    font-size: 18px;
  }

  .card-heading strong {
    color: var(--fya-text, #101828);
    font-size: 15px;
  }

  .stages-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 20px;
    border: 1px solid #e3e8f1;
    border-radius: 16px;
    background: linear-gradient(135deg, #fafbff 0%, #f5f7ff 100%);
  }

  .stage-copy {
    align-items: center;
  }

  .stage-copy strong {
    color: var(--fya-text, #101828);
    font-size: 15px;
  }

  .stage-icon {
    color: #7c3aed;
    background: rgba(124, 58, 237, 0.09);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 22px;
    border-top: 1px solid #edf0f5;
  }

  @media only screen and (max-width: 640px) {
    padding-top: 10px;

    .page-header {
      align-items: flex-start;
    }

    .task-group-form-card {
      padding: 18px 14px;
    }

    .section-card > .ant-card-head,
    .section-card > .ant-card-body {
      padding-right: 14px;
      padding-left: 14px;
    }

    .stages-toggle {
      align-items: flex-start;
      padding: 16px;
    }

    .stage-copy .section-icon {
      display: none;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr;
    }

    .form-actions button {
      width: 100%;
    }

    .form-actions .ant-btn-primary {
      grid-row: 1;
    }
  }
`;

export default StyledAddEditTasksGroup;
