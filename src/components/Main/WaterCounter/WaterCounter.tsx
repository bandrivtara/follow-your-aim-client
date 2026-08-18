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
import { WaterDropRounded } from "@mui/icons-material";
import { useGetHabitQuery } from "store/services/habits";
import habitsConfig from "config/habitsIds.json";
import dayjs from "dayjs";
import {
  useGetHistoryQuery,
  useUpdateHistoryMutation,
} from "store/services/history";

interface WaterCounterProps {
  className?: string;
  compact?: boolean;
}

const WaterCounter = ({ className, compact = false }: WaterCounterProps) => {
  const currentMonth = dayjs().format("YYYY-MM");
  const currentDay = dayjs().format("DD");
  const waterHabitId = habitsConfig.habits.water;
  const [updateHistory, { isLoading: isSaving }] = useUpdateHistoryMutation();
  const history = useGetHistoryQuery(currentMonth);
  const habitDetails = useGetHabitQuery(waterHabitId.details);

  const [waterSize, setWaterSize] = useState(500);
  const [waterCount, setWaterCount] = useState(0);
  const [minToComplete, setMinToComplete] = useState(0);

  const handleMlChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setWaterSize(Number(event.target.value));

  useEffect(() => {
    setMinToComplete(habitDetails.data?.fields?.[0]?.minToComplete || 0);
  }, [habitDetails.data]);

  useEffect(() => {
    const currentValue =
      history.data?.[currentDay]?.[waterHabitId.details]?.measures?.[
        waterHabitId.measure
      ]?.value;
    setWaterCount(currentValue || 0);
  }, [currentDay, history, waterHabitId.details, waterHabitId.measure]);

  const onCounterChange = async (newValue: number) => {
    const historyToUpdate = {
      id: currentMonth,
      data: newValue,
      path: `${currentDay}.${waterHabitId.details}.measures.${waterHabitId.measure}.value`,
    };

    await updateHistory(historyToUpdate).unwrap();
    setWaterCount(newValue);
  };

  return (
    <Card
      className={className}
      sx={{ width: "100%", height: "100%", borderRadius: "18px" }}
    >
      <Box sx={{ padding: compact ? 2 : { xs: 2, sm: 2.5 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              display: "grid",
              width: 38,
              height: 38,
              placeItems: "center",
              color: "primary.main",
              borderRadius: 2.5,
              backgroundColor: "#eef0ff",
            }}
          >
            <WaterDropRounded />
          </Box>
          <Box>
            <Typography variant="h5">Вода сьогодні</Typography>
            <Typography variant="body2" color="text.secondary">
              Швидко зафіксуй наступну порцію
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: compact ? 1 : 1.5,
            marginTop: compact ? 1 : 2,
          }}
        >
          <RadioGroup
            row
            value={waterSize}
            onChange={handleMlChange}
            sx={{
              justifyContent: "center",
              flexWrap: "nowrap",
              "& .MuiFormControlLabel-root": { margin: "0 5px" },
            }}
          >
            <FormControlLabel value={200} control={<Radio />} label="200" />
            <FormControlLabel value={500} control={<Radio />} label="500" />
            <FormControlLabel value={1000} control={<Radio />} label="1000" />
          </RadioGroup>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: compact ? "minmax(0, 1fr) 118px" : "1fr",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <Button
                variant="outlined"
                aria-label="Зменшити кількість води"
                disabled={isSaving}
                onClick={() => {
                  if (waterCount - waterSize > 0) {
                    onCounterChange(waterCount - waterSize);
                  } else {
                    onCounterChange(0);
                  }
                }}
              >
                −
              </Button>
              <Typography minWidth={72} textAlign="center" fontWeight={750}>
                {waterCount} ml
              </Typography>
              <Button
                variant="contained"
                aria-label="Збільшити кількість води"
                disabled={isSaving}
                onClick={() => {
                  onCounterChange(+waterCount + +waterSize);
                }}
              >
                +
              </Button>
            </Box>
            <Gauge
              value={minToComplete ? (waterCount / minToComplete) * 100 : 0}
              startAngle={0}
              endAngle={360}
              innerRadius="80%"
              outerRadius="100%"
              sx={{
                "& .MuiGauge-valueArc": { fill: "#5b6cf9" },
                "& .MuiGauge-referenceArc": { fill: "#e9ecf3" },
                "& .MuiGauge-valueText": { fontWeight: 700, fill: "#172033" },
              }}
              height={compact ? 118 : 170}
              text={`${waterCount}/${minToComplete} ml`}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default WaterCounter;
