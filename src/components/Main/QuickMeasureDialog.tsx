import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IHabitData } from "types/habits.types";

interface QuickMeasureDialogProps {
  habit?: IHabitData;
  source?: Record<string, any>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: Record<string, number>) => Promise<void>;
}

const QuickMeasureDialog = ({
  habit,
  source,
  isSaving,
  onClose,
  onSave,
}: QuickMeasureDialogProps) => {
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        (habit?.fields || []).map((field) => [
          field.id,
          Number(source?.measures?.[field.id]?.value || 0),
        ]),
      ),
    [habit?.fields, source?.measures],
  );
  const [values, setValues] = useState<Record<string, number>>(initialValues);

  useEffect(() => {
    if (habit) setValues(initialValues);
  }, [habit, initialValues]);

  return (
    <Dialog open={Boolean(habit)} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{habit?.title || "Зафіксувати результат"}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" mb={2}>
          Внеси фактичні значення за сьогодні.
        </Typography>
        <Stack spacing={2}>
          {(habit?.fields || []).map((field) => (
            <TextField
              key={field.id}
              type="number"
              label={`${field.name}${field.unit ? `, ${field.unit}` : ""}`}
              value={values[field.id] ?? 0}
              inputProps={{ min: 0 }}
              helperText={
                field.minToComplete
                  ? `Денна ціль: ${field.minToComplete}${field.unit ? ` ${field.unit}` : ""}`
                  : undefined
              }
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.id]: Number(event.target.value),
                }))
              }
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSaving} onClick={onClose}>Скасувати</Button>
        <Button
          variant="contained"
          disabled={isSaving || !habit?.fields?.length}
          startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : undefined}
          onClick={() => onSave(values)}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickMeasureDialog;
