import { useEffect, useMemo, useState } from "react";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DatePicker, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/uk";
import { useSearchParams } from "react-router-dom";
import habitsConfig from "config/habitsIds.json";
import { useGetHabitQuery, useUpdateHabitMutation } from "store/services/habits";
import {
  useGetHistoryQuery,
  useUpdateHistoryMutation,
} from "store/services/history";
import { IActivityHistoryData } from "types/history.types";
import AiReflectionField from "../AiReflectionField";
import ReviewLayout from "../ReviewLayout.styled";
import { GOALS_GRATITUDE_AI_PROMPT } from "../reflectionPrompts";
import {
  GOALS_GRATITUDE_DESCRIPTION,
  GOALS_GRATITUDE_TITLE,
  buildGoalsGratitudeCompletion,
} from "./goalsGratitudeCompletion";

const GoalsGratitude = () => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => {
    const requestedDate = searchParams.get("date");
    const parsedDate = requestedDate ? dayjs(requestedDate) : dayjs();
    return parsedDate.isValid() && !parsedDate.isAfter(dayjs(), "day")
      ? parsedDate
      : dayjs();
  });
  const monthId = selectedDate.format("YYYY-MM");
  const dayId = selectedDate.format("DD");
  const habitId = habitsConfig.habits.goalsGratitude.details;
  const habit = useGetHabitQuery(habitId);
  const history = useGetHistoryQuery(monthId);
  const [updateHistory, historyUpdate] = useUpdateHistoryMutation();
  const [updateHabit, habitUpdate] = useUpdateHabitMutation();
  const [reflection, setReflection] = useState("");

  const savedActivity = useMemo(() => {
    const value = history.data?.[dayId]?.[habitId];
    return value && typeof value === "object"
      ? (value as IActivityHistoryData)
      : undefined;
  }, [dayId, habitId, history.data]);

  useEffect(() => {
    setReflection(savedActivity?.note || "");
  }, [savedActivity, selectedDate]);

  const saveReflection = async () => {
    if (!reflection.trim()) {
      message.warning("Встав фінальний текст із 5 цілями та 5 подяками");
      return;
    }
    if (!habit.data) {
      message.error("Не вдалося завантажити звичку");
      return;
    }

    try {
      if (
        habit.data.title !== GOALS_GRATITUDE_TITLE ||
        habit.data.description !== GOALS_GRATITUDE_DESCRIPTION
      ) {
        await updateHabit({
          id: habitId,
          data: {
            title: GOALS_GRATITUDE_TITLE,
            description: GOALS_GRATITUDE_DESCRIPTION,
          },
        }).unwrap();
      }

      await updateHistory({
        id: monthId,
        path: `${dayId}.${habitId}`,
        data: buildGoalsGratitudeCompletion(
          habit.data,
          reflection,
          savedActivity,
        ),
      }).unwrap();
      message.success("5 цілей і 5 подяк збережено");
    } catch {
      message.error("Не вдалося зберегти запис. Спробуй ще раз.");
    }
  };

  const isSaving = historyUpdate.isLoading || habitUpdate.isLoading;
  const isLoading = history.isFetching || habit.isFetching;

  return (
    <ReviewLayout>
      <header className="review-header">
        <Box>
          <Typography variant="h4" component="h1">
            5 цілей і 5 подяк
          </Typography>
          <Typography color="text.secondary">
            Ранкова практика наміру та вдячності без зайвої форми
          </Typography>
        </Box>
        <DatePicker
          allowClear={false}
          value={selectedDate}
          format="DD.MM.YYYY"
          onChange={(value) => value && setSelectedDate(value)}
          disabledDate={(date) => date.isAfter(dayjs(), "day")}
        />
      </header>

      <Card className="review-card">
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h6" textTransform="capitalize" mb={2}>
                {selectedDate.locale("uk").format("dddd, D MMMM")}
              </Typography>
              <AiReflectionField
                title="Проведи практику з ChatGPT"
                description="Скопіюй промпт, проговори п’ять цілей і п’ять подяк, а фінальний список встав сюди."
                prompt={GOALS_GRATITUDE_AI_PROMPT}
                label="5 цілей і 5 подяк"
                placeholder="Встав фінальний текст ChatGPT із двома списками…"
                value={reflection}
                onChange={setReflection}
                minRows={12}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="review-actions">
        <Typography
          color={reflection.trim() ? "success.main" : "text.secondary"}
        >
          {reflection.trim()
            ? "Текст готовий — звичка буде виконана після збереження."
            : "Встав два списки, щоб виконати звичку."}
        </Typography>
        <Button
          variant="contained"
          startIcon={
            isSaving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveOutlined />
            )
          }
          disabled={isSaving || isLoading}
          onClick={saveReflection}
        >
          {savedActivity?.note ? "Оновити запис" : "Зберегти й виконати"}
        </Button>
      </div>
    </ReviewLayout>
  );
};

export default GoalsGratitude;
