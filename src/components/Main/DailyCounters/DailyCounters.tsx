import { useEffect, useState } from "react";
import {
  AddRounded,
  DirectionsWalkRounded,
  RemoveRounded,
  SaveRounded,
  WaterDropRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  IconButton,
  LinearProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { message } from "antd";
import dayjs from "dayjs";
import habitsConfig from "config/habitsIds.json";
import { useGetHabitQuery } from "store/services/habits";
import {
  useGetHistoryQuery,
  useUpdateHistoryMutation,
} from "store/services/history";
import StyledDailyCounters from "./DailyCounters.styled";

interface DailyCountersProps {
  className?: string;
}

const clampProgress = (value: number, target: number) =>
  target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;

const formatLitres = (millilitres: number) =>
  `${(millilitres / 1000).toLocaleString("uk-UA", {
    maximumFractionDigits: 1,
  })} л`;

const formatSteps = (steps: number) =>
  Math.round(steps).toLocaleString("uk-UA");

const DailyCounters = ({ className }: DailyCountersProps) => {
  const currentMonth = dayjs().format("YYYY-MM");
  const currentDay = dayjs().format("DD");
  const waterHabit = habitsConfig.habits.water;
  const stepsHabit = habitsConfig.habits.steps;
  const [updateHistory, { isLoading: isSaving }] = useUpdateHistoryMutation();
  const history = useGetHistoryQuery(currentMonth);
  const waterDetails = useGetHabitQuery(waterHabit.details);
  const stepsDetails = useGetHabitQuery(stepsHabit.details);

  const [waterPortion, setWaterPortion] = useState(500);
  const [waterCount, setWaterCount] = useState(0);
  const [stepsCount, setStepsCount] = useState(0);
  const [stepsDraft, setStepsDraft] = useState("0");

  const waterTarget =
    waterDetails.data?.fields?.find(
      (field) => field.id === waterHabit.measure,
    )?.minToComplete || 0;
  const stepsTarget =
    stepsDetails.data?.fields?.find(
      (field) => field.id === stepsHabit.measure,
    )?.minToComplete || 0;

  useEffect(() => {
    const todayHistory = history.data?.[currentDay];
    const savedWater = Number(
      todayHistory?.[waterHabit.details]?.measures?.[waterHabit.measure]?.value,
    );
    const savedSteps = Number(
      todayHistory?.[stepsHabit.details]?.measures?.[stepsHabit.measure]?.value,
    );
    setWaterCount(Number.isFinite(savedWater) ? savedWater : 0);
    setStepsCount(Number.isFinite(savedSteps) ? savedSteps : 0);
    setStepsDraft(String(Number.isFinite(savedSteps) ? savedSteps : 0));
  }, [
    currentDay,
    history.data,
    stepsHabit.details,
    stepsHabit.measure,
    waterHabit.details,
    waterHabit.measure,
  ]);

  const saveMeasure = async (
    habitId: string,
    measureId: string,
    nextValue: number,
    onSaved: (value: number) => void,
  ) => {
    const safeValue = Math.max(0, Math.round(nextValue));

    try {
      await updateHistory({
        id: currentMonth,
        data: safeValue,
        path: `${currentDay}.${habitId}.measures.${measureId}.value`,
      }).unwrap();
      onSaved(safeValue);
    } catch {
      message.error("Не вдалося зберегти результат. Спробуй ще раз.");
    }
  };

  const saveWater = (nextValue: number) =>
    saveMeasure(
      waterHabit.details,
      waterHabit.measure,
      nextValue,
      setWaterCount,
    );

  const saveSteps = (nextValue: number) =>
    saveMeasure(stepsHabit.details, stepsHabit.measure, nextValue, (value) => {
      setStepsCount(value);
      setStepsDraft(String(value));
    });

  const saveStepsDraft = () => {
    const nextValue = Number(stepsDraft);
    if (!Number.isFinite(nextValue)) {
      setStepsDraft(String(stepsCount));
      return;
    }
    saveSteps(nextValue);
  };

  return (
    <StyledDailyCounters className={className}>
      <Card className="counter-card counter-card--water">
        <Box className="counter-content">
          <Box className="counter-heading">
            <Box className="counter-icon counter-icon--water">
              <WaterDropRounded />
            </Box>
            <Box minWidth={0}>
              <Typography variant="h5">Вода</Typography>
              <Typography variant="body2" color="text.secondary">
                Сьогодні · ціль {formatLitres(waterTarget)}
              </Typography>
            </Box>
            <Typography className="counter-value">
              {formatLitres(waterCount)}
            </Typography>
          </Box>

          <Box className="counter-progress-label">
            <span>Прогрес</span>
            <strong>{Math.round(clampProgress(waterCount, waterTarget))}%</strong>
          </Box>
          <LinearProgress
            className="counter-progress counter-progress--water"
            variant="determinate"
            value={clampProgress(waterCount, waterTarget)}
            aria-label={`Випито ${formatLitres(waterCount)} з ${formatLitres(waterTarget)}`}
          />

          <Box className="counter-controls">
            <ToggleButtonGroup
              className="portion-options"
              exclusive
              size="small"
              value={waterPortion}
              aria-label="Розмір порції води"
              onChange={(_, value) => value && setWaterPortion(Number(value))}
            >
              <ToggleButton value={200}>0,2 л</ToggleButton>
              <ToggleButton value={500}>0,5 л</ToggleButton>
              <ToggleButton value={1000}>1 л</ToggleButton>
            </ToggleButtonGroup>
            <Box className="counter-actions">
              <Tooltip title={`Відняти ${formatLitres(waterPortion)}`}>
                <span>
                  <IconButton
                    aria-label={`Відняти ${formatLitres(waterPortion)} води`}
                    disabled={isSaving || waterCount === 0}
                    onClick={() => saveWater(waterCount - waterPortion)}
                  >
                    <RemoveRounded />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                disabled={isSaving}
                onClick={() => saveWater(waterCount + waterPortion)}
              >
                Додати
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      <Card className="counter-card counter-card--steps">
        <Box className="counter-content">
          <Box className="counter-heading">
            <Box className="counter-icon counter-icon--steps">
              <DirectionsWalkRounded />
            </Box>
            <Box minWidth={0}>
              <Typography variant="h5">Кроки</Typography>
              <Typography variant="body2" color="text.secondary">
                Сьогодні · ціль {formatSteps(stepsTarget)}
              </Typography>
            </Box>
            <Typography className="counter-value">
              {formatSteps(stepsCount)}
            </Typography>
          </Box>

          <Box className="counter-progress-label">
            <span>Прогрес</span>
            <strong>{Math.round(clampProgress(stepsCount, stepsTarget))}%</strong>
          </Box>
          <LinearProgress
            className="counter-progress counter-progress--steps"
            variant="determinate"
            value={clampProgress(stepsCount, stepsTarget)}
            aria-label={`Пройдено ${formatSteps(stepsCount)} з ${formatSteps(stepsTarget)} кроків`}
          />

          <Box className="steps-controls">
            <TextField
              className="steps-input"
              size="small"
              type="number"
              label="Кроки сьогодні"
              value={stepsDraft}
              inputProps={{ min: 0, step: 500, inputMode: "numeric" }}
              onChange={(event) => setStepsDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveStepsDraft();
              }}
            />
            <Tooltip title="Зберегти точну кількість">
              <span>
                <IconButton
                  className="steps-save"
                  aria-label="Зберегти кількість кроків"
                  disabled={isSaving}
                  onClick={saveStepsDraft}
                >
                  <SaveRounded />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              disabled={isSaving}
              onClick={() => saveSteps(stepsCount + 500)}
            >
              +500
            </Button>
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={() => saveSteps(stepsCount + 1000)}
            >
              +1 000
            </Button>
          </Box>
        </Box>
      </Card>
    </StyledDailyCounters>
  );
};

export default DailyCounters;
