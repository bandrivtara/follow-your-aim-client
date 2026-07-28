// @ts-nocheck

import Paper from "@mui/material/Paper";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
  ChangeSet,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler as ReactScheduler,
  WeekView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
  DateNavigator,
  Toolbar,
  TodayButton,
  AllDayPanel,
} from "@devexpress/dx-react-scheduler-material-ui";
import { memo, useCallback, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import { useGetHabitListQuery } from "store/services/habits";

const PREFIX = "Scheduler";
export const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  formControlLabel: `${PREFIX}-formControlLabel`,
};

const Scheduler = () => {
  const [data, setData] = useState([]);
  const [currentDay, setCurrentDay] = useState<Dayjs>(dayjs());

  const history = useGetHistoryBetweenDatesQuery([
    dayjs(currentDay.startOf("month")).unix(),
    dayjs(currentDay.endOf("month")).unix(),
  ]);
  const habits = useGetHabitListQuery();

  const [addedAppointment, setAddedAppointment] = useState({});
  const [isAppointmentBeingCreated, setIsAppointmentBeingCreated] =
    useState(false);

  useEffect(() => {
    if (!history.data || !habits.data) return;
    const newAppointments = [];

    history.data.forEach((monthData) => {
      for (const [day, dayData] of Object.entries(monthData)) {
        if (!dayData || typeof dayData !== "object") continue;

        for (const [activityId, activityValue] of Object.entries(dayData)) {
          const currentHabit = habits.data.find(
            (habit) => habit.id === activityId,
          );
          if (!currentHabit) continue;

          const isAllDay =
            activityValue.isAllDay ?? currentHabit.isAllDay ?? false;
          const startTime = activityValue.startTime || currentHabit.startTime;
          const endTime = activityValue.endTime || currentHabit.endTime;
          if (isAllDay || !startTime || !endTime) continue;

          const parsedDate = dayjs.unix(monthData.unix);
          const year = parsedDate.year();
          const month = parsedDate.month();
          newAppointments.push({
            title: currentHabit.title,
            startDate: new Date(
              year,
              month,
              +day,
              +startTime[0],
              +startTime[1],
            ),
            endDate: new Date(year, month, +day, +endTime[0], +endTime[1]),
            id: `${monthData.unix}-${day}-${activityId}`,
          });
        }
      }
    });

    setData(newAppointments);
  }, [habits.data, history.data]);

  const onCommitChanges = useCallback(
    ({ added, changed, deleted }: ChangeSet) => {
      if (added) {
        const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0;
        setData([...data, { id: startingAddedId, ...added }]);
      }
      if (changed) {
        setData(
          data.map((appointment) =>
            changed[appointment.id]
              ? { ...appointment, ...changed[appointment.id] }
              : appointment,
          ),
        );
      }
      if (deleted !== undefined) {
        setData(data.filter((appointment) => appointment.id !== deleted));
      }
      setIsAppointmentBeingCreated(false);
    },
    [data],
  );

  const onAddedAppointmentChange = useCallback((appointment: object) => {
    setAddedAppointment(appointment);
    setIsAppointmentBeingCreated(true);
  }, []);

  const TimeTableCell = memo(({ onDoubleClick, ...restProps }: any) => (
    <WeekView.TimeTableCell {...restProps} onDoubleClick={onDoubleClick} />
  ));

  const CommandButton = useCallback(({ id, ...restProps }: any) => {
    return <AppointmentForm.CommandButton id={id} {...restProps} />;
  }, []);

  const onCurrentDateChange = (newDate: Date) => {
    setCurrentDay(dayjs(newDate));
  };

  return (
    <Paper>
      <ReactScheduler
        data={data}
        height={600}
        locale="uk-UA"
        firstDayOfWeek={1}
      >
        <ViewState onCurrentDateChange={onCurrentDateChange} />
        <EditingState
          onCommitChanges={onCommitChanges}
          addedAppointment={addedAppointment}
          onAddedAppointmentChange={onAddedAppointmentChange}
        />

        <IntegratedEditing />
        <WeekView
          startDayHour={7}
          endDayHour={24}
          timeTableCellComponent={TimeTableCell}
        />
        <Toolbar />
        <DateNavigator />
        <TodayButton />
        <AllDayPanel />
        <Appointments />

        <AppointmentTooltip showOpenButton showDeleteButton />
        <AppointmentForm
          commandButtonComponent={CommandButton}
          readOnly={isAppointmentBeingCreated}
        />
        <DragDropProvider />
      </ReactScheduler>
    </Paper>
  );
};

export default Scheduler;
