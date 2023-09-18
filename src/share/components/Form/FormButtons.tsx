import { MouseEvent } from "react";
import { Button } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

interface IProps {
  handleDecline: (event: MouseEvent<HTMLElement>) => void;
  handleDelete: (event: MouseEvent<HTMLElement>) => void;
}

const FormButtons = ({ handleDecline, handleDelete }: IProps) => {
  return (
    <>
      <Button
        htmlType="submit"
        type="primary"
        icon={<CheckOutlined rev={"value"} />}
        size={"large"}
      />
      <Button
        style={{ marginLeft: 20 }}
        danger
        type="primary"
        icon={<CloseOutlined rev={"value"} />}
        size={"large"}
        onClick={handleDecline}
      />
      <Button
        style={{ marginLeft: 20 }}
        danger
        type="primary"
        icon={<DeleteOutlined rev="value" />}
        size={"large"}
        onClick={handleDelete}
      />
    </>
  );
};

export default FormButtons;
