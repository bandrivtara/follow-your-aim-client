import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  CheckCircleOutline,
  FlagOutlined,
} from "@mui/icons-material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import routes from "config/routes";
import { useGetAimsListQuery } from "store/services/aims";
import { useGetHabitListQuery } from "store/services/habits";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import WaterCounter from "./WaterCounter/WaterCounter";
import StyledMain from "./Main.styled";
import {
  getActivityStreak,
  getDashboardActivitiesForDate,
  getDashboardWeekData,
} from "./dashboardCalculations";

const formatTime = (time?: Array<number | string>) =>
  Array.isArray(time) && time.length >= 2
    ? `${String(time[0]).padStart(2, "0")}:${String(time[1]).padStart(2, "0")}`
    : "—";

const Main = () => {
  const navigate = useNavigate();
  const now = useMemo(() => dayjs(), []);
  const historyRange = useMemo(
    () => [
      now.subtract(90, "day").startOf("month").unix(),
      now.startOf("month").unix(),
    ],
    [now],
  );
  const history = useGetHistoryBetweenDatesQuery(historyRange);
  const habits = useGetHabitListQuery();
  const aims = useGetAimsListQuery();

  const dashboardData = useMemo(() => {
    const historyData = (history.data || []) as Record<string, any>[];
    const habitData = habits.data || [];
    const todayActivities = getDashboardActivitiesForDate(
      historyData,
      now,
      habitData,
    );
    const week = getDashboardWeekData(historyData, now, habitData);
    const todayAverage = todayActivities.length
      ? Math.round(
          todayActivities.reduce(
            (sum, activity) => sum + activity.progress,
            0,
          ) / todayActivities.length,
        )
      : 0;
    const completedToday = todayActivities.filter(
      (activity) => activity.progress >= 100,
    ).length;
    const activeAims = (aims.data || []).filter(
      (aim) =>
        !now.isBefore(dayjs(aim.dateFrom), "day") &&
        !now.isAfter(dayjs(aim.dateTo), "day"),
    );
    const activityById = new Map(
      todayActivities.map((activity) => [activity.id, activity]),
    );
    const scheduledHabits = (habits.data || [])
      .filter(
        (habit) =>
          !habit.isHidden &&
          Array.isArray(habit.startTime) &&
          habit.startTime.length >= 2,
      )
      .sort(
        (left, right) =>
          Number(left.startTime[0]) * 60 +
          Number(left.startTime[1]) -
          (Number(right.startTime[0]) * 60 + Number(right.startTime[1])),
      )
      .slice(0, 7);

    return {
      todayActivities,
      week,
      todayAverage,
      completedToday,
      activeAims,
      activityById,
      scheduledHabits,
      streak: getActivityStreak(historyData, now, 90, habitData),
    };
  }, [aims.data, habits.data, history.data, now]);

  const summaryCards = [
    {
      label: "Виконання сьогодні",
      value: `${dashboardData.todayAverage}%`,
      hint: `${dashboardData.completedToday} із ${dashboardData.todayActivities.length} активностей завершено`,
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
      label: "Звички",
      value: habits.data?.length || 0,
      hint: `${dashboardData.scheduledHabits.length} мають час у розкладі`,
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
            onClick={() => navigate(routes.calendar.tracker)}
          >
            Відкрити трекер
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthOutlined />}
            onClick={() => navigate(routes.calendar.scheduler)}
          >
            Розклад
          </Button>
          <Button
            variant="outlined"
            startIcon={<FlagOutlined />}
            onClick={() => navigate(routes.calendar.aims)}
          >
            Цілі
          </Button>
        </div>
      </header>

      <section className="summary-grid" aria-label="Підсумок дня">
        {summaryCards.map((card) => (
          <Card className="metric-card" key={card.label}>
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
        <Stack spacing={2}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h5">Ритм поточного тижня</Typography>
              <Typography color="text.secondary">
                Середній відсоток виконання активностей за кожен день
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: dashboardData.week.map((day) => day.label),
                  },
                ]}
                yAxis={[{ min: 0, max: 100 }]}
                series={[
                  {
                    data: dashboardData.week.map((day) => day.progress),
                    label: "Виконання, %",
                    color: "#52a447",
                    valueFormatter: (value) => `${value ?? 0}%`,
                  },
                ]}
                height={300}
                margin={{ left: 45, right: 20, top: 35, bottom: 30 }}
              />
            </CardContent>
          </Card>

          <Card className="dashboard-card">
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
                dashboardData.activeAims.map((aim) => (
                  <Box key={aim.id} mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontWeight={600}>{aim.title}</Typography>
                      <Typography>{Math.round(aim.progress || 0)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, aim.progress || 0))}
                    />
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" mt={2}>
                  На сьогодні активних цілей немає. Старі цілі залишаються в
                  загальному календарі.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>

        <aside className="side-column">
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h5">Звички за часом</Typography>
              <Typography color="text.secondary" mb={1}>
                Швидкий огляд щоденного розкладу
              </Typography>
              {dashboardData.scheduledHabits.map((habit) => {
                const progress =
                  dashboardData.activityById.get(habit.id)?.progress || 0;
                return (
                  <div className="schedule-row" key={habit.id}>
                    <Box>
                      <Typography fontWeight={600}>{habit.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(habit.startTime)}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color={progress >= 100 ? "success" : "default"}
                      label={
                        progress >= 100
                          ? "Виконано"
                          : `${Math.round(progress)}%`
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <WaterCounter />
        </aside>
      </section>
    </StyledMain>
  );
};

export default Main;
