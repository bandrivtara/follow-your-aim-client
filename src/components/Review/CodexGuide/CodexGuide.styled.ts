import styled from "@emotion/styled";
import ReviewLayout from "../ReviewLayout.styled";

const CodexGuideLayout = styled(ReviewLayout)`
  .codex-hero {
    padding: 24px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f3f8ff 0%, #fffaf2 100%);
  }

  .codex-section {
    margin-top: 22px;
  }

  .codex-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .codex-steps,
  .codex-check-list {
    padding-left: 22px;
    margin: 14px 0 0;
  }

  .codex-steps li,
  .codex-check-list li {
    padding-left: 4px;
    margin-bottom: 10px;
  }

  .codex-prompt {
    padding: 14px;
    margin: 14px 0;
    overflow-wrap: anywhere;
    color: #332b25;
    background: #f7f5f2;
    border: 1px solid #e8e1d9;
    border-radius: 12px;
    white-space: pre-wrap;
  }

  .codex-card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .codex-copy-button {
    align-self: flex-start;
    margin-top: auto;
    min-height: 42px;
  }

  @media only screen and (max-width: 768px) {
    .codex-hero {
      padding: 18px;
    }

    .codex-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default CodexGuideLayout;
