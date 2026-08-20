import { MouseEvent } from "react";
import { Button } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

interface IProps {
  handleDecline: (event: MouseEvent<HTMLElement>) => void;
  handleDelete?: (event: MouseEvent<HTMLElement>) => void;
}

const FormButtons = ({
  handleDecline,
  handleDelete,
}: IProps) => {
  return (
    <div className="form-buttons">
      <Button
        htmlType="submit"
        type="primary"
        icon={<CheckOutlined rev={"value"} />}
        size="large"
      >
        Зберегти
      </Button>
      <Button
        icon={<CloseOutlined rev={"value"} />}
        size="large"
        onClick={handleDecline}
      >
        Скасувати
      </Button>
      {handleDelete && (
        <Button
          danger
          icon={<DeleteOutlined rev="value" />}
          size="large"
          onClick={handleDelete}
        >
          Очистити запис
        </Button>
      )}
    </div>
  );
};

export default FormButtons;
