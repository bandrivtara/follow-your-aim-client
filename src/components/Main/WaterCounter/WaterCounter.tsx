import { useCallback, useEffect, useState } from "react";
import { Button, Radio, RadioChangeEvent, Space } from "antd";
import StyledWaterCounter from "./WaterCounter.styled";
import {
  useGetHabitQuery,
  useUpdateHabitMutation,
} from "store/services/habits";
import habitsConfig from "config/habitsIds.json";
import dayjs from "dayjs";
import _ from "lodash";

const WaterCounter = () => {
  const today = dayjs().format("YYYY.MM.D");

  const waterHabitId = habitsConfig.habits.water;
  const [updateHabit] = useUpdateHabitMutation();
  const habitDetails = useGetHabitQuery(waterHabitId);

  const [waterSize, setWaterSize] = useState(500);
  const [waterCount, setWaterCount] = useState(0);

  const handleMlChange = (event: RadioChangeEvent) =>
    setWaterSize(event.target.value);

  const minToComplete = 3000;

  useEffect(() => {
    // const currentValue = _.get(habitDetails.data?.history, today);
    // if (currentValue) {
    //   setWaterCount(currentValue.value);
    // }
  }, [habitDetails, today]);

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

  const onCounterChange = async (newValue: number) => {
    const habitToUpdate = {
      id: waterHabitId,
      data: { value: newValue },
      path: `history.${today}`,
    };

    await updateHabit(habitToUpdate).unwrap();
  };

  return (
    <StyledWaterCounter title="Лічильник води">
      <Space.Compact>
        <Button
          onClick={() => {
            if (waterCount - waterSize > 0) {
              onCounterChange(waterCount - waterSize);
            } else {
              onCounterChange(0);
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
            onCounterChange(waterCount + waterSize);
          }}
        >
          +
        </Button>
      </Space.Compact>
    </StyledWaterCounter>
  );
};

export default WaterCounter;
