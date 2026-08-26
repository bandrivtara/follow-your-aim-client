import { useEffect, useMemo, useState } from "react";
import {
  CheckRounded,
  PauseRounded,
  PlayArrowRounded,
  ReplayRounded,
  TimerOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { IHabitData, IHabitField } from "types/habits.types";
import {
  formatFocusTime,
  getFocusTimerStorageKey,
  getRecordedMinutes,
  parseFocusTimerSession,
} from "./focusTimer";

interface FocusTimerDialogProps {
  open: boolean;
  habit: IHabitData;
  field: IHabitField;
  currentValue: number;
  targetValue?: number;
  isSaving: boolean;
  onClose: () => void;
  onCommit: (value: number) => void;
}

const FocusTimerDialog = ({
  open,
  habit,
  field,
  currentValue,
  targetValue,
  isSaving,
  onClose,
  onCommit,
}: FocusTimerDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const storageKey = useMemo(
    () =>
      getFocusTimerStorageKey(
        dayjs().format("YYYY-MM-DD"),
        habit.id,
        field.id,
      ),
    [field.id, habit.id],
  );

  useEffect(() => {
    if (!open) return;
    const session = parseFocusTimerSession(localStorage.getItem(storageKey));
    setElapsedSeconds(session.elapsedSeconds);
    setIsRunning(false);
  }, [open, storageKey]);

  useEffect(() => {
    if (!open || !isRunning) return undefined;
    const interval = window.setInterval(
      () => setElapsedSeconds((seconds) => seconds + 1),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [isRunning, open]);

  useEffect(() => {
    if (!open) return;
    localStorage.setItem(storageKey, JSON.stringify({ elapsedSeconds }));
  }, [elapsedSeconds, open, storageKey]);

  const targetMinutes = Math.max(
    0,
    Number(targetValue || field.minToComplete) || 0,
  );
  const elapsedMinutes = getRecordedMinutes(elapsedSeconds);
  const progress = targetMinutes
    ? Math.min(100, (elapsedMinutes / targetMinutes) * 100)
    : 0;

  const handleClose = () => {
    setIsRunning(false);
    onClose();
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    localStorage.removeItem(storageKey);
  };

  const handleCommit = () => {
    if (!elapsedSeconds) return;
    setIsRunning(false);
    localStorage.removeItem(storageKey);
    onCommit(Number((currentValue + elapsedMinutes).toFixed(1)));
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : handleClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 5,
          background:
            "radial-gradient(circle at 50% 18%, #eef0ff 0, #ffffff 46%)",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TimerOutlined color="primary" />
        Фокус-таймер
      </DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={3} py={{ xs: 3, sm: 4 }}>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={800}>
              {habit.title}
            </Typography>
            <Typography color="text.secondary" mt={0.5}>
              Ціль: {targetMinutes || "—"} {field.unit}
            </Typography>
          </Box>

          <Box
            position="relative"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={220}
              thickness={2.4}
              sx={{ color: "#e7e9f2" }}
            />
            <CircularProgress
              variant="determinate"
              value={progress}
              size={220}
              thickness={2.4}
              sx={{ position: "absolute", color: "#5b6cf9" }}
            />
            <Box position="absolute" textAlign="center">
              <Typography
                component="div"
                sx={{ fontSize: "2.8rem", fontWeight: 850, letterSpacing: "-0.05em" }}
              >
                {formatFocusTime(elapsedSeconds)}
              </Typography>
              <Typography color="text.secondary">
                {elapsedMinutes} хв зафіксовано
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              aria-label="Скинути таймер"
              disabled={isSaving || elapsedSeconds === 0}
              onClick={handleReset}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <ReplayRounded />
            </IconButton>
            <Button
              size="large"
              variant="contained"
              startIcon={isRunning ? <PauseRounded /> : <PlayArrowRounded />}
              disabled={isSaving}
              onClick={() => setIsRunning((running) => !running)}
              sx={{ minWidth: 170, borderRadius: 999, py: 1.35 }}
            >
              {isRunning
                ? "Пауза"
                : elapsedSeconds
                  ? "Продовжити"
                  : "Почати"}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Можеш закрити вікно й повернутися пізніше — накопичений час
            залишиться на цьому пристрої.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={isSaving} onClick={handleClose}>
          Закрити
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckRounded />}
          disabled={isSaving || elapsedSeconds === 0}
          onClick={handleCommit}
        >
          {isSaving ? "Зберігаю…" : "Завершити й зарахувати"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FocusTimerDialog;
