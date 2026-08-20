import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AssessmentOutlined,
  AddTaskOutlined,
  CheckCircleOutline,
  CloudDownloadOutlined,
  DoneRounded,
  EditNoteOutlined,
  LightbulbOutlined,
  ReplayOutlined,
} from "@mui/icons-material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import { message } from "antd";
import routes from "config/routes";
import habitsConfig from "config/habitsIds.json";
import { getLifeArea } from "config/lifeAreas";
import { calculateAimProgressSnapshot } from "components/Aims/AimsCalendar/aimRoadmapCalculations";
import { useGetAimsListQuery } from "store/services/aims";
import { useGetHabitListQuery } from "store/services/habits";
import {
  useGetHistoryBetweenDatesQuery,
  useUpdateHistoryMutation,
} from "store/services/history";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import {
  useGetDailyReviewMonthQuery,
  useGetDailyReviewsBetweenDatesQuery,
} from "store/services/dailyReviews";
import useIsMobile from "share/hooks/useIsMobile";
import uniqid from "uniqid";
import { isDailyReviewComplete } from "share/functions/dailyReviewCompletion";
import {
  buildFirebaseBackup,
  downloadFirebaseBackup,
} from "share/backup/firebaseBackup";
import DailyCounters from "./DailyCounters/DailyCounters";
import StyledMain from "./Main.styled";
import TodayPlanDialog from "./TodayPlanDialog";
import QuickMeasureDialog from "./QuickMeasureDialog";
import QuickTaskDialog from "./QuickTaskDialog";
import {
  appendQuickTask,
  completeBooleanHabit,
  completeMeasuredHabit,
  completeTaskAtIndex,
  resetActivityForPlanning,
} from "./dashboardActions";
import {
  DashboardAgendaItem,
  getActivityStreak,
  getDashboardAgendaItems,
  getDashboardActivitiesForDate,
  getDashboardLifeBalance,
  getDashboardPlanPerformance,
  getDashboardReviewWeekData,
  getRecoveryHabits,
  getDashboardWeekData,
  getPendingDashboardAgendaItems,
} from "./dashboardCalculations";

const formatTime = (time?: Array<number | string>) =>
  Array.isArray(time) && time.length >= 2
    ? `${String(time[0]).padStart(2, "0")}:${String(time[1]).padStart(2, "0")}`
    : "—";

const getTimeInMinutes = (time?: Array<number | string>) =>
  Array.isArray(time) && time.length >= 2
    ? Number(time[0]) * 60 + Number(time[1])
    : null;

const formatAgendaTime = (
  startTime?: Array<number | string>,
  endTime?: Array<number | string>,
  isAllDay = false,
) => {
  if (isAllDay || !startTime) return "Весь день";
  return endTime
    ? `${formatTime(startTime)}–${formatTime(endTime)}`
    : formatTime(startTime);
};

