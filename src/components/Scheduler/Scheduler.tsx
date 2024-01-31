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
} from "@devexpress/dx-react-scheduler-material-ui";
import { appointments } from "./appointments";
import { memo, useCallback, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { db } from "store/api";
import { doc, getDoc } from "firebase/firestore";

const PREFIX = "Scheduler";
// #FOLD_BLOCK
export const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  formControlLabel: `${PREFIX}-formControlLabel`,
};

const Scheduler = () => {
  const [data, setData] = useState(appointments);
  const [currentDay, setCurrentDay] = useState<Dayjs | null>(dayjs());
  const [addedAppointment, setAddedAppointment] = useState({});
  const [isAppointmentBeingCreated, setIsAppointmentBeingCreated] =
    useState(false);

  useEffect(() => {
    const getHistoryData = async () => {
      if (!currentDay) return;
      const weekStart = currentDay.startOf("week");
      const weekEnd = currentDay.endOf("week");
      const startMonth = weekStart.month();
      const endMonth = weekEnd.month();

      if (startMonth !== endMonth) {
        const docRef = doc(db, "history", weekStart.format("MM-YYYY"));
        const docSnap = await getDoc(docRef);
      } else {
      }
    };

    getHistoryData();
  }, [currentDay]);

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
