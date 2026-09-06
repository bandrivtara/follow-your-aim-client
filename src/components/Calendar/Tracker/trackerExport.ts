import dayjs, { Dayjs } from "dayjs";
import { IHabitData } from "types/habits.types";
import { ITasksGroup } from "types/taskGroups";
import { IDailyReview, IDailyReviewMonth } from "types/dailyReview.types";
import { DAILY_REVIEW_QUESTIONS } from "components/Review/reviewQuestions";
import {
  getDashboardActivitiesForDate,
  getDashboardPlanPerformance,
} from "components/Main/dashboardCalculations";

interface TrackerExportOptions {
  dateFrom: Dayjs;
  dateTo: Dayjs;
  history: Record<string, any>[];
  habits: IHabitData[];
  taskGroups: ITasksGroup[];
  dailyReviews?: IDailyReviewMonth[];
  includePrompt?: boolean;
}

const statusLabels: Record<string, string> = {
  done: "виконано",
  pending: "очікує",
  failed: "не виконано",
};

const formatTime = (value: unknown) => {
  if (!Array.isArray(value) || value.length < 2) return "";
  return `${String(value[0]).padStart(2, "0")}:${String(value[1]).padStart(2, "0")}`;
};

const formatMeasures = (source: Record<string, any>, habit?: IHabitData) => {
  if (!source.measures || typeof source.measures !== "object") return [];

  return Object.entries(source.measures).map(([measureId, rawMeasure]) => {
    const measure = rawMeasure as {
      value?: number | string;
      plannedValue?: number | string;
    };
    const field = habit?.fields?.find(({ id }) => id === measureId);
    const name = field?.name || measureId;
    const unit = field?.unit ? ` ${field.unit}` : "";
    const actual =
      measure.value === undefined || measure.value === ""
        ? "—"
        : `${measure.value}${unit}`;
    const planned =
      Number(measure.plannedValue) > 0 ? `${measure.plannedValue}${unit}` : "—";
    return `  - ${name}: факт ${actual}; план ${planned}`;
  });
};

const formatTasks = (source: Record<string, any>) => {
  if (!Array.isArray(source.tasks)) return [];

  return source.tasks.map((task: Record<string, any>) => {
    const details = [
      statusLabels[task.status] || task.status || "без статусу",
      formatTime(task.time),
      task.description,
      task.failureReason
        ? `причина невиконання: ${task.failureReason}`
        : undefined,
    ].filter(Boolean);
    return `  - [${task.status === "done" ? "x" : " "}] ${task.title || "Без назви"} — ${details.join("; ")}`;
  });
};

const getDailyReviewForDate = (
  dailyReviews: IDailyReviewMonth[],
  date: Dayjs,
) => {
  const monthId = date.format("YYYY-MM");
  const month = dailyReviews.find(
    (entry) =>
      entry.id === monthId ||
      (typeof entry.unix === "number" &&
        dayjs.unix(entry.unix).format("YYYY-MM") === monthId),
  );
  if (!month) return undefined;

  const value = month[date.format("DD")] || month[date.format("D")];
  return value && typeof value === "object"
    ? (value as IDailyReview)
    : undefined;
};

const formatDailyReview = (review?: IDailyReview) => {
  if (!review) {
    return [
      "",
      "### Самопочуття та щоденний огляд",
      "",
      "Щоденного огляду немає.",
    ];
  }

  const lines = [
    "",
    "### Самопочуття та щоденний огляд",
    "",
    `Настрій: ${review.mood || "—"}/5 · енергія: ${review.energy || "—"}/5`,
  ];
  const summary = review.summary?.trim();
  if (summary) return [...lines, "", summary];

  const answers = review.answers || {};
  const legacyAnswers = DAILY_REVIEW_QUESTIONS.flatMap((question) => {
    const answer = answers[question.id]?.trim();
    return answer ? [`- ${question.title} ${answer}`] : [];
  });
  return legacyAnswers.length
    ? [...lines, "", ...legacyAnswers]
    : [...lines, "", "Текст огляду не заповнено."];
};

export const TRACKER_AI_ANALYSIS_PROMPT = `Проаналізуй мій витяг із трекера як уважний консультант із особистої продуктивності. Не оцінюй мене морально й не вигадуй причин, яких немає в даних.

1. Коротко підсумуй, що було заплановано і що фактично виконано.
2. Визнач повторювані сильні сторони, зриви, перевантажені дні та активності, які систематично відкладаються.
3. Окремо врахуй виконане поза планом: відрізни корисну гнучкість від ознак хаотичного планування.
4. Проаналізуй справи всередині списків, числові вимірювання та час виконання, а не лише загальний відсоток.
5. Врахуй явно записані причини невиконання, щоденні огляди, настрій та енергію. Шукай повторювані зв'язки із виконанням плану, але не називай кореляцію причиною. Відрізняй зазначений користувачем факт від власної гіпотези. Якщо причин або оглядів мало, прямо познач це обмеження.
6. Запропонуй до п'яти конкретних змін для наступного тижня: що залишити, прибрати, перенести, спростити або вимірювати інакше.

Формат відповіді: «Підсумок», «Самопочуття і навантаження», «Що працює», «Що заважає», «План наступного тижня», «Питання для рефлексії». Для кожного важливого висновку розділяй: Факт → Спостереження → Гіпотеза → Рекомендація. Якщо даних недостатньо, прямо скажи про це.`;

