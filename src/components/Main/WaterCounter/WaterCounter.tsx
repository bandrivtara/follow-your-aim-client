// @ts-nocheck

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { Gauge } from "@mui/x-charts/Gauge";
import { useGetHabitQuery } from "store/services/habits";
import habitsConfig from "config/habitsIds.json";
import dayjs from "dayjs";
import {
  useGetHistoryQuery,
  useUpdateHistoryMutation,
} from "store/services/history";

const WaterCounter = () => {
  const currentMonth = dayjs().format("YYYY-MM");
  const currentDay = dayjs().format("DD");
  const waterHabitId = habitsConfig.habits.water;
  const [updateHistory] = useUpdateHistoryMutation();
  const history = useGetHistoryQuery(currentMonth);
  const habitDetails = useGetHabitQuery(waterHabitId.details);

  const [waterSize, setWaterSize] = useState(500);
  const [waterCount, setWaterCount] = useState(0);
  const [minToComplete, setMinToComplete] = useState(0);

  const handleMlChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setWaterSize(Number(event.target.value));

  useEffect(() => {
    setMinToComplete(habitDetails.data?.fields[0].minToComplete);
  }, [habitDetails]);

  useEffect(() => {
    const currentValue =
      history.data?.[currentDay]?.[waterHabitId.details].measures[
        waterHabitId.measure
      ].value;
    setWaterCount(currentValue || 0);
    console.log(history);
  }, [currentDay, history, waterHabitId.details, waterHabitId.measure]);

  const onCounterChange = async (newValue: number) => {
    console.log(newValue, 123123);
    const historyToUpdate = {
      id: currentMonth,
      data: newValue,
      path: `${currentDay}.${waterHabitId.details}.measures.${waterHabitId.measure}.value`,
    };

    await updateHistory(historyToUpdate).unwrap();
    setWaterCount(newValue);
  };

  return (
    <Card sx={{ maxWidth: 275 }}>
      <Box sx={{ textAlign: "center", padding: 2 }}>
        <Typography variant="h5">Лічильник води</Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginY: 2,
          }}
        >
          <Button
            variant="contained"
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
          <RadioGroup
            row
            value={waterSize}
            onChange={handleMlChange}
            sx={{ marginX: 2 }}
          >
            <FormControlLabel value={200} control={<Radio />} label="200ml" />
            <FormControlLabel value={500} control={<Radio />} label="500ml" />
            <FormControlLabel value={1000} control={<Radio />} label="1000ml" />
          </RadioGroup>
          <Button
            variant="contained"
            onClick={() => {
              onCounterChange(+waterCount + +waterSize);
            }}
          >
            +
          </Button>
        </Box>
        <Gauge
          value={(waterCount / minToComplete) * 100}
          startAngle={0}
          endAngle={360}
          innerRadius="80%"
          outerRadius="100%"
          sx={{ marginTop: 2 }}
          height={200}
          text={`${waterCount}/${minToComplete} ml`}
        />
      </Box>
    </Card>
  );
};

export default WaterCounter;
