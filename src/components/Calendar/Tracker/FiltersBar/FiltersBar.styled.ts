import styled from "@emotion/styled";
import { Row } from "antd";

const StyledFiltersBarRow = styled(Row)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid var(--fya-border);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--fya-shadow);

  .calendar-navigation,
  .tracker-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tracker-filters {
    padding-top: 12px;
    border-top: 1px solid #edf0f5;
  }

  .mobile-filters-toggle {
    display: none;
  }

  .tracker-filters .ant-select {
    min-width: 210px;
  }

  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    box-shadow: 0 6px 14px rgba(91, 108, 249, 0.16);
  }

  @media only screen and (max-width: 768px) {
    padding: 12px;

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

    .tracker-filters {
      padding-top: 10px;
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