export const buildTrackerExport = ({
  dateFrom,
  dateTo,
  history,
  habits,
  taskGroups,
  dailyReviews = [],
  includePrompt = true,
}: TrackerExportOptions) => {
  const startDate = dateFrom.startOf("day");
  const endDate = dateTo.endOf("day");
  const definitions = new Map(
    [...habits, ...taskGroups].map((activity) => [activity.id, activity]),
  );
  const days: Array<{
    date: Dayjs;
    activities: ReturnType<typeof getDashboardActivitiesForDate>;
    performance: ReturnType<typeof getDashboardPlanPerformance>;
  }> = [];

  for (
    let cursor = startDate;
    !cursor.isAfter(endDate, "day");
    cursor = cursor.add(1, "day")
  ) {
    const activities = getDashboardActivitiesForDate(history, cursor, habits);
    days.push({
      date: cursor,
      activities,
      performance: getDashboardPlanPerformance(activities),
    });
  }

  const daysWithPlan = days.filter(
    ({ performance }) => performance.planned > 0,
  );
  const averagePlanProgress = daysWithPlan.length
    ? Math.round(
        daysWithPlan.reduce((sum, day) => sum + day.performance.progress, 0) /
          daysWithPlan.length,
      )
    : 0;
  const totals = days.reduce(
    (result, day) => ({
      planned: result.planned + day.performance.planned,
      completedPlanned:
        result.completedPlanned + day.performance.completedPlanned,
      completedOutsidePlan:
        result.completedOutsidePlan + day.performance.completedOutsidePlan,
    }),
    { planned: 0, completedPlanned: 0, completedOutsidePlan: 0 },
  );

  const lines = [
    "# Витяг із трекера Follow Your Aim",
    "",
    `Період: ${startDate.format("DD.MM.YYYY")} — ${endDate.format("DD.MM.YYYY")}`,
    `Середнє виконання денного плану: ${averagePlanProgress}%`,
    `Заплановано активностей: ${totals.planned}`,
    `Повністю виконано запланованих: ${totals.completedPlanned}`,
    `Повністю виконано поза планом: ${totals.completedOutsidePlan}`,
    "",
    "Принцип метрики: усі заплановані активності дня разом дорівнюють 100%; виконані поза планом можуть підняти результат вище 100%.",
  ];

  days.forEach(({ date, activities, performance }) => {
    lines.push(
      "",
      `## ${date.locale("uk").format("dddd, DD MMMM YYYY")}`,
      "",
      `Виконання плану: ${performance.progress}% · заплановано ${performance.planned} · завершено запланованих ${performance.completedPlanned} · завершено поза планом ${performance.completedOutsidePlan}`,
      ...formatDailyReview(getDailyReviewForDate(dailyReviews, date)),
    );

    if (!activities.length) {
      lines.push("", "Записів у трекері немає.");
      return;
    }

    activities.forEach((activity) => {
      const definition = definitions.get(activity.id);
      const title = definition?.title || `Невідома активність (${activity.id})`;
      const type =
        definition?.type === "tasksGroup" ? "список справ" : "звичка";
      const source = activity.source as Record<string, any>;
      const time = [formatTime(source.startTime), formatTime(source.endTime)]
        .filter(Boolean)
        .join("–");
      lines.push(
        "",
        `- ${title} (${type}) — ${activity.isPlanned ? "у плані" : "поза планом"}; прогрес ${Math.round(activity.progress)}%; статус ${statusLabels[source.status] || source.status || "не вказано"}${time ? `; час ${time}` : ""}`,
        ...(source.status === "failed"
          ? [
              `  Причина невиконання: ${source.failureReason?.trim() || "не вказана"}`,
            ]
          : []),
        ...(typeof source.note === "string" && source.note.trim()
          ? [
              "",
              "  Запис:",
              ...source.note
                .trim()
                .split("\n")
                .map((line) => `  ${line}`),
            ]
          : []),
        ...formatMeasures(
          source,
          definition?.type === "habit" ? definition : undefined,
        ),
        ...formatTasks(source),
      );
    });
  });

  if (includePrompt) {
    lines.push(
      "",
      "# Промпт для AI-аналізу",
      "",
      TRACKER_AI_ANALYSIS_PROMPT,
      "",
    );
  }
  return lines.join("\n");
};

export const downloadTrackerExport = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
