import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { APPLE_HEALTH_SHORTCUT_NAME } from "./appleHealthSync";

interface AppleHealthSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

const AppleHealthSetupDialog = ({
  open,
  onClose,
}: AppleHealthSetupDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Налаштування Apple Health Shortcut</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" mb={2}>
        Це одноразове налаштування на iPhone. Follow Your Aim передаватиме
        Shortcut захищений callback для поточної синхронізації.
      </Typography>
      <Box
        component="ol"
        sx={{ display: "grid", gap: 1.5, margin: 0, paddingLeft: 3 }}
      >
        <li>
          Створи Shortcut із точною назвою{" "}
          <strong>{APPLE_HEALTH_SHORTCUT_NAME}</strong>.
        </li>
        <li>
          Додай <strong>Find Health Samples</strong>: тип <strong>Steps</strong>,
          дата початку — сьогодні. Далі <strong>Calculate Statistics → Sum</strong>
          і <strong>Round Number</strong> до цілого. Назви результат{" "}
          <strong>Steps</strong>.
        </li>
        <li>
          Повтори для <strong>Active Energy</strong>. Підсумуй і округли до
          цілого, результат назви <strong>Calories</strong>.
        </li>
        <li>
          Додай <strong>Current Date → Format Date</strong> у форматі{" "}
          <code>yyyy-MM-dd</code>.
        </li>
        <li>
          Створи дію <strong>Text</strong>:
          <Box
            component="code"
            sx={{
              display: "block",
              marginTop: 1,
              padding: 1.25,
              overflowWrap: "anywhere",
              borderRadius: 2,
              backgroundColor: "#f3f5f9",
              color: "#28324a",
            }}
          >
            [Shortcut Input]&amp;date=[Formatted
            Date]&amp;steps=[Steps]&amp;activeCalories=[Calories]
          </Box>
          Квадратні блоки тут означають відповідні magic variables у Shortcuts.
        </li>
        <li>
          Остання дія — <strong>Open URLs</strong> із текстом попереднього кроку.
          Під час першого запуску дозволь Shortcut читати Steps та Active Energy.
        </li>
      </Box>
      <Typography variant="body2" color="text.secondary" mt={2}>
        Callback приймається лише протягом 15 хвилин після натискання кнопки й
        лише за сьогоднішню дату.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Готово</Button>
    </DialogActions>
  </Dialog>
);

export default AppleHealthSetupDialog;
