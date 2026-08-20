import styled from "@emotion/styled";

const StyledTasksGroupStore = styled.div`
  .tasks-scroll {
    max-height: 430px;
    padding: 2px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .task-item {
    margin-bottom: 12px;
    padding: 14px;
    border: 1px solid #e7ebf2;
    border-radius: 14px;
    background: #fbfcff;
  }

  .task-item .ant-row + .ant-row {
    margin-top: 8px;
  }

  .task-details .ant-form-item,
  .task-description-row .ant-form-item {
    margin-bottom: 0;
  }

  .task-details .ant-form-item-label,
  .task-description-row .ant-form-item-label {
    padding-bottom: 4px;
  }

  .task-details .ant-form-item-label > label,
  .task-description-row .ant-form-item-label > label {
    color: #667085;
    font-size: 12px;
    font-weight: 650;
  }

  .ant-col {
    margin-top: 4px;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
  }

  .add-btn {
    margin: 4px 0 0;
  }

  @media only screen and (max-width: 576px) {
    .task-item {
      padding: 10px;
    }

    .tasks-scroll {
      max-height: none;
    }
  }
`;

export default StyledTasksGroupStore;
