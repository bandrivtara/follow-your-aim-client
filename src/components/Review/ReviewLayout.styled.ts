import styled from "@emotion/styled";

const ReviewLayout = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 0 12px;

  .review-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .review-card {
    border: 1px solid #ece5dd;
    border-radius: 18px;
    box-shadow: 0 10px 28px rgba(64, 48, 35, 0.07);
  }

  .review-score-grid,
  .weekly-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .weekly-summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .review-question-list {
    display: grid;
    gap: 18px;
    margin-top: 20px;
  }

  .review-actions {
    position: sticky;
    z-index: 5;
    bottom: 76px;
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .review-actions button {
    min-height: 46px;
  }

  .weekly-content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
    gap: 16px;
  }

  .weekly-day-list {
    display: grid;
    gap: 10px;
  }

  @media only screen and (max-width: 768px) {
    padding-top: 14px;

    .review-header {
      align-items: stretch;
      flex-direction: column;
    }

    .review-score-grid,
    .weekly-content-grid {
      grid-template-columns: 1fr;
    }

    .weekly-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .review-actions button {
      width: 100%;
    }
  }
`;

export default ReviewLayout;
