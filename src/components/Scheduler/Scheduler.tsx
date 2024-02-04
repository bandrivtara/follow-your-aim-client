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
import { appointments } from "./appointments";
import { memo, useCallback, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { db } from "store/api";
import { doc, getDoc } from "firebase/firestore";
import { useGetHistoryBetweenDatesQuery } from "store/services/history";
import { useGetHabitListQuery } from "store/services/habits";

const PREFIX = "Scheduler";
// #FOLD_BLOCK
export const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  formControlLabel: `${PREFIX}-formControlLabel`,
};

const Scheduler = () => {
  const [data, setData] = useState([]);
  const [currentDay, setCurrentDay] = useState<Dayjs>(dayjs());

  const history = useGetHistoryBetweenDatesQuery([
    dayjs(currentDay.startOf("week")).unix(),
    dayjs(currentDay.endOf("week")).unix(),
  ]);
  const habits = useGetHabitListQuery();

  const [addedAppointment, setAddedAppointment] = useState({});
  const [isAppointmentBeingCreated, setIsAppointmentBeingCreated] =
    useState(false);

  useEffect(() => {
    const getHistoryData = async () => {
      if (!history.data || !habits.data) return;
      console.log(history.data);
      const newAppointments = [];

      history.data.forEach((monthData) => {
        for (const [day, dayData] of Object.entries(monthData)) {
          for (const [activityId, activityValue] of Object.entries(dayData)) {
            if (
              activityValue.type === "habit" &&
              !activityValue.isAllDay &&
              activityValue.startTime
            ) {
              const currentHabit = habits.data?.find(
                (habit) => habit.id === activityId
              );

              console.log(activityValue, 123);
              const parsedDate = dayjs.unix(monthData.unix);
              const year = parsedDate.year();
              const month = parsedDate.month(); // Adding 1 because months are zero-based
              console.log(activityValue, 444);
              const appointment = {
                title: currentHabit.title,
                startDate: new Date(
                  year,
                  month,
                  day,
                  activityValue.startTime[0],
                  activityValue.startTime[1]
                ),
                endDate: new Date(
                  year,
                  month,
                  day,
                  activityValue.endTime[0],
                  activityValue.endTime[1]
                ),
                id: day + activityId,
              };
              console.log(dayData, 444);
              newAppointments.push(appointment);
            }
          }
        }
      });

      console.log(newAppointments, 333);
      setData(newAppointments);
    };

    getHistoryData();
  }, [habits.data, history]);

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
              : appointment
          )
        );
      }
      if (deleted !== undefined) {
        setData(data.filter((appointment) => appointment.id !== deleted));
      }
      setIsAppointmentBeingCreated(false);
    },
    [setData, setIsAppointmentBeingCreated, data]
  );

  const onAddedAppointmentChange = useCallback((appointment: object) => {
    setAddedAppointment(appointment);
    setIsAppointmentBeingCreated(true);
  }, []);

  const TimeTableCell = memo(({ onDoubleClick, ...restProps }: any) => (
    <WeekView.TimeTableCell {...restProps} onDoubleClick={onDoubleClick} />
  ));

  const CommandButton = useCallback(({ id, ...restProps }: any) => {
    if (id === "deleteButton") {
      return <AppointmentForm.CommandButton id={id} {...restProps} />;
    }
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
        locale={"ua-Uk"}
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
