import { useEffect, useState } from "react";
import {
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

  useEffect(() => {
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

  return (
    <Dialog
      open={Boolean(habit)}
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
            <TextField
              key={field.id}
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
  );
};

export default QuickMeasureDialog;
