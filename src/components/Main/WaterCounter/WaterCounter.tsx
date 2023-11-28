import { useCallback, useState } from "react";
import { Liquid } from "@ant-design/charts";
import { Button, Card, Radio, RadioChangeEvent, Space } from "antd";
import StyledWaterCounter from "./WaterCounter.styled";

const WaterCounter = () => {
  const [waterSize, setWaterSize] = useState(500);
  const [waterCount, setWaterCount] = useState(0);

  const handleMlChange = (event: RadioChangeEvent) =>
    setWaterSize(event.target.value);

  const minToComplete = 3000;

  const liquidConfig = useCallback(
    () => ({
      autoFit: true,
      percent: waterCount / minToComplete,
      outline: {
        border: 8,
        distance: 8,
      },
      wave: {
        length: 128,
      },
      statistic: {
        content: {
          formatter: () => `${waterCount}/${minToComplete}`,
        },
      },
    }),
    [waterCount]
  );

  return (
    <StyledWaterCounter title="Лічильник води">
      <Space.Compact>
        <Button
          onClick={() => {
            if (waterCount - waterSize > 0) {
              setWaterCount(waterCount - waterSize);
            } else {
              setWaterCount(0);
            }
          }}
        >
          -
        </Button>
        <Radio.Group value={waterSize} onChange={handleMlChange}>
          <Radio.Button value={200}>200ml</Radio.Button>
          <Radio.Button value={500}>500ml</Radio.Button>
          <Radio.Button value={1000}>1000ml</Radio.Button>
        </Radio.Group>
        <Button
          onClick={() => {
            setWaterCount(waterCount + waterSize);
          }}
        >
          +
        </Button>
      </Space.Compact>

      <Liquid {...liquidConfig()} />
    </StyledWaterCounter>
  );
};

export default WaterCounter;
