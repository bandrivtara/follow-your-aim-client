import { useEffect } from "react";
import { Col, Form, FormInstance, InputNumber, Row } from "antd";
import { IDayCellEditor } from "../DayCellEditor";
import { ColDef } from "ag-grid-community";
import { useWatch } from "antd/es/form/Form";

interface IProps {
  data?: IDayCellEditor;
  colDef: ColDef<IDayCellEditor>;
  form: FormInstance;
}

export interface IMeal {
  receiptId?: string;
  title?: string;
  category?: string;
  description?: string;
  link?: string;
  status: "pending" | "failed" | "done";
  time?: string[];
  isEditOn?: boolean;
  initWeight?: number;
  nutritionalInformation?: {
    proteins: number;
    fats: number;
    carbohydrates: number;
    calories: number;
  };
}

const nutritionalInformationLimits = {
  proteins: 113,
  fats: 51,
  carbohydrates: 173,
  fibers: 28,
  calories: 1632,
  water: 3500,
  mealsCount: 6,
};

const DietaryHabit = ({ form }: IProps) => {
  const calories: IMeal[] = useWatch(["nutritionalData", "calories"], form);

  useEffect(() => {
    if (calories) {
      form.setFieldsValue({
        value: calories,
      });
    }
  }, [form, calories]);

  return (
    <div
      style={{
        maxHeight: "400px",
        overflowY: "auto",
        overflowX: "hidden",
        paddingLeft: "4px",
      }}
    >
      <Form.Item hidden name="value" noStyle></Form.Item>
      <a
        rel="noreferrer"
        href="https://www.tablycjakalorijnosti.com.ua/user/diary"
        target="_blank"
      >
        Відкрити раціон
      </a>
      <Row justify="space-between" style={{ margin: "10px 0" }}>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "mealsCount"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="К-сть прийомів"
              addonAfter={nutritionalInformationLimits.mealsCount}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="space-between" style={{ margin: "10px 0" }}>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "proteins"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="Білки"
              addonAfter={nutritionalInformationLimits.proteins}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "fats"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="Жири"
              addonAfter={nutritionalInformationLimits.fats}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="space-between" style={{ margin: "10px 0" }}>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "carbohydrates"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="Вуглеводи"
              addonAfter={nutritionalInformationLimits.carbohydrates}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "fibers"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="Волокна"
              addonAfter={nutritionalInformationLimits.fibers}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="space-between" style={{ margin: "10px 0" }}>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "calories"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="Ккал"
              addonAfter={nutritionalInformationLimits.calories}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name={["nutritionalData", "water"]}
            noStyle
            initialValue={0}
          >
            <InputNumber
              addonBefore="Вода (мл)"
              addonAfter={nutritionalInformationLimits.water}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default DietaryHabit;
