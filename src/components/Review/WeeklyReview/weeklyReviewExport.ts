import dayjs, { Dayjs } from "dayjs";
import { buildTrackerExport } from "components/Calendar/Tracker/trackerExport";
import { DAILY_REVIEW_QUESTIONS } from "../reviewQuestions";
import { IDailyReview, IDailyReviewMonth } from "types/dailyReview.types";
import { IHabitData } from "types/habits.types";
import { ITasksGroup } from "types/taskGroups";

export const getDailyReviewForDate = (
  reviewMonths: IDailyReviewMonth[] = [],
  date: Dayjs,
) => {
  const month = reviewMonths.find(
    (item) =>
      item.id === date.format("YYYY-MM") ||
      (typeof item.unix === "number" &&
        dayjs.unix(item.unix).format("YYYY-MM") === date.format("YYYY-MM")),
  );
  const review = month?.[date.format("DD")];
  return typeof review === "object" ? (review as IDailyReview) : undefined;
};

export const WEEKLY_REVIEW_AI_PROMPT = `Проаналізуй цей тижневий звіт Follow Your Aim як практичний консультант із самоменеджменту. Використовуй лише факти зі звіту; не став діагнозів, не моралізуй і не вигадуй мотивів.

1. Порівняй план і факт по днях, звичках, вимірюваннях та справах усередині списків.
2. Зістав об'єктивні дані трекера та явно записані причини невиконання із настроєм, енергією, перемогами й перешкодами зі щоденних оглядів. Не вигадуй причину, якщо її не вказано.
3. Знайди максимум три повторювані закономірності: що підтримує прогрес, а що створює зриви або перевантаження.
4. Відділи корисну роботу поза планом від хаотичного планування.
5. Запропонуй реалістичний план наступного тижня: три пріоритети, що зменшити або прибрати, одну звичку для захисту енергії та один експеримент.
6. Заверши трьома короткими питаннями для моєї рефлексії.

Формат відповіді: «Підсумок тижня», «Факти й закономірності», «Що працює», «Що заважає», «План наступного тижня», «Питання для рефлексії». Якщо даних недостатньо або вони суперечливі, прямо вкажи це.`;

interface WeeklyReviewExportOptions {
  dateFrom: Dayjs;
  dateTo: Dayjs;
  history: Record<string, any>[];
  habits: IHabitData[];
  taskGroups: ITasksGroup[];
  reviewMonths: IDailyReviewMonth[];
}

export const buildWeeklyReviewExport = ({
  dateFrom,
  dateTo,
  history,
  habits,
  taskGroups,
  reviewMonths,
}: WeeklyReviewExportOptions) => {
  const trackerSection = buildTrackerExport({
    dateFrom,
    dateTo,
    history,
    habits,
    taskGroups,
    includePrompt: false,
  });
  const lines = [
    "# Тижневий звіт Follow Your Aim",
    "",
    "Цей файл поєднує об'єктивні записи трекера та суб'єктивні щоденні огляди.",
    "",
    trackerSection.replace(
      "# Витяг із трекера Follow Your Aim",
      "# Дані трекера",
    ),
    "",
    "# Щоденні огляди",
  ];

  for (
    let cursor = dateFrom.startOf("day");
    !cursor.isAfter(dateTo, "day");
    cursor = cursor.add(1, "day")
  ) {
    const review = getDailyReviewForDate(reviewMonths, cursor);
    lines.push("", `## ${cursor.locale("uk").format("dddd, DD MMMM YYYY")}`);
    if (!review) {
      lines.push("", "Огляд не заповнений.");
      continue;
    }

    lines.push("", `Настрій: ${review.mood}/5 · енергія: ${review.energy}/5`);
    if (review.summary?.trim()) {
      lines.push("", "**AI-підсумок дня**", review.summary.trim());
    } else {
      DAILY_REVIEW_QUESTIONS.forEach((question) => {
        lines.push(
          "",
          `**${question.title}**`,
          review.answers?.[question.id]?.trim() || "—",
        );
      });
    }
  }

  lines.push(
    "",
    "# Інструкція для Codex / AI",
    "",
    WEEKLY_REVIEW_AI_PROMPT,
    "",
  );
  return lines.join("\n");
};
