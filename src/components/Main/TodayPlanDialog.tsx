import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  ContentCopyOutlined,
  EventRepeatOutlined,
  TuneOutlined,
} from "@mui/icons-material";

interface TodayPlanDialogProps {
  open: boolean;
  canCopyYesterday: boolean;
  canCopyPreviousWeek: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCopyYesterday: () => void;
  onCopyPreviousWeek: () => void;
  onOpenPlanning: () => void;
}

const TodayPlanDialog = ({
  open,
  canCopyYesterday,
  canCopyPreviousWeek,
  isSaving,
  onClose,
  onCopyYesterday,
  onCopyPreviousWeek,
  onOpenPlanning,
}: TodayPlanDialogProps) => (
  <Dialog
    open={open}
    onClose={isSaving ? undefined : onClose}
    fullWidth
    maxWidth="xs"
  >
    <DialogTitle>Сформувати план дня</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" mb={2}>
        Обери найшвидший спосіб. Копіювання переносить лише план, а виконання й
        виміряні значення починаються з нуля.
      </Typography>
      <Stack spacing={1.5}>
        <Button
          variant="contained"
          startIcon={<EventRepeatOutlined />}
          disabled={!canCopyPreviousWeek || isSaving}
          onClick={onCopyPreviousWeek}
        >
          {isSaving ? "Копіюю…" : "Скопіювати такий самий день минулого тижня"}
        </Button>
        {!canCopyPreviousWeek && (
          <Typography variant="caption" color="text.secondary">
            У такий самий день минулого тижня немає готового плану.
          </Typography>
        )}
        <Button
          variant="outlined"
          startIcon={<ContentCopyOutlined />}
          disabled={!canCopyYesterday || isSaving}
          onClick={onCopyYesterday}
        >
          {isSaving ? "Копіюю…" : "Скопіювати вчорашній план"}
        </Button>
        {!canCopyYesterday && (
          <Typography variant="caption" color="text.secondary">
            Учора немає запланованих активностей, які можна перенести.
          </Typography>
        )}
        <Button
          variant="outlined"
          startIcon={<TuneOutlined />}
          disabled={isSaving}
          onClick={onOpenPlanning}
        >
          Відкрити ручне планування
        </Button>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button disabled={isSaving} onClick={onClose}>
        Скасувати
      </Button>
    </DialogActions>
  </Dialog>
);

export default TodayPlanDialog;
