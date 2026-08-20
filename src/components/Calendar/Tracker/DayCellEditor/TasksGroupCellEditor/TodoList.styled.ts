import styled from "@emotion/styled";

const StyledTodoList = styled.div`
  .todo-list-form {
    width: 100%;
    min-width: 0;
    padding: 4px 0 0;
  }

  .stored-tasks {
    padding: 14px;
    border: 1px solid #e3e8f1;
    border-radius: 14px;
    background: #f8f9ff;
  }

  .todo-task-card {
    margin-bottom: 12px;
    padding: 14px;
    border: 1px solid #e3e8f1;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 6px 18px rgba(20, 31, 61, 0.045);
  }

  .task-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .form-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .todo-list-footer {
    align-items: center;
    padding-top: 4px;
  }

  .todo-list-footer > .MuiGrid-item:last-child {
    display: flex;
    justify-content: flex-end;
  }

  @media only screen and (max-width: 600px) {
    .todo-task-card,
    .stored-tasks {
      padding: 12px;
    }

    .task-actions,
    .todo-list-footer > .MuiGrid-item:last-child {
      justify-content: flex-start;
    }
  }
`;

export default StyledTodoList;
