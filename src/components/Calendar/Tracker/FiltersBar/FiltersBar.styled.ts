import styled from "@emotion/styled";
import { Row } from "antd";

const StyledFiltersBarRow = styled(Row)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .filters > div {
    margin-right: 10px;
  }

  @media only screen and (max-width: 768px) {
    .filters > div {
      width: 100%;
      margin-bottom: 10px;
    }
  }
`;

export default StyledFiltersBarRow;
