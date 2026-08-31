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
import { MORNING_COMPASS_AI_PROMPT } from "../reflectionPrompts";
import {
  MORNING_COMPASS_DESCRIPTION,
  MORNING_COMPASS_TITLE,
  buildMorningCompassCompletion,
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
      message.warning("Встав фінальний текст ранкового компаса");
      return;
    }
    if (!habit.data) {
      message.error("Не вдалося завантажити звичку");
      return;
    }

    try {
      if (
        habit.data.title !== MORNING_COMPASS_TITLE ||
        habit.data.description !== MORNING_COMPASS_DESCRIPTION
      ) {
        await updateHabit({
          id: habitId,
          data: {
            title: MORNING_COMPASS_TITLE,
            description: MORNING_COMPASS_DESCRIPTION,
          },
        }).unwrap();
      }

      await updateHistory({
        id: monthId,
        path: `${dayId}.${habitId}`,
        data: buildMorningCompassCompletion(
          habit.data,
          reflection,
          savedActivity,
        ),
      }).unwrap();
      message.success("Ранковий компас збережено");
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
            Ранковий компас
          </Typography>
          <Typography color="text.secondary">
            Один фокус, перший крок і реалістичний план на сьогодні
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
                description="Скопіюй промпт: ChatGPT покаже всі питання одразу. Відповідай одним текстом або голосом і встав сюди блок «Текст для Follow Your Aim»."
                prompt={MORNING_COMPASS_AI_PROMPT}
                label="Ранковий компас"
                placeholder="Встав блок «Текст для Follow Your Aim» зі станом, фокусом, перешкодою і першим кроком…"
                value={reflection}
                onChange={setReflection}
                minRows={8}
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
            : "Встав ранковий орієнтир, щоб виконати звичку."}
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
