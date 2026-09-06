import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

interface FailureReasonDialogProps {
  open: boolean;
  activityTitle?: string;
  initialValue?: string;
  isSaving?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

const MAX_REASON_LENGTH = 180;

const FailureReasonDialog = ({
  open,
  activityTitle,
  initialValue = "",
  isSaving = false,
  onClose,
  onConfirm,
}: FailureReasonDialogProps) => {
  const [reason, setReason] = useState(initialValue);

  useEffect(() => {
    if (open) setReason(initialValue);
  }, [initialValue, open]);

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="failure-reason-title"
    >
      <DialogTitle id="failure-reason-title">Чому не виконано?</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          {activityTitle ? `«${activityTitle}»` : "Активність"}. Одне коротке
          речення допоможе точніше проаналізувати тиждень. Поле можна залишити
          порожнім.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          label="Що завадило?"
          placeholder="Наприклад: погано спав і не мав енергії"
          value={reason}
          disabled={isSaving}
          onChange={(event) => setReason(event.target.value)}
          inputProps={{ maxLength: MAX_REASON_LENGTH }}
          helperText={`${reason.length}/${MAX_REASON_LENGTH}`}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button disabled={isSaving} onClick={onClose}>
          Скасувати
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={isSaving}
          onClick={() => onConfirm(reason.trim())}
        >
          {isSaving ? "Зберігаю…" : "Позначити невиконаним"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FailureReasonDialog;
