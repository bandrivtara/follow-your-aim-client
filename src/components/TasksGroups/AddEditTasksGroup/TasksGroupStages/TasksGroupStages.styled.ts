import styled from "@emotion/styled";

const StyledTasksGroupStages = styled.div`
  .ant-collapse,
  .ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header,
  .ant-collapse-item,
  .ant-collapse-content {
    border-radius: 0 !important;
  }

  .ant-collapse-header-text {
    width: 100%;
    display: block;
    height: 100%;
  }

  .ant-col {
    margin-top: 4px;
  }

  .subTasks {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

export default StyledTasksGroupStages;
