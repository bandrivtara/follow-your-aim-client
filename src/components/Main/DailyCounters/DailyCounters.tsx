import { useEffect, useRef, useState } from "react";
import {
  AddRounded,
  DirectionsWalkRounded,
  EditRounded,
  InfoOutlined,
  LocalFireDepartmentRounded,
  RemoveRounded,
  SaveRounded,
  SyncRounded,
  WaterDropRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { Gauge } from "@mui/x-charts/Gauge";
import { message } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import habitsConfig from "config/habitsIds.json";
import { useGetHabitQuery } from "store/services/habits";
import { useEnsureAppleHealthCaloriesHabitMutation } from "store/services/appleHealth";
import {
  useGetHistoryQuery,
  useUpdateHistoryMutation,
} from "store/services/history";
import StyledDailyCounters from "./DailyCounters.styled";
import AppleHealthSetupDialog from "./AppleHealthSetupDialog";
import {
  APPLE_HEALTH_PENDING_KEY,
  PendingAppleHealthSync,
  buildAppleHealthCallbackUrl,
  buildAppleHealthShortcutUrl,
  createAppleHealthNonce,
  parseAppleHealthCallback,
} from "./appleHealthSync";

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
  const location = useLocation();
  const navigate = useNavigate();
  const currentMonth = dayjs().format("YYYY-MM");
  const currentDay = dayjs().format("DD");
  const waterHabit = habitsConfig.habits.water;
  const stepsHabit = habitsConfig.habits.steps;
  const caloriesHabit = habitsConfig.habits.activeCalories;
  const processedCallback = useRef("");
  const [updateHistory, { isLoading: isSaving }] = useUpdateHistoryMutation();
  const [ensureCaloriesHabit] = useEnsureAppleHealthCaloriesHabitMutation();
  const history = useGetHistoryQuery(currentMonth);
  const waterDetails = useGetHabitQuery(waterHabit.details);
  const stepsDetails = useGetHabitQuery(stepsHabit.details);

  const [waterPortion, setWaterPortion] = useState(500);
  const [waterCount, setWaterCount] = useState(0);
  const [stepsCount, setStepsCount] = useState(0);
  const [stepsDraft, setStepsDraft] = useState("0");
  const [activeCalories, setActiveCalories] = useState(0);
  const [isHealthSyncing, setIsHealthSyncing] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isStepsEditorOpen, setIsStepsEditorOpen] = useState(false);

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
    const savedCalories = Number(
      todayHistory?.[caloriesHabit.details]?.measures?.[caloriesHabit.measure]
        ?.value,
    );

    setWaterCount(Number.isFinite(savedWater) ? savedWater : 0);
    setStepsCount(Number.isFinite(savedSteps) ? savedSteps : 0);
    setStepsDraft(String(Number.isFinite(savedSteps) ? savedSteps : 0));
    setActiveCalories(Number.isFinite(savedCalories) ? savedCalories : 0);
  }, [
    caloriesHabit.details,
    caloriesHabit.measure,
    currentDay,
    history.data,
    stepsHabit.details,
    stepsHabit.measure,
    waterHabit.details,
    waterHabit.measure,
  ]);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has("healthSync")) return;
    if (processedCallback.current === location.search) return;
    processedCallback.current = location.search;

    let pendingSync: PendingAppleHealthSync | null = null;
    try {
      const storedSync = localStorage.getItem(APPLE_HEALTH_PENDING_KEY);
      pendingSync = storedSync ? JSON.parse(storedSync) : null;
    } catch {
      pendingSync = null;
    }

    const result = parseAppleHealthCallback(location.search, pendingSync);
    const clearCallback = () =>
      navigate({ pathname: location.pathname, search: "" }, { replace: true });

    if (!result.payload) {
      message.error(result.error);
      clearCallback();
      return;
    }

    setIsHealthSyncing(true);
    const payload = result.payload;
    const payloadDate = dayjs(payload.date);
    const monthId = payloadDate.format("YYYY-MM");
    const dayId = payloadDate.format("DD");

    void (async () => {
      try {
        await ensureCaloriesHabit().unwrap();
        await Promise.all([
          updateHistory({
            id: monthId,
            data: payload.steps,
            path: `${dayId}.${stepsHabit.details}.measures.${stepsHabit.measure}.value`,
          }).unwrap(),
          updateHistory({
            id: monthId,
            data: payload.activeCalories,
            path: `${dayId}.${caloriesHabit.details}.measures.${caloriesHabit.measure}.value`,
          }).unwrap(),
        ]);

        setStepsCount(payload.steps);
        setStepsDraft(String(payload.steps));
        setActiveCalories(payload.activeCalories);
        localStorage.removeItem(APPLE_HEALTH_PENDING_KEY);
        message.success(
          `Apple Health: ${formatSteps(payload.steps)} кроків · ${formatSteps(
            payload.activeCalories,
          )} ккал`,
        );
      } catch {
        message.error("Не вдалося зберегти дані Apple Health.");
      } finally {
        setIsHealthSyncing(false);
        clearCallback();
      }
    })();
  }, [
    caloriesHabit.details,
    caloriesHabit.measure,
    ensureCaloriesHabit,
    location.pathname,
    location.search,
    navigate,
    stepsHabit.details,
    stepsHabit.measure,
    updateHistory,
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

  const launchAppleHealthSync = () => {
    const nonce = createAppleHealthNonce();
    localStorage.setItem(
      APPLE_HEALTH_PENDING_KEY,
      JSON.stringify({ nonce, createdAt: Date.now() }),
    );
    const callbackUrl = buildAppleHealthCallbackUrl(
      window.location.origin,
      window.location.pathname,
      nonce,
    );

    window.location.assign(buildAppleHealthShortcutUrl(callbackUrl));
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

      <Card className="counter-card activity-card">
        <Box className="activity-metrics">
          <Box className="activity-metric activity-metric--steps">
            <Box className="mini-metric-heading">
              <Box className="counter-icon counter-icon--steps">
                <DirectionsWalkRounded />
              </Box>
              <Box minWidth={0}>
                <Typography variant="h6">Кроки</Typography>
                <Typography variant="caption" color="text.secondary">
                  Ціль {formatSteps(stepsTarget)}
                </Typography>
              </Box>
              <Tooltip title="Ввести кроки вручну">
                <IconButton
                  size="small"
                  aria-label="Ввести кроки вручну"
                  onClick={() => setIsStepsEditorOpen(true)}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className="metric-gauge-row">
              <Gauge
                width={82}
                height={82}
                value={clampProgress(stepsCount, stepsTarget)}
                startAngle={0}
                endAngle={360}
                innerRadius="78%"
                outerRadius="100%"
                text={`${Math.round(clampProgress(stepsCount, stepsTarget))}%`}
                sx={{
                  "& .MuiGauge-valueArc": { fill: "#14b8a6" },
                  "& .MuiGauge-referenceArc": { fill: "#e9f4f2" },
                  "& .MuiGauge-valueText": { fontSize: 14, fontWeight: 800 },
                }}
              />
              <Box>
                <Typography className="mini-metric-value">
                  {formatSteps(stepsCount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  сьогодні
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="activity-metric activity-metric--calories">
            <Box className="mini-metric-heading">
              <Box className="counter-icon counter-icon--calories">
                <LocalFireDepartmentRounded />
              </Box>
              <Box minWidth={0}>
                <Typography variant="h6">Калорії</Typography>
                <Typography variant="caption" color="text.secondary">
                  Ціль {caloriesHabit.target} ккал
                </Typography>
              </Box>
            </Box>
            <Box className="metric-gauge-row">
              <Gauge
                width={82}
                height={82}
                value={clampProgress(activeCalories, caloriesHabit.target)}
                startAngle={0}
                endAngle={360}
                innerRadius="78%"
                outerRadius="100%"
                text={`${Math.round(
                  clampProgress(activeCalories, caloriesHabit.target),
                )}%`}
                sx={{
                  "& .MuiGauge-valueArc": { fill: "#f97316" },
                  "& .MuiGauge-referenceArc": { fill: "#fff0e8" },
                  "& .MuiGauge-valueText": { fontSize: 14, fontWeight: 800 },
                }}
              />
              <Box>
                <Typography className="mini-metric-value">
                  {formatSteps(activeCalories)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ккал сьогодні
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="health-sync-footer">
          <Button
            variant="contained"
            startIcon={<SyncRounded />}
            disabled={isHealthSyncing || isSaving}
            onClick={launchAppleHealthSync}
          >
            {isHealthSyncing ? "Синхронізація…" : "Apple Health"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Оновлює обидва показники
          </Typography>
          <Tooltip title="Як налаштувати Apple Shortcut">
            <IconButton
              size="small"
              aria-label="Інструкція налаштування Apple Health"
              onClick={() => setIsSetupOpen(true)}
            >
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      <Dialog
        open={isStepsEditorOpen}
        onClose={() => setIsStepsEditorOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Кроки сьогодні</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            sx={{ marginTop: 1 }}
            type="number"
            label="Точна кількість"
            value={stepsDraft}
            inputProps={{ min: 0, step: 500, inputMode: "numeric" }}
            onChange={(event) => setStepsDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveStepsDraft();
                setIsStepsEditorOpen(false);
              }
            }}
          />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} mt={2}>
            <Button
              variant="outlined"
              disabled={isSaving}
              onClick={() => saveSteps(stepsCount + 500)}
            >
              +500
            </Button>
            <Button
              variant="outlined"
              disabled={isSaving}
              onClick={() => saveSteps(stepsCount + 1000)}
            >
              +1 000
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStepsEditorOpen(false)}>Скасувати</Button>
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            disabled={isSaving}
            onClick={() => {
              saveStepsDraft();
              setIsStepsEditorOpen(false);
            }}
          >
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>

      <AppleHealthSetupDialog
        open={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />
    </StyledDailyCounters>
  );
};

export default DailyCounters;
