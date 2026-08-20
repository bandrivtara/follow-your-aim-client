import dayjs, { Dayjs } from "dayjs";
import { buildTrackerExport } from "components/Calendar/Tracker/trackerExport";
import {
  getDashboardActivitiesForDate,
  getDashboardWeekData,
} from "components/Main/dashboardCalculations";
import { IAimData } from "types/aims.types";
import { IDailyReviewMonth } from "types/dailyReview.types";
import { IHabitData } from "types/habits.types";
import { ITasksGroup } from "types/taskGroups";
import { DAILY_REVIEW_QUESTIONS } from "../reviewQuestions";
import { getDailyReviewForDate } from "./weeklyReviewExport";

export const WEEKLY_PLANNING_AI_PROMPT = `Проведи зі мною Weekly Planning Protocol v1 для наступного тижня. Не формуй фінальний план одразу.

Спочатку прочитай факти з цього файлу, потім постав мені по одному лише ті питання, відповіді на які ще відсутні. Максимум 10 питань. Обов'язково уточни Big 3, відомі обмеження, найскладніші дні, рішення щодо важливого незавершеного, що свідомо не робити та мінімально прийнятний Plan B.

Перед фінальним планом зроби якісний sanity check без штучних capacity-відсотків і без одного Week Score. Для кожної важливої поради чітко розділяй: Fact → Observation → Hypothesis → Recommendation. Не подавай кореляцію як доведену причинність.

Фінальна відповідь має містити: Big 3, відомі обмеження, план за днями, рішення щодо незавершеного, план звичок, список «свідомо не робимо», ризики, Plan B та короткий список змін для Follow Your Aim. JSON change set fya-plan-v1 створюй лише після мого окремого підтвердження фінального плану.`;

interface WeeklyPlanningExportOptions {
  lastWeekFrom: Dayjs;
  lastWeekTo: Dayjs;
  history: Record<string, any>[];
  habits: IHabitData[];
  taskGroups: ITasksGroup[];
  aims: IAimData[];
  reviewMonths: IDailyReviewMonth[];
}

const getWeekSummary = (
  history: Record<string, any>[],
  weekStart: Dayjs,
  habits: IHabitData[],
) => {
  const week = getDashboardWeekData(history, weekStart, habits);
  const daysWithPlan = week.filter((day) => day.planned > 0);
  return {
    planned: week.reduce((sum, day) => sum + day.planned, 0),
    completedPlanned: week.reduce(
      (sum, day) => sum + day.completedPlanned,
      0,
    ),
    completedOutsidePlan: week.reduce(
      (sum, day) => sum + day.completedOutsidePlan,
      0,
    ),
    averageProgress: daysWithPlan.length
      ? Math.round(
          daysWithPlan.reduce((sum, day) => sum + day.progress, 0) /
            daysWithPlan.length,
        )
      : 0,
  };
};

const formatFourWeekHabitStatistics = (
  contextFrom: Dayjs,
  contextTo: Dayjs,
  history: Record<string, any>[],
  habits: IHabitData[],
) => {
  const counters = new Map<
    string,
    { planned: number; completed: number; recorded: number; progress: number }
  >();

  for (
    let cursor = contextFrom.startOf("day");
    !cursor.isAfter(contextTo, "day");
    cursor = cursor.add(1, "day")
  ) {
    getDashboardActivitiesForDate(history, cursor, habits).forEach(
      (activity) => {
        const habit = habits.find((item) => item.id === activity.id);
        if (!habit || habit.isArchived) return;
        const current = counters.get(habit.id) || {
          planned: 0,
          completed: 0,
          recorded: 0,
          progress: 0,
        };
        current.recorded += 1;
        current.progress += activity.progress;
        if (activity.isPlanned) current.planned += 1;
        if (activity.progress >= 100) current.completed += 1;
        counters.set(habit.id, current);
      },
    );
  }

  const lines: string[] = [];
  habits
    .filter((habit) => !habit.isArchived && counters.has(habit.id))
    .sort((left, right) => left.title.localeCompare(right.title, "uk"))
    .forEach((habit) => {
      const values = counters.get(habit.id)!;
      lines.push(
        `- ${habit.title}: заплановано ${values.planned}; повністю виконано ${values.completed}; днів із записом ${values.recorded}; середній прогрес ${Math.round(values.progress / values.recorded)}%`,
      );
    });
  return lines.length ? lines : ["- Даних про звички за цей період немає."];
};

const formatUnfinishedWork = (
  lastWeekFrom: Dayjs,
  lastWeekTo: Dayjs,
  history: Record<string, any>[],
  habits: IHabitData[],
  taskGroups: ITasksGroup[],
) => {
  const groupById = new Map(taskGroups.map((group) => [group.id, group]));
  const unfinished = new Map<string, Set<string>>();
  for (
    let cursor = lastWeekFrom.startOf("day");
    !cursor.isAfter(lastWeekTo, "day");
    cursor = cursor.add(1, "day")
  ) {
    getDashboardActivitiesForDate(history, cursor, habits).forEach(
      (activity) => {
        const tasks = Array.isArray(activity.source.tasks)
          ? activity.source.tasks
          : [];
        tasks
          .filter((task: Record<string, any>) => task.status !== "done")
          .forEach((task: Record<string, any>) => {
            const title = task.title?.trim();
            if (!title) return;
            const current = unfinished.get(activity.id) || new Set<string>();
            current.add(title);
            unfinished.set(activity.id, current);
          });
      },
    );
  }

  const lines: string[] = [];
  unfinished.forEach((tasks, groupId) => {
    lines.push(
      `- ${groupById.get(groupId)?.title || `Невідома група (${groupId})`}: ${Array.from(tasks).join("; ")}`,
    );
  });
  taskGroups.forEach((group) => {
    group.tasksStages
      ?.filter((stage) => stage.subTasks?.some((task) => task.status !== "done"))
      .forEach((stage) => {
        const pending = stage.subTasks
          .filter((task) => task.status !== "done")
          .map((task) => task.title)
          .filter(Boolean);
        lines.push(
          `- Етап «${stage.title}» у «${group.title}»: ${pending.join("; ") || "є незавершені підзавдання"}`,
        );
      });
  });
  return lines.length ? lines : ["- Важливого незавершеного не знайдено."];
};

