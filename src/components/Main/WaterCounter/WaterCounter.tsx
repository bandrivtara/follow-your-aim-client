import { useCallback, useEffect, useState } from "react";
import { Liquid } from "@ant-design/charts";
import { Button, Radio, RadioChangeEvent, Space } from "antd";
import StyledWaterCounter from "./WaterCounter.styled";
import {
  useGetActivityQuery,
  useUpdateActivityMutation,
} from "../../../store/services/activity";
import activitiesConfig from "../../../config/activitiesIds.json";
import dayjs from "dayjs";
import _ from "lodash";

const WaterCounter = () => {
  const today = dayjs().format("YYYY.MM.D");

  const waterActivityId = activitiesConfig.activities.water;
  const [updateActivity] = useUpdateActivityMutation();
  const activityDetails = useGetActivityQuery(waterActivityId);

  const [waterSize, setWaterSize] = useState(500);
  const [waterCount, setWaterCount] = useState(0);

  const handleMlChange = (event: RadioChangeEvent) =>
    setWaterSize(event.target.value);

  const minToComplete = 3000;

  useEffect(() => {
    const currentValue = _.get(activityDetails.data?.history, today);

    if (currentValue) {
      setWaterCount(currentValue.value);
    }
  }, [activityDetails, today]);

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
    const activityToUpdate = {
      id: waterActivityId,
      data: { value: newValue },
      path: `history.${today}`,
    };

    await updateActivity(activityToUpdate).unwrap();
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

      <Liquid {...liquidConfig()} />
    </StyledWaterCounter>
  );
};

export default WaterCounter;
