import styled from "@emotion/styled";

const StyledDayCellEditor = styled.div`
  display: flex;
  min-height: 100%;
  flex-direction: column;
  background: #f7f8fc;

  .editor-header {
    position: sticky;
    z-index: 2;
    top: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 20px 16px;
    border-bottom: 1px solid #e3e8f1;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
  }

  .editor-kicker {
    display: block;
    margin-bottom: 4px;
    color: var(--fya-primary, #5965e8);
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .editor-title {
    color: var(--fya-text, #101828);
    line-height: 1.25;
  }

  .editor-subtitle {
    margin-top: 4px;
  }

  .editor-body {
    flex: 1;
    padding: 18px 20px 24px;
    overflow-y: auto;
  }

  .editor-body > form,
  .editor-body > div > form {
    width: 100%;
    max-width: none !important;
    margin: 0 !important;
  }

  .form-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  @media only screen and (max-width: 600px) {
    .editor-header {
      padding: 16px;
    }

    .editor-body {
      padding: 14px 14px 22px;
    }

    .form-buttons {
      display: grid;
      width: 100%;
      grid-template-columns: 1fr;
    }

    .form-buttons button {
      width: 100%;
    }
  }
`;

export default StyledDayCellEditor;
