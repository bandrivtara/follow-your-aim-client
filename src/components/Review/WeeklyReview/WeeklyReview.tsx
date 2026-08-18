import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import TodayOutlined from "@mui/icons-material/TodayOutlined";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/uk";
import { BarChart } from "@mui/x-charts/BarChart";
import { getTrackerDateRange } from "components/Calendar/Tracker/calendarRange";
import { downloadTrackerExport } from "components/Calendar/Tracker/trackerExport";
import { getDashboardWeekData } from "components/Main/dashboardCalculations";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import { useGetHabitListQuery } from "store/services/habits";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { useGetDailyReviewsBetweenDatesQuery } from "store/services/dailyReviews";
import { useGetAimsListQuery } from "store/services/aims";
import ReviewLayout from "../ReviewLayout.styled";
import {
  buildWeeklyReviewExport,
  getDailyReviewForDate,
} from "./weeklyReviewExport";
import { buildWeeklyPlanningExport } from "./weeklyPlanningExport";

const WeeklyReview = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dateFrom, dateTo] = useMemo(
    () => getTrackerDateRange(selectedDate, "week"),
    [selectedDate],
  );
  const contextFrom = dateFrom.subtract(3, "week");
  const nextWeekTo = dateTo.add(1, "week");
  const monthRange: [number, number] = useMemo(
    () => [contextFrom.startOf("month").unix(), nextWeekTo.startOf("month").unix()],
    [contextFrom, nextWeekTo],
  );
  const history = useGetHistoryBetweenDatesQuery(monthRange);
  const dailyReviews = useGetDailyReviewsBetweenDatesQuery(monthRange);
  const habits = useGetHabitListQuery();
  const taskGroups = useGetTaskGroupListQuery();
  const aims = useGetAimsListQuery();

  const summary = useMemo(() => {
    const week = getDashboardWeekData(
      (history.data || []) as Record<string, any>[],
      dateFrom,
      habits.data || [],
    );
    const daysWithPlan = week.filter((day) => day.planned > 0);
    const reviews = week
      .map((day) =>
        getDailyReviewForDate(dailyReviews.data || [], dayjs(day.date)),
      )
      .filter(Boolean);

    return {
      week,
      averageProgress: daysWithPlan.length
        ? Math.round(
            daysWithPlan.reduce((sum, day) => sum + day.progress, 0) /
              daysWithPlan.length,
          )
        : 0,
      planned: week.reduce((sum, day) => sum + day.planned, 0),
      completedPlanned: week.reduce(
        (sum, day) => sum + day.completedPlanned,
        0,
      ),
      reviewCount: reviews.length,
      averageMood: reviews.length
        ? (
            reviews.reduce((sum, review) => sum + (review?.mood || 0), 0) /
            reviews.length
          ).toFixed(1)
        : "—",
    };
  }, [dailyReviews.data, dateFrom, habits.data, history.data]);

  const isFetching =
    history.isFetching ||
    dailyReviews.isFetching ||
    habits.isFetching ||
    taskGroups.isFetching ||
    aims.isFetching;

  const downloadReport = () => {
    const content = buildWeeklyReviewExport({
      dateFrom,
      dateTo,
      history: (history.data || []) as Record<string, any>[],
      habits: habits.data || [],
      taskGroups: taskGroups.data || [],
      reviewMonths: dailyReviews.data || [],
    });
    downloadTrackerExport(
      content,
      `weekly-review-${dateFrom.format("YYYY-MM-DD")}--${dateTo.format(
        "YYYY-MM-DD",
      )}.md`,
    );
  };

  const downloadPlanningContext = () => {
    const content = buildWeeklyPlanningExport({
      lastWeekFrom: dateFrom,
      lastWeekTo: dateTo,
      history: (history.data || []) as Record<string, any>[],
      habits: habits.data || [],
      taskGroups: taskGroups.data || [],
      aims: aims.data || [],
      reviewMonths: dailyReviews.data || [],
    });
    const nextWeekFrom = dateFrom.add(1, "week");
    downloadTrackerExport(
      content,
      `weekly-planning-${nextWeekFrom.format("YYYY-MM-DD")}--${nextWeekFrom
        .add(6, "day")
        .format("YYYY-MM-DD")}.md`,
    );
  };

  const chartMax = Math.max(
    100,
    Math.ceil(Math.max(...summary.week.map((day) => day.progress), 100) / 25) *
      25,
  );
  const metricCards = [
    ["Середнє виконання", `${summary.averageProgress}%`],
    ["Виконано за планом", `${summary.completedPlanned}/${summary.planned}`],
    ["Щоденних оглядів", `${summary.reviewCount}/7`],
    ["Середній настрій", `${summary.averageMood}${summary.averageMood === "—" ? "" : "/5"}`],
  ];

  return (
    <ReviewLayout>
      <header className="review-header">
        <Box>
          <Typography variant="h4" component="h1">
            Підсумок тижня
          </Typography>
          <Typography color="text.secondary">
            {dateFrom.locale("uk").format("D MMMM")} — {dateTo.locale("uk").format("D MMMM YYYY")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <DatePicker
            allowClear={false}
            value={selectedDate}
            format="DD.MM.YYYY"
            onChange={(value) => value && setSelectedDate(value)}
          />
          <Button
            variant="outlined"
            startIcon={<TodayOutlined />}
            onClick={() => setSelectedDate(dayjs())}
          >
            Поточний
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined />}
            disabled={isFetching}
            onClick={downloadReport}
          >
            Звіт за тиждень
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeOutlined />}
            disabled={isFetching}
            onClick={downloadPlanningContext}
          >
            Планувати наступний
          </Button>
        </Stack>
      </header>

      {isFetching ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <section className="weekly-summary-grid" aria-label="Показники тижня">
            {metricCards.map(([label, value]) => (
              <Card className="review-card" key={label}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={0.5}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="weekly-content-grid">
            <Card className="review-card">
              <CardContent>
                <Typography variant="h5">Ритм тижня</Typography>
                <Typography color="text.secondary">
                  Виконання відносно денного плану
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: summary.week.map((day) => day.label),
                    },
                  ]}
                  yAxis={[{ min: 0, max: chartMax }]}
                  series={[
                    {
                      data: summary.week.map((day) => day.progress),
                      label: "Виконання, %",
                      color: "#52a447",
                    },
                  ]}
                  height={300}
                  margin={{ left: 45, right: 12, top: 35, bottom: 30 }}
                />
              </CardContent>
            </Card>

            <Card className="review-card">
              <CardContent>
                <Typography variant="h5" mb={2}>
                  Дні тижня
                </Typography>
                <div className="weekly-day-list">
                  {summary.week.map((day) => {
                    const review = getDailyReviewForDate(
                      dailyReviews.data || [],
                      dayjs(day.date),
                    );
                    return (
                      <Box key={day.date}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          <Typography fontWeight={600}>
                            {dayjs(day.date).locale("uk").format("dd, D MMM")}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {review && (
                              <Chip
                                size="small"
                                color="primary"
                                variant="outlined"
                                label={`Огляд · ${review.mood}/5`}
                              />
                            )}
                            <Chip size="small" label={`${day.progress}%`} />
                          </Stack>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, day.progress)}
                        />
                      </Box>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </ReviewLayout>
  );
};

export default WeeklyReview;
