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

      history.data.forEach((dayData) => {
        dayData.data.forEach((activity) => {
          if (activity.type === "habit") {
            const currentHabit = habits.data?.find(
              (habit) => habit.id === activity.id
            );

            const parsedDate = dayjs(dayData.date);
            const year = parsedDate.year();
            const month = parsedDate.month(); // Adding 1 because months are zero-based
            const day = parsedDate.date();

            const appointment = {
              title: currentHabit.title,
              startDate: new Date(year, month, day, 0, 0),
              endDate: new Date(year, month, day + 1, 1, 0),
              id: dayData.date + activity.id,
              location: "Room 1",
            };

            if (activity.scheduleTime[0]) {
              appointment.startDate = new Date(
                year,
                month,
                day,
                +activity.scheduleTime[0],
                +activity.scheduleTime[1]
              );
              appointment.endDate = new Date(
                year,
                month,
                day,
                +activity.scheduleTime[0],
                +activity.scheduleTime[1] + 30
              );
            }

            newAppointments.push(appointment);
          }
        });
      });

      console.log(newAppointments);
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