const Main = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const now = useMemo(() => dayjs(), []);
  const yesterday = useMemo(() => now.subtract(1, "day"), [now]);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [quickMeasureItem, setQuickMeasureItem] =
    useState<DashboardAgendaItem>();
  const [quickSavingId, setQuickSavingId] = useState<string>();
  const [isCopyingPlan, setIsCopyingPlan] = useState(false);
  const [isSavingQuickTask, setIsSavingQuickTask] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const habits = useGetHabitListQuery();
  const taskGroups = useGetTaskGroupListQuery();
  const aims = useGetAimsListQuery();
  const historyRange = useMemo(
    () => {
      const analyticsStart = now.subtract(90, "day").startOf("month");
      const earliestActiveAimStart = (aims.data || [])
        .filter(
          (aim) =>
            !aim.isArchived &&
            !now.isBefore(dayjs(aim.dateFrom), "day") &&
            !now.isAfter(dayjs(aim.dateTo), "day"),
        )
        .map((aim) => dayjs(aim.dateFrom).startOf("month"))
        .filter((date) => date.isValid())
        .reduce(
          (earliest, date) => (date.isBefore(earliest) ? date : earliest),
          analyticsStart,
        );

      return [
        earliestActiveAimStart.unix(),
        now.startOf("month").unix(),
      ];
    },
    [aims.data, now],
  );
  const history = useGetHistoryBetweenDatesQuery(historyRange);
  const reviewWeekRange = useMemo(() => {
    const weekStart = now
      .startOf("day")
      .subtract((now.day() + 6) % 7, "day");
    return [
      weekStart.startOf("month").unix(),
      weekStart.add(6, "day").startOf("month").unix(),
    ] as [number, number];
  }, [now]);
  const weeklyReviews = useGetDailyReviewsBetweenDatesQuery(reviewWeekRange);
  const currentReview = useGetDailyReviewMonthQuery(now.format("YYYY-MM"));
  const previousMonthReview = useGetDailyReviewMonthQuery(
    yesterday.format("YYYY-MM"),
    { skip: yesterday.isSame(now, "month") },
  );
  const [updateHistory] = useUpdateHistoryMutation();

  const dashboardData = useMemo(() => {
    const historyData = (history.data || []) as Record<string, any>[];
    const habitData = habits.data || [];
    const todayActivities = getDashboardActivitiesForDate(
      historyData,
      now,
      habitData,
    );
    const yesterdayActivities = getDashboardActivitiesForDate(
      historyData,
      yesterday,
      habitData,
    );
    const previousWeekActivities = getDashboardActivitiesForDate(
      historyData,
      now.subtract(1, "week"),
      habitData,
    );
    const week = getDashboardWeekData(historyData, now, habitData);
    const lifeBalance = getDashboardLifeBalance(historyData, now, habitData);
    const todayPerformance = getDashboardPlanPerformance(todayActivities);
    const activeAims = (aims.data || []).filter(
      (aim) =>
        !aim.isArchived &&
        !now.isBefore(dayjs(aim.dateFrom), "day") &&
        !now.isAfter(dayjs(aim.dateTo), "day"),
    );
    const historyMonths = historyData.flatMap((month) => {
      const monthId =
        typeof month.id === "string" && /^\d{4}-\d{2}$/.test(month.id)
          ? month.id
          : typeof month.unix === "number"
            ? dayjs.unix(month.unix).format("YYYY-MM")
            : "";

      return monthId ? [{ id: monthId, data: month }] : [];
    });
    const aimProgressById = new Map(
      activeAims.map((aim) => [
        aim.id,
        calculateAimProgressSnapshot(
          aim,
          taskGroups.data || [],
          historyMonths,
          now,
        ),
      ]),
    );
    const agendaItems = getDashboardAgendaItems(
      todayActivities,
      habitData,
      taskGroups.data || [],
    );

    return {
      todayActivities,
      yesterdayActivities,
      previousWeekActivities,
      week,
      lifeBalance,
      todayPerformance,
      activeAims,
      aimProgressById,
      agendaItems,
      recoveryHabits: getRecoveryHabits(
        yesterdayActivities,
        todayActivities,
        habitData,
      ),
      streak: getActivityStreak(historyData, now, 90, habitData),
    };
  }, [aims.data, habits.data, history.data, now, taskGroups.data, yesterday]);

  const currentMinutes = now.hour() * 60 + now.minute();
  const currentAgendaItem = dashboardData.agendaItems.find((item) => {
    if (item.progress >= 100 || item.isAllDay) return false;
    const start = getTimeInMinutes(item.startTime);
    if (start === null || start > currentMinutes) return false;
    const end = getTimeInMinutes(item.endTime) ?? start + 30;
    return currentMinutes < end;
  });
  const nextAgendaItem = dashboardData.agendaItems.find((item) => {
    if (item.progress >= 100 || item.isAllDay) return false;
    const start = getTimeInMinutes(item.startTime);
    return start !== null && start > currentMinutes;
  });
  const focusAgendaItem = currentAgendaItem || nextAgendaItem;
  const agendaIsLoading =
    history.isLoading || habits.isLoading || taskGroups.isLoading;
  const agendaHasError =
    history.isError || habits.isError || taskGroups.isError;
  const pendingAgendaItems = dashboardData.agendaItems.filter(
    (item) => item.progress < 100,
  );
  const visibleAgendaItems = getPendingDashboardAgendaItems(
    dashboardData.agendaItems,
  );
  const copyableActivityIds = new Set([
    ...(habits.data || [])
      .filter((habit) => !habit.isArchived && !habit.isHidden)
      .map((habit) => habit.id),
    ...(taskGroups.data || [])
      .filter((taskGroup) => !taskGroup.isHidden)
      .map((taskGroup) => taskGroup.id),
  ]);
  const plannedYesterdayActivities = dashboardData.yesterdayActivities.filter(
    (activity) => activity.isPlanned && copyableActivityIds.has(activity.id),
  );
  const plannedPreviousWeekActivities =
    dashboardData.previousWeekActivities.filter(
      (activity) => activity.isPlanned && copyableActivityIds.has(activity.id),
    );
  const savedDailyReview = currentReview.data?.[now.format("DD")];
  const yesterdayReviewMonth = yesterday.isSame(now, "month")
    ? currentReview.data
    : previousMonthReview.data;
  const yesterdayFocusValue = yesterdayReviewMonth?.[yesterday.format("DD")];
  const dailyFocus =
    yesterdayFocusValue && typeof yesterdayFocusValue === "object"
      ? yesterdayFocusValue.answers?.tomorrow?.trim()
      : "";
  const isReviewComplete = Boolean(
    savedDailyReview &&
    typeof savedDailyReview === "object" &&
    isDailyReviewComplete(
      savedDailyReview.answers || {},
      savedDailyReview.summary,
    ),
  );
  const hasWeekActivity = dashboardData.week.some(
    (day) => day.planned > 0 || day.total > 0,
  );
  const quickMeasureHabit = habits.data?.find(
    (habit) => habit.id === quickMeasureItem?.activityId,
  );
  const quickTaskGroups = (taskGroups.data || []).filter(
    (taskGroup) =>
      !taskGroup.isHidden &&
      !taskGroup.isDividedIntoStages &&
      taskGroup.valueType === "todoList",
  );
  const visibleRecoveryHabits = dashboardData.recoveryHabits.slice(0, 3);
  const remainingRecoveryHabits = Math.max(
    0,
    dashboardData.recoveryHabits.length - visibleRecoveryHabits.length,
  );

  const weekChartMax = Math.max(
    100,
    Math.ceil(
      Math.max(...dashboardData.week.map((day) => day.progress), 100) / 25,
    ) * 25,
  );
  const hasLifeBalance = dashboardData.lifeBalance.some(
    (area) => area.plannedPoints > 0 || area.actualPoints > 0,
  );
  const reviewWeek = useMemo(
    () => getDashboardReviewWeekData(weeklyReviews.data || [], now),
    [now, weeklyReviews.data],
  );
  const hasReviewWeekData = reviewWeek.some(
    (day) => day.mood !== null || day.energy !== null,
  );

  const getTodayHistoryUpdate = (activityId: string, data: unknown) => ({
    id: now.format("YYYY-MM"),
    path: `${now.format("D")}.${activityId}`,
    data,
  });

  const saveQuickActivity = async (
    item: DashboardAgendaItem,
    data: Record<string, any>,
  ) => {
    setQuickSavingId(item.id);
    try {
      await updateHistory(
        getTodayHistoryUpdate(item.activityId, data),
      ).unwrap();
      message.success(`«${item.title}» оновлено`);
    } catch {
      message.error("Не вдалося зберегти результат. Спробуй ще раз.");
    } finally {
      setQuickSavingId(undefined);
    }
  };

  const handleQuickComplete = async (item: DashboardAgendaItem) => {
    if (item.activityId === habitsConfig.habits.dailyReview.details) {
      navigate(`${routes.review.daily}?date=${now.format("YYYY-MM-DD")}`);
      return;
    }

    if (item.activityId === habitsConfig.habits.goalsGratitude.details) {
      navigate(
        `${routes.review.goalsGratitude}?date=${now.format("YYYY-MM-DD")}`,
      );
      return;
    }

    if (item.kind === "habit") {
      const habit = habits.data?.find(
        (candidate) => candidate.id === item.activityId,
      );
      if (!habit) return;
      if (habit.valueType === "measures") {
        setQuickMeasureItem(item);
        return;
      }
      await saveQuickActivity(item, completeBooleanHabit(habit, item.source));
      return;
    }

    if (typeof item.taskIndex === "number") {
      await saveQuickActivity(
        item,
        completeTaskAtIndex(item.source, item.taskIndex),
      );
      return;
    }

    navigate(`${routes.calendar.tracker}?view=day`);
  };

  const handleSaveMeasuredHabit = async (values: Record<string, number>) => {
    if (!quickMeasureItem || !quickMeasureHabit) return;
    await saveQuickActivity(
      quickMeasureItem,
      completeMeasuredHabit(quickMeasureHabit, quickMeasureItem.source, values),
    );
    setQuickMeasureItem(undefined);
  };

  const handleCopyPlan = async (
    activities: typeof plannedYesterdayActivities,
    successMessage: string,
  ) => {
    setIsCopyingPlan(true);
    try {
      await Promise.all(
        activities.map((activity) =>
          updateHistory(
            getTodayHistoryUpdate(
              activity.id,
              resetActivityForPlanning(activity.source),
            ),
          ).unwrap(),
        ),
      );
      message.success(successMessage);
      setIsPlanDialogOpen(false);
    } catch {
      message.error("Не вдалося скопіювати план. Спробуй ще раз.");
    } finally {
      setIsCopyingPlan(false);
    }
  };

  const handleAddQuickTask = async ({
    title,
    taskGroupId,
    time,
    category,
  }: {
    title: string;
    taskGroupId: string;
    time: Array<number | string>;
    category?: string;
  }) => {
    const taskGroup = quickTaskGroups.find(({ id }) => id === taskGroupId);
    if (!taskGroup) return;
    const currentSource =
      dashboardData.todayActivities.find(({ id }) => id === taskGroupId)
        ?.source || {};

    setIsSavingQuickTask(true);
    try {
      await updateHistory(
        getTodayHistoryUpdate(
          taskGroup.id,
          appendQuickTask(
            taskGroup,
            currentSource,
            title,
            uniqid(),
            time,
            category,
          ),
        ),
      ).unwrap();
      message.success(`Справу додано до «${taskGroup.title}»`);
      setIsQuickTaskOpen(false);
    } catch {
      message.error("Не вдалося додати справу. Спробуй ще раз.");
    } finally {
      setIsSavingQuickTask(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      downloadFirebaseBackup(await buildFirebaseBackup());
      message.success("Резервну копію завантажено");
    } catch {
      message.error("Не вдалося створити резервну копію");
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const summaryCards: Array<{
    label: string;
    value: string | number;
    hint: string;
    action?: () => void;
  }> = [
    {
      label: "Виконання плану",
      value: `${dashboardData.todayPerformance.progress}%`,
      hint: dashboardData.todayPerformance.planned
        ? `${dashboardData.todayPerformance.completedPlanned} із ${dashboardData.todayPerformance.planned} запланованих завершено${
            dashboardData.todayPerformance.completedOutsidePlan
              ? ` · ${dashboardData.todayPerformance.completedOutsidePlan} поза планом`
              : ""
          }`
        : "На сьогодні план не сформовано",
    },
    {
      label: "Активна серія",
      value: `${dashboardData.streak} дн.`,
      hint: "Дні поспіль із зафіксованою активністю",
    },
    {
      label: "Активні цілі",
      value: dashboardData.activeAims.length,
      hint: `${aims.data?.length || 0} цілей загалом`,
    },
    {
      label: "Огляд дня",
      value: isReviewComplete ? "Готово" : "Не готово",
      hint: isReviewComplete
        ? "П’ять відповідей збережено"
        : "Заверши день короткою рефлексією",
      action: () => navigate(routes.review.daily),
    },
  ];

  return (
    <StyledMain>
      <header className="dashboard-header">
        <Box>
          <Typography variant="h3" component="h1">
            Сьогодні
          </Typography>
          <Typography color="text.secondary" textTransform="capitalize">
            {now.locale("uk").format("dddd, D MMMM YYYY")}
          </Typography>
        </Box>
        <div className="dashboard-actions">
          <Button
            variant="contained"
            startIcon={<CheckCircleOutline />}
            onClick={() => navigate(`${routes.calendar.tracker}?view=day`)}
          >
            Внести дані за сьогодні
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditNoteOutlined />}
            onClick={() => navigate(routes.review.daily)}
          >
            Огляд дня
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddTaskOutlined />}
            disabled={!quickTaskGroups.length}
            onClick={() => setIsQuickTaskOpen(true)}
          >
            Швидка справа
          </Button>
          <Button
            className="dashboard-action--desktop-secondary"
            variant="outlined"
            startIcon={<AssessmentOutlined />}
            onClick={() => navigate(routes.review.weekly)}
          >
            Підсумок тижня
          </Button>
          <Button
            className="dashboard-action--desktop-secondary"
            variant="text"
            startIcon={<CloudDownloadOutlined />}
            disabled={isDownloadingBackup}
            onClick={handleDownloadBackup}
          >
            {isDownloadingBackup ? "Створюю копію…" : "Резервна копія"}
          </Button>
        </div>
      </header>

      <section className="daily-guidance-grid" aria-label="Фокус і відновлення">
        <Card className="guidance-card focus-card">
          <CardContent>
            <div className="guidance-heading">
              <span className="guidance-icon guidance-icon--focus">
                <LightbulbOutlined />
              </span>
              <Box minWidth={0}>
                <Typography variant="overline" color="primary.main">
                  Головний фокус дня
                </Typography>
                <Typography variant="h6">
                  {dailyFocus || "Фокус на сьогодні ще не сформульовано"}
                </Typography>
              </Box>
            </div>
            <Typography variant="body2" color="text.secondary" mt={1.5}>
              {dailyFocus
                ? "Перенесено з учорашнього щоденного огляду."
                : "Запиши один конкретний фокус у вечірньому огляді — завтра він з’явиться тут."}
            </Typography>
            {!dailyFocus && (
              <Button
                size="small"
                onClick={() =>
                  navigate(
                    `${routes.review.daily}?date=${yesterday.format("YYYY-MM-DD")}`,
                  )
                }
              >
                Відкрити огляд за вчора
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="guidance-card recovery-card">
          <CardContent>
            <div className="guidance-heading">
              <span className="guidance-icon guidance-icon--recovery">
                <ReplayOutlined />
              </span>
              <Box minWidth={0}>
                <Typography variant="overline" color="secondary.main">
                  Не пропускай двічі
                </Typography>
                <Typography variant="h6">
                  {visibleRecoveryHabits.length
                    ? "Сьогодні достатньо просто повернутися"
                    : "Відновлення не потрібне"}
                </Typography>
              </Box>
            </div>
            {visibleRecoveryHabits.length ? (
              <>
                <div className="recovery-habit-list">
                  {visibleRecoveryHabits.map((habit) => (
                    <Chip
                      key={habit.id}
                      size="small"
                      color={habit.todayIsPlanned ? "primary" : "default"}
                      variant={habit.todayIsPlanned ? "filled" : "outlined"}
                      label={`${habit.title}${
                        habit.todayIsPlanned ? " · у плані" : " · додай у план"
                      }`}
                    />
                  ))}
                  {remainingRecoveryHabits > 0 && (
                    <Chip size="small" label={`Ще ${remainingRecoveryHabits}`} />
                  )}
                </div>
                <Button
                  size="small"
                  onClick={() =>
                    navigate(`${routes.calendar.tracker}?view=day&mode=planning`)
                  }
                >
                  Відкрити план дня
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" mt={1.5}>
                Немає незавершених учорашніх звичок, які потребують повернення.
              </Typography>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="summary-grid" aria-label="Підсумок дня">
        {summaryCards.map((card) => (
          <Card
            className={`metric-card${card.action ? " metric-card--interactive" : ""}`}
            key={card.label}
            role={card.action ? "button" : undefined}
            tabIndex={card.action ? 0 : undefined}
            onClick={card.action}
            onKeyDown={(event) => {
              if (card.action && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                card.action();
              }
            }}
          >
            <CardContent>
              <Typography color="text.secondary">{card.label}</Typography>
              <div className="metric-value">{card.value}</div>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {card.hint}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="content-grid">
        <div className="dashboard-flow">
          <Card className="dashboard-card week-card">
            <CardContent>
              <Typography variant="h5">Ритм поточного тижня</Typography>
              <Typography color="text.secondary">
                Виконання відносно плану дня; робота поза планом може дати понад
                100%
              </Typography>
              {hasWeekActivity ? (
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: dashboardData.week.map((day) => day.label),
                    },
                  ]}
                  yAxis={[{ min: 0, max: weekChartMax }]}
                  series={[
                    {
                      data: dashboardData.week.map((day) => day.progress),
                      label: "Виконання плану, %",
                      color: "#5b6cf9",
                      valueFormatter: (value) => `${value ?? 0}%`,
                    },
                  ]}
                  height={235}
                  margin={{ left: 42, right: 12, top: 28, bottom: 24 }}
                />
              ) : (
                <Box className="chart-empty-state">
                  <Typography fontWeight={650}>
                    Цього тижня ще немає даних для графіка
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Сформуй план дня — ритм з’явиться після перших результатів.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setIsPlanDialogOpen(true)}
                  >
                    Сформувати план
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card balance-card">
            <CardContent>
              <Typography variant="h5">Баланс життя за тиждень</Typography>
              <Typography color="text.secondary">
                Частка запланованого й фактичного навантаження за сферами,
                зважена на складність звичок
              </Typography>
              {hasLifeBalance ? (
                <>
                  <BarChart
                    layout="horizontal"
                    yAxis={[
                      {
                        scaleType: "band",
                        data: dashboardData.lifeBalance.map(
                          (area) => area.shortTitle,
                        ),
                      },
                    ]}
                    xAxis={[
                      {
                        min: 0,
                        max: 100,
                        valueFormatter: (value) => `${value}%`,
                      },
                    ]}
                    series={[
                      {
                        data: dashboardData.lifeBalance.map(
                          (area) => area.plannedShare,
                        ),
                        label: "План, %",
                        color: "#c4cad6",
                        valueFormatter: (value) => `${value ?? 0}%`,
                      },
                      {
                        data: dashboardData.lifeBalance.map(
                          (area) => area.actualShare,
                        ),
                        label: "Факт, %",
                        color: "#18a874",
                        valueFormatter: (value) => `${value ?? 0}%`,
                      },
                    ]}
                    height={235}
                    margin={{ left: 88, right: 12, top: 34, bottom: 24 }}
                  />
                </>
              ) : (
                <Box className="chart-empty-state">
                  <Typography fontWeight={650}>
                    Баланс з’явиться разом із тижневим планом
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Категорії та складність звичок уже враховуються автоматично.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setIsPlanDialogOpen(true)}
                  >
                    Сформувати план
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card wellbeing-card">
            <CardContent>
              <Typography variant="h5">Настрій та енергія</Typography>
              <Typography color="text.secondary">
                Дані щоденних оглядів за шкалою від 1 до 5
              </Typography>
              {hasReviewWeekData ? (
                <LineChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: reviewWeek.map((day) => day.label),
                    },
                  ]}
                  yAxis={[
                    {
                      min: 1,
                      max: 5,
                      tickNumber: 5,
                    },
                  ]}
                  series={[
                    {
                      data: reviewWeek.map((day) => day.mood),
                      label: "Настрій",
                      color: "#8b5cf6",
                      valueFormatter: (value) =>
                        value === null ? "Немає огляду" : `${value}/5`,
                    },
                    {
                      data: reviewWeek.map((day) => day.energy),
                      label: "Енергія",
                      color: "#f59e0b",
                      valueFormatter: (value) =>
                        value === null ? "Немає огляду" : `${value}/5`,
                    },
                  ]}
                  height={235}
                  margin={{ left: 36, right: 12, top: 34, bottom: 24 }}
                />
              ) : (
                <Box className="chart-empty-state">
                  <Typography fontWeight={650}>
                    За цей тиждень ще немає щоденних оглядів
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Після першого огляду тут з’явиться динаміка настрою та
                    енергії.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(routes.review.daily)}
                  >
                    Додати огляд
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card goals-card">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
              >
                <Box>
                  <Typography variant="h5">Активні цілі</Typography>
                  <Typography color="text.secondary">
                    Цілі, період яких включає сьогоднішню дату
                  </Typography>
                </Box>
                <Button onClick={() => navigate(routes.aims.list)}>
                  Усі цілі
                </Button>
              </Box>
              {dashboardData.activeAims.length ? (
                <Box className="goals-scroll">
                  {dashboardData.activeAims.map((aim) => {
                    const snapshot = dashboardData.aimProgressById.get(aim.id);
                    const progress = snapshot?.progress || 0;

                    return (
                      <Box className="goal-row" key={aim.id}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          gap={2}
                          mb={1}
                        >
                          <Typography fontWeight={600}>{aim.title}</Typography>
                          <Typography flexShrink={0}>
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, progress))}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.75}
                        >
                          {aim.aimType === "number"
                            ? `${Number((snapshot?.currentValue || 0).toFixed(2))} із ${aim.finalAim}`
                            : aim.aimType === "boolean"
                              ? progress >= 100
                                ? "Ціль виконано"
                                : "Ціль у процесі"
                              : `${Math.round(progress)}% пов’язаних справ виконано`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography color="text.secondary" mt={2}>
                  На сьогодні активних цілей немає. Старі цілі залишаються в
                  загальному календарі.
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="side-column">
          <Card className="dashboard-card plan-card">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={1}
                mb={1}
              >
                <Box>
                  <Typography variant="h5">План дня</Typography>
                  <Typography color="text.secondary">
                    Заплановані звички та конкретні справи
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() =>
                    navigate(`${routes.calendar.tracker}?view=day`)
                  }
                >
                  Трекер
                </Button>
              </Box>
              {agendaIsLoading && (
                <LinearProgress aria-label="Завантаження плану дня" />
              )}
              {agendaHasError && (
                <Box mt={2}>
                  <Typography color="error" variant="body2">
                    Не вдалося завантажити план дня.
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      history.refetch();
                      habits.refetch();
                      taskGroups.refetch();
                    }}
                  >
                    Спробувати ще раз
                  </Button>
                </Box>
              )}
              {!agendaHasError && focusAgendaItem && (
                <div className="agenda-focus">
                  <span>{currentAgendaItem ? "Зараз" : "Далі"}</span>
                  <strong>{focusAgendaItem.title}</strong>
                  {!focusAgendaItem.isAllDay && (
                    <small>{formatTime(focusAgendaItem.startTime)}</small>
                  )}
                </div>
              )}
              {!agendaHasError && Boolean(visibleAgendaItems.length) && (
                <div
                  className="agenda-scroll"
                  role="list"
                  aria-label="Незавершений план дня"
                >
                  {visibleAgendaItems.map((item) => {
                  const isCurrent = currentAgendaItem?.id === item.id;
                  const isNext =
                    !currentAgendaItem && nextAgendaItem?.id === item.id;
                  return (
                    <div
                      className={`agenda-row${isCurrent ? " agenda-row--current" : ""}`}
                      key={item.id}
                      role="listitem"
                    >
                      <div className="agenda-time">
                        {formatAgendaTime(
                          item.startTime,
                          item.endTime,
                          item.isAllDay,
                        )}
                      </div>
                      <Box minWidth={0}>
                        <Typography fontWeight={600}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[
                            item.parentTitle ||
                              (item.kind === "habit"
                                ? "Звичка"
                                : "Список справ"),
                            getLifeArea(item.category)?.shortTitle,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                      </Box>
                      <div className="agenda-action">
                        <Chip
                          size="small"
                          color={
                            item.progress >= 100
                              ? "success"
                              : item.status === "failed"
                                ? "error"
                                : isCurrent
                                  ? "primary"
                                  : "default"
                          }
                          variant={isNext ? "outlined" : "filled"}
                          label={
                            item.progress >= 100
                              ? "Виконано"
                              : item.status === "failed"
                                ? "Не виконано"
                                : isCurrent
                                  ? "Зараз"
                                  : isNext
                                    ? "Наступне"
                                    : item.progress > 0
                                      ? `${Math.round(item.progress)}%`
                                      : "Заплановано"
                          }
                        />
                        {item.progress < 100 && (
                          <Tooltip title="Швидко зафіксувати результат">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                aria-label={`Виконати ${item.title}`}
                                disabled={quickSavingId === item.id}
                                onClick={() => handleQuickComplete(item)}
                              >
                                <DoneRounded fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
              {!agendaIsLoading &&
                !agendaHasError &&
                !pendingAgendaItems.length && (
                  <Box className="plan-empty-state">
                    <Typography color="text.secondary">
                      {dashboardData.agendaItems.length
                        ? "Усі заплановані справи на сьогодні виконано."
                        : "План на сьогодні ще не сформовано."}
                    </Typography>
                    {!dashboardData.agendaItems.length && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setIsPlanDialogOpen(true)}
                      >
                        Сформувати план дня
                      </Button>
                    )}
                  </Box>
                )}
            </CardContent>
          </Card>
          <DailyCounters className="daily-counters" />
        </aside>
      </section>
      <TodayPlanDialog
        open={isPlanDialogOpen}
        canCopyYesterday={plannedYesterdayActivities.length > 0}
        canCopyPreviousWeek={plannedPreviousWeekActivities.length > 0}
        isSaving={isCopyingPlan}
        onClose={() => setIsPlanDialogOpen(false)}
        onCopyYesterday={() =>
          handleCopyPlan(
            plannedYesterdayActivities,
            "Вчорашній план перенесено на сьогодні",
          )
        }
        onCopyPreviousWeek={() =>
          handleCopyPlan(
            plannedPreviousWeekActivities,
            "План аналогічного дня минулого тижня перенесено на сьогодні",
          )
        }
        onOpenPlanning={() => {
          setIsPlanDialogOpen(false);
          navigate(`${routes.calendar.tracker}?view=day&mode=planning`);
        }}
      />
      <QuickMeasureDialog
        habit={quickMeasureHabit}
        source={quickMeasureItem?.source}
        isSaving={Boolean(quickSavingId)}
        onClose={() => setQuickMeasureItem(undefined)}
        onSave={handleSaveMeasuredHabit}
      />
      <QuickTaskDialog
        open={isQuickTaskOpen}
        taskGroups={quickTaskGroups}
        isSaving={isSavingQuickTask}
        onClose={() => setIsQuickTaskOpen(false)}
        onSave={handleAddQuickTask}
      />
      {isMobile && (
        <Fab
          className="mobile-quick-task-fab"
          variant="extended"
          color="primary"
          aria-label="Додати швидку справу на сьогодні"
          disabled={!quickTaskGroups.length}
          onClick={() => setIsQuickTaskOpen(true)}
        >
          <AddTaskOutlined />
          Справа
        </Fab>
      )}
    </StyledMain>
  );
};

export default Main;
