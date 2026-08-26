import { useEffect, useState } from "react";
import { TimerOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IHabitData } from "types/habits.types";
import FocusTimerDialog from "./FocusTimerDialog";
import { isMinuteUnit } from "./focusTimer";

interface QuickMeasureDialogProps {
  habit?: IHabitData;
  source?: Record<string, any>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: Record<string, number>) => void;
}

const QuickMeasureDialog = ({
  habit,
  source,
  isSaving,
  onClose,
  onSave,
}: QuickMeasureDialogProps) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [timerFieldId, setTimerFieldId] = useState<string>();

  useEffect(() => {
    setTimerFieldId(undefined);
    setValues(
      Object.fromEntries(
        (habit?.fields || []).map((field) => [
          field.id,
          Number(
            source?.measures?.[field.id]?.value ||
              source?.measures?.[field.id]?.plannedValue ||
              field.minToComplete ||
              0,
          ),
        ]),
      ),
    );
  }, [habit, source]);

  const timerField = habit?.fields?.find(
    (field) => field.id === timerFieldId,
  );

  return (
    <>
      <Dialog
      open={Boolean(habit) && !timerField}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{habit?.title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" mb={2}>
          Внеси фактичний результат за сьогодні.
        </Typography>
        <Stack spacing={2}>
          {(habit?.fields || []).map((field) => (
            <Box key={field.id}>
              <TextField
                fullWidth
                autoFocus={(habit?.fields || [])[0]?.id === field.id}
                type="number"
                label={field.name}
                value={values[field.id] ?? ""}
                inputProps={{ min: 0, inputMode: "decimal" }}
                InputProps={{ endAdornment: field.unit }}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.id]: Number(event.target.value),
                  }))
                }
              />
              {isMinuteUnit(field.unit) && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TimerOutlined />}
                  onClick={() => setTimerFieldId(field.id)}
                  sx={{ mt: 1, borderRadius: 3, py: 1 }}
                >
                  Відкрити фокус-таймер
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSaving} onClick={onClose}>
          Скасувати
        </Button>
        <Button
          variant="contained"
          disabled={isSaving || !(habit?.fields || []).length}
          onClick={() => onSave(values)}
        >
          {isSaving ? "Зберігаю…" : "Зберегти"}
        </Button>
      </DialogActions>
      </Dialog>
      {habit && timerField && (
        <FocusTimerDialog
          open
          habit={habit}
          field={timerField}
          currentValue={Number(
            source?.measures?.[timerField.id]?.value || 0,
          )}
          targetValue={Number(
            source?.measures?.[timerField.id]?.plannedValue ||
              timerField.minToComplete ||
              0,
          )}
          isSaving={isSaving}
          onClose={() => setTimerFieldId(undefined)}
          onCommit={(value) => {
            const nextValues = Object.fromEntries(
              (habit.fields || []).map((field) => [
                field.id,
                Number(source?.measures?.[field.id]?.value || 0),
              ]),
            );
            nextValues[timerField.id] = value;
            setValues(nextValues);
            onSave(nextValues);
          }}
        />
      )}
    </>
  );
};

export default QuickMeasureDialog;
