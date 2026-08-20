import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  Typography,
} from "@mui/material";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import { DatePicker, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/uk";
import {
  useGetDailyReviewMonthQuery,
  useUpdateDailyReviewMutation,
} from "store/services/dailyReviews";
import { IDailyReview } from "types/dailyReview.types";
import ReviewLayout from "../ReviewLayout.styled";
import { DAILY_REVIEW_QUESTIONS } from "../reviewQuestions";
import AiReflectionField from "../AiReflectionField";
import {
  DAILY_REVIEW_AI_PROMPT,
  buildLegacyDailyReviewSummary,
} from "../reflectionPrompts";
import { useSearchParams } from "react-router-dom";
import { isDailyReviewComplete } from "share/functions/dailyReviewCompletion";

const createEmptyAnswers = () =>
  Object.fromEntries(DAILY_REVIEW_QUESTIONS.map(({ id }) => [id, ""]));

const DailyReview = () => {
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
  const reviewMonth = useGetDailyReviewMonthQuery(monthId);
  const [updateDailyReview, updateState] = useUpdateDailyReviewMutation();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [answers, setAnswers] =
    useState<Record<string, string>>(createEmptyAnswers);
  const [summary, setSummary] = useState("");
  const isComplete = isDailyReviewComplete(answers, summary);

  const savedReview = useMemo(() => {
    const value = reviewMonth.data?.[dayId];
    return typeof value === "object" ? (value as IDailyReview) : undefined;
  }, [dayId, reviewMonth.data]);

  useEffect(() => {
    setMood(savedReview?.mood || 3);
    setEnergy(savedReview?.energy || 3);
    setAnswers({ ...createEmptyAnswers(), ...savedReview?.answers });
    setSummary(
      savedReview?.summary ||
        buildLegacyDailyReviewSummary(savedReview?.answers || {}),
    );
  }, [savedReview, selectedDate]);

  const saveReview = async () => {
    if (!isComplete) {
      message.warning("Встав фінальний AI-підсумок, щоб завершити огляд");
      return;
    }

    try {
      await updateDailyReview({
        monthId,
        day: dayId,
        data: {
          date: selectedDate.format("YYYY-MM-DD"),
          mood,
          energy,
          answers,
          summary: summary.trim(),
          updatedAt: dayjs().unix(),
        },
      }).unwrap();
      message.success("Щоденний огляд збережено");
    } catch {
      message.error("Не вдалося зберегти огляд. Спробуй ще раз.");
    }
  };

  return (
    <ReviewLayout>
      <header className="review-header">
        <Box>
          <Typography variant="h4" component="h1">
            Щоденний огляд
          </Typography>
          <Typography color="text.secondary">
            Коротке AI-інтерв’ю та один підсумок, щоб не загубити контекст дня
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
          {reviewMonth.isFetching ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h6" textTransform="capitalize" mb={2}>
                {selectedDate.locale("uk").format("dddd, D MMMM")}
              </Typography>
              <div className="review-score-grid">
                <Box>
                  <Typography fontWeight={600}>Настрій</Typography>
                  <Rating
                    aria-label="Настрій від одного до п’яти"
                    value={mood}
                    onChange={(_event, value) => setMood(value || 1)}
                  />
                </Box>
                <Box>
                  <Typography fontWeight={600}>Рівень енергії</Typography>
                  <Rating
                    aria-label="Енергія від одного до п’яти"
                    value={energy}
                    onChange={(_event, value) => setEnergy(value || 1)}
                  />
                </Box>
              </div>

              <AiReflectionField
                title="Проведи огляд із ChatGPT"
                description="Скопіюй промпт, відповідай на п’ять питань по черзі, а фінальний текст встав сюди."
                prompt={DAILY_REVIEW_AI_PROMPT}
                label="Фінальний підсумок дня"
                placeholder="Встав сюди фінальний текст ChatGPT: стан, перемоги, перешкоди, урок і фокус на завтра…"
                value={summary}
                onChange={setSummary}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="review-actions">
        <Typography color={isComplete ? "success.main" : "text.secondary"}>
          {isComplete
            ? "Підсумок готовий — звичка буде виконана автоматично."
            : "Встав фінальний AI-підсумок, щоб виконати звичку."}
        </Typography>
        <Button
          variant="contained"
          startIcon={
            updateState.isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveOutlined />
            )
          }
          disabled={updateState.isLoading || reviewMonth.isFetching}
          onClick={saveReview}
        >
          {savedReview ? "Оновити огляд" : "Зберегти огляд"}
        </Button>
      </div>
    </ReviewLayout>
  );
};

export default DailyReview;
