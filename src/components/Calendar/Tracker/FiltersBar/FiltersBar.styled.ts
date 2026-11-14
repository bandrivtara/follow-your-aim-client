import styled from "@emotion/styled";
import { Row } from "antd";

const StyledFiltersBarRow = styled(Row)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid #e7e0d8;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(64, 48, 35, 0.06);

  .calendar-navigation,
  .tracker-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tracker-filters {
    justify-content: space-between;
  }

  .mobile-filters-toggle {
    display: none;
  }

  .tracker-filters .ant-select {
    min-width: 210px;
  }

  @media only screen and (max-width: 768px) {
    padding: 10px;

    .calendar-navigation,
    .tracker-filters {
      align-items: stretch;
    }

    .mobile-filters-toggle {
      display: block;
      width: 100%;
    }

    .tracker-filters--hidden {
      display: none;
    }

    .calendar-navigation .ant-picker-range {
      display: none;
    }

    .tracker-filters .ant-select,
    .tracker-filters .ant-radio-group {
      width: 100%;
    }

    .ant-radio-group {
      display: flex;
    }

    .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
    }
  }
`;

export default StyledFiltersBarRow;