const formatActivityNotes = (
  contextFrom: Dayjs,
  contextTo: Dayjs,
  history: Record<string, any>[],
  habits: IHabitData[],
) => {
  const habitById = new Map(habits.map((habit) => [habit.id, habit]));
  const lines: string[] = [];

  for (
    let cursor = contextFrom.startOf("day");
    !cursor.isAfter(contextTo, "day");
    cursor = cursor.add(1, "day")
  ) {
    getDashboardActivitiesForDate(history, cursor, habits).forEach(
      (activity) => {
        const note = activity.source.note;
        if (typeof note !== "string" || !note.trim()) return;
        const title = habitById.get(activity.id)?.title || activity.id;
        lines.push(
          `## ${cursor.locale("uk").format("DD MMMM YYYY")} · ${title}`,
          note.trim(),
          "",
        );
      },
    );
  }

  return lines.length ? lines : ["- Текстових записів звичок немає."];
};

export const buildWeeklyPlanningExport = ({
  lastWeekFrom,
  lastWeekTo,
  history,
  habits,
  taskGroups,
  aims,
  reviewMonths,
}: WeeklyPlanningExportOptions) => {
  const contextFrom = lastWeekFrom.subtract(3, "week").startOf("day");
  const contextTo = lastWeekTo.endOf("day");
  const nextWeekFrom = lastWeekFrom.add(1, "week").startOf("day");
  const nextWeekTo = lastWeekTo.add(1, "week").endOf("day");
  const activeAims = aims.filter(
    (aim) =>
      !aim.isArchived &&
      !dayjs(aim.dateTo).isBefore(nextWeekFrom, "day") &&
      !dayjs(aim.dateFrom).isAfter(nextWeekTo, "day"),
  );
  const lines = [
    "# Контекст для Weekly Planning · Follow Your Aim",
    "",
    `Наступний тиждень: ${nextWeekFrom.format("DD.MM.YYYY")} — ${nextWeekTo.format("DD.MM.YYYY")}`,
    `Контекст: ${contextFrom.format("DD.MM.YYYY")} — ${contextTo.format("DD.MM.YYYY")}`,
    "",
    "# Фактичні показники останніх чотирьох тижнів",
  ];

  for (let index = 0; index < 4; index += 1) {
    const weekStart = contextFrom.add(index, "week");
    const summary = getWeekSummary(history, weekStart, habits);
    lines.push(
      `- ${weekStart.format("DD.MM")}–${weekStart.add(6, "day").format("DD.MM")}: виконання плану ${summary.averageProgress}%; заплановано ${summary.planned}; повністю виконано запланованих ${summary.completedPlanned}; виконано поза планом ${summary.completedOutsidePlan}`,
    );
  }

  lines.push(
    "",
    "# Статистика звичок за чотири тижні",
    "",
    ...formatFourWeekHabitStatistics(
      contextFrom,
      contextTo,
      history,
      habits,
    ),
    "",
    "# Активні цілі наступного тижня",
    "",
    ...(activeAims.length
      ? activeAims.map(
          (aim) =>
            `- ${aim.title}: ${Math.round(aim.progress || 0)}%; період ${dayjs(aim.dateFrom).format("DD.MM.YYYY")}–${dayjs(aim.dateTo).format("DD.MM.YYYY")}`,
        )
      : ["- Активних цілей на наступний тиждень немає."]),
    "",
    "# Незавершені справи та етапи",
    "",
    ...formatUnfinishedWork(
      lastWeekFrom,
      lastWeekTo,
      history,
      habits,
      taskGroups,
    ),
    "",
    "# Daily review · чотири тижні",
  );

  for (
    let cursor = contextFrom;
    !cursor.isAfter(contextTo, "day");
    cursor = cursor.add(1, "day")
  ) {
    const review = getDailyReviewForDate(reviewMonths, cursor);
    if (!review) continue;
    lines.push(
      "",
      `## ${cursor.locale("uk").format("dddd, DD MMMM YYYY")}`,
      `Настрій: ${review.mood}/5 · енергія: ${review.energy}/5`,
    );
    if (review.summary?.trim()) {
      lines.push(review.summary.trim());
    } else {
      DAILY_REVIEW_QUESTIONS.forEach((question) => {
        const answer = review.answers?.[question.id]?.trim();
        if (answer) lines.push(`- ${question.title} ${answer}`);
      });
    }
  }

  lines.push(
    "",
    "# Текстові записи звичок · чотири тижні",
    "",
    ...formatActivityNotes(contextFrom, contextTo, history, habits),
  );

  lines.push(
    "",
    "# Уже заплановано на наступний тиждень",
    "",
    buildTrackerExport({
      dateFrom: nextWeekFrom,
      dateTo: nextWeekTo,
      history,
      habits,
      taskGroups,
      includePrompt: false,
    }).replace("# Витяг із трекера Follow Your Aim", "## План трекера"),
    "",
    "# Weekly Planning Protocol v1",
    "",
    WEEKLY_PLANNING_AI_PROMPT,
    "",
  );
  return lines.join("\n");
};
