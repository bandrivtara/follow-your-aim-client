import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { ContentCopyOutlined, TuneOutlined } from "@mui/icons-material";

interface TodayPlanDialogProps {
  open: boolean;
  canCopyYesterday: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCopyYesterday: () => void;
  onOpenPlanning: () => void;
}

const TodayPlanDialog = ({
  open,
  canCopyYesterday,
  isSaving,
  onClose,
  onCopyYesterday,
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
