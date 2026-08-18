import styled from "@emotion/styled";

const StyledTasksGroupStages = styled.div`
  .stages-scroll {
    max-height: 520px;
    padding: 2px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .ant-col {
    margin-top: 4px;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
  }

  .subTasks {
    margin: 14px 0 22px;
    border-color: #e7ebf2;
    border-radius: 14px;
    background: #fbfcff;
  }

  .subTasks > .ant-card-head {
    min-height: 50px;
    border-bottom-color: #edf0f5;
    background: transparent;
  }

  .subTasks > .ant-card-body {
    padding: 16px;
  }

  .add-btn {
    margin: 4px 0 0;
  }

  @media only screen and (max-width: 576px) {
    .stages-scroll {
      max-height: none;
    }

    .subTasks > .ant-card-body {
      padding: 12px;
    }
  }
`;

export default StyledTasksGroupStages;
