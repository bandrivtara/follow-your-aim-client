import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddTaskOutlined from "@mui/icons-material/AddTaskOutlined";
import VoiceTextField from "components/Review/VoiceTextField";
import { LIFE_AREAS } from "config/lifeAreas";
import { ITasksGroup } from "types/taskGroups";

interface QuickTaskDraft {
  title: string;
  taskGroupId: string;
  time: Array<number | string>;
  category?: string;
}

interface QuickTaskDialogProps {
  open: boolean;
  taskGroups: ITasksGroup[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (draft: QuickTaskDraft) => Promise<void>;
}

const getDefaultTaskGroupId = (taskGroups: ITasksGroup[]) =>
  taskGroups.find(({ title }) => title.trim().toLocaleLowerCase("uk") === "список справ")
    ?.id || taskGroups[0]?.id || "";

const QuickTaskDialog = ({
  open,
  taskGroups,
  isSaving,
  onClose,
  onSave,
}: QuickTaskDialogProps) => {
  const defaultTaskGroupId = useMemo(
    () => getDefaultTaskGroupId(taskGroups),
    [taskGroups],
  );
  const [title, setTitle] = useState("");
  const [taskGroupId, setTaskGroupId] = useState(defaultTaskGroupId);
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setTaskGroupId(defaultTaskGroupId);
    setTime("");
    setCategory("");
  }, [defaultTaskGroupId, open]);

  const handleSave = async () => {
    if (!title.trim() || !taskGroupId) return;
    const parsedTime = time
      ? time.split(":").map((value) => Number(value))
      : ["", ""];
    await onSave({
      title: title.trim(),
      taskGroupId,
      time: parsedTime,
      ...(category ? { category } : {}),
    });
  };

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Швидка справа на сьогодні</DialogTitle>
      <DialogContent>
        {taskGroups.length ? (
          <Stack spacing={2} pt={0.5}>
            <Typography color="text.secondary">
              Запиши справу текстом або голосом. Вона одразу з’явиться у плані
              дня та трекері.
            </Typography>
            <VoiceTextField
              label="Що потрібно зробити?"
              placeholder="Наприклад, подзвонити лікарю"
              value={title}
              minRows={1}
              onChange={setTitle}
            />
            <TextField
              select
              fullWidth
              label="Список"
              value={taskGroupId}
              onChange={(event) => setTaskGroupId(event.target.value)}
            >
              {taskGroups.map((taskGroup) => (
                <MenuItem key={taskGroup.id} value={taskGroup.id}>
                  {taskGroup.title}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="time"
                label="Час"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Необов’язково"
              />
              <TextField
                select
                fullWidth
                label="Категорія"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                helperText="Необов’язково"
              >
                <MenuItem value="">Без категорії</MenuItem>
                {LIFE_AREAS.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.title}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Спочатку створи звичайну групу завдань без етапів — наприклад,
            «Список справ».
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={isSaving} onClick={onClose}>
          Скасувати
        </Button>
        <Button
          variant="contained"
          startIcon={
            isSaving ? <CircularProgress size={18} color="inherit" /> : <AddTaskOutlined />
          }
          disabled={isSaving || !title.trim() || !taskGroupId}
          onClick={handleSave}
        >
          Додати на сьогодні
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickTaskDialog;
