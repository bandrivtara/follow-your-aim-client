// @ts-nocheck

import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler as ReactScheduler,
  DayView,
  WeekView,
  MonthView,
  Appointments,
  AppointmentTooltip,
  DateNavigator,
  Toolbar,
  TodayButton,
  AllDayPanel,
  ViewSwitcher,
} from "@devexpress/dx-react-scheduler-material-ui";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import { useGetHabitListQuery } from "store/services/habits";
import routes from "config/routes";

type SchedulerViewName = "Day" | "Week" | "Month";

const getMonday = (date: Dayjs) =>
  date.startOf("day").subtract((date.day() + 6) % 7, "day");

const getHistoryMonthRange = (
  currentDay: Dayjs,
  viewName: SchedulerViewName,
) => {
  const visibleFrom =
    viewName === "Week" ? getMonday(currentDay) : currentDay.startOf("month");
  const visibleTo =
    viewName === "Week" ? visibleFrom.add(6, "day") : currentDay.endOf("month");

  return [
    visibleFrom.startOf("month").unix(),
    visibleTo.startOf("month").unix(),
  ];
};

const Scheduler = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentDay, setCurrentDay] = useState<Dayjs>(dayjs());
  const [currentViewName, setCurrentViewName] =
    useState<SchedulerViewName>("Week");
  const historyRange = useMemo(
    () => getHistoryMonthRange(currentDay, currentViewName),
    [currentDay, currentViewName],
  );
  const history = useGetHistoryBetweenDatesQuery(historyRange);
  const habits = useGetHabitListQuery();

  useEffect(() => {
    if (!history.data || !habits.data) return;
    const newAppointments = [];

    history.data.forEach((monthData) => {
      for (const [day, dayData] of Object.entries(monthData)) {
        if (!/^\d{1,2}$/.test(day) || !dayData || typeof dayData !== "object") {
          continue;
        }

        for (const [activityId, activityValue] of Object.entries(dayData)) {
          const currentHabit = habits.data.find(
            (habit) => habit.id === activityId,
          );
          if (!currentHabit) continue;

          const isAllDay =
            activityValue.isAllDay ?? currentHabit.isAllDay ?? false;
          const startTime = activityValue.startTime || currentHabit.startTime;
          const endTime = activityValue.endTime || currentHabit.endTime;

          const parsedDate = dayjs.unix(monthData.unix);
          const year = parsedDate.year();
          const month = parsedDate.month();
          const activityDate = new Date(year, month, +day);

          if (isAllDay) {
            newAppointments.push({
              title: currentHabit.title,
              startDate: activityDate,
              endDate: dayjs(activityDate).add(1, "day").toDate(),
              allDay: true,
              id: `${monthData.unix}-${day}-${activityId}`,
            });
            continue;
          }
          if (!startTime) continue;

          const startDate = new Date(
            year,
            month,
            +day,
            +startTime[0],
            +startTime[1],
          );
          const endDate = endTime
            ? new Date(year, month, +day, +endTime[0], +endTime[1])
            : dayjs(startDate).add(30, "minute").toDate();
          newAppointments.push({
            title: currentHabit.title,
            startDate,
            endDate,
            id: `${monthData.unix}-${day}-${activityId}`,
          });
        }
      }
    });

    setData(newAppointments);
  }, [habits.data, history.data]);

  const TimeTableCell = memo(
    ({ onDoubleClick: _onDoubleClick, ...props }: any) => (
      <WeekView.TimeTableCell {...props} />
    ),
  );

  return (
    <Stack spacing={2}>
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={1}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Розклад
          </Typography>
          <Typography color="text.secondary">
            Актуальні заплановані звички на день, тиждень або місяць
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate(routes.calendar.tracker)}
        >
          Відкрити трекер
        </Button>
      </Box>

      <Alert severity="info">
        Розклад читає запланований час зі звичок та історії. Редагування й
        відмітки виконання робляться у трекері, щоб зміни не губилися після
        перезавантаження.
      </Alert>

      <Paper sx={{ overflow: "hidden", borderRadius: 3 }}>
        <ReactScheduler
          data={data}
          height={currentViewName === "Month" ? 720 : 680}
          locale="uk-UA"
          firstDayOfWeek={1}
        >
          <ViewState
            currentDate={currentDay.toDate()}
            currentViewName={currentViewName}
            onCurrentDateChange={(date) => setCurrentDay(dayjs(date))}
            onCurrentViewNameChange={setCurrentViewName}
          />
          <DayView
            name="Day"
            displayName="День"
            startDayHour={6}
            endDayHour={24}
          />
          <WeekView
            name="Week"
            displayName="Тиждень"
            startDayHour={6}
            endDayHour={24}
            timeTableCellComponent={TimeTableCell}
          />
          <MonthView name="Month" displayName="Місяць" />
          <Toolbar />
          <DateNavigator />
          <TodayButton messages={{ today: "Сьогодні" }} />
          <ViewSwitcher />
          <AllDayPanel />
          <Appointments />
          <AppointmentTooltip />
        </ReactScheduler>
      </Paper>
    </Stack>
  );
};

export default Scheduler;
