import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import AppRoutes from "./components/Routes";
import { useEffect, useState } from "react";
import { useGetHabitListQuery } from "store/services/habits";
import {
  useGetHistoryBetweenDatesQuery,
  useGetHistoryQuery,
  useUpdateHistoryMutation,
} from "store/services/history";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { db } from "store/api";
import { habitData } from "reserve";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { generateMonthYearArray } from "share/functions/generateMonthYearArray";
import {
  date2023_09,
  date2023_10,
  date2023_11,
  date2023_12,
  date2024_01,
} from "mockHistory";

const history = { data: date2023_10, id: "2023-10" };
const toDelete = ["O0V3t6xqZBk5Wfo1LuTn", "uxrC7xQocaTqRdB4B1lA"];
const App = () => {
  // const currentId = "01-2024";

  // const habitsList = useGetHabitListQuery();
  // const taskGroups = useGetTaskGroupListQuery();
  // const [updateHistory] = useUpdateHistoryMutation();
  // const [isUpdated, setIsUpdated] = useState(false);

  // useEffect(() => {
  //   const update = async () => {
  //     let newHistory = {
  //       unix: dayjs(history.id).unix(),
  //     };

  //     if (!history?.data || !habitsList.data) return;

  //     for (const [day, activityItem] of Object.entries(history.data)) {
  //       for (const [activityId, activityValue] of Object.entries(
  //         activityItem
  //       )) {
  //         if (toDelete.includes(activityId) || !activityValue?.details?.type) {
  //         } else {
  //           const newActivity = {
  //             id: activityId,
  //             ...activityValue,
  //             ...activityValue.details,
  //           };

  //           if (activityValue.details.type === "habit") {
  //             const currentHabit = habitsList.data.find(
  //               (habit) => habit.id === activityId
  //             );
  //             newActivity.unix = dayjs(history.id + "-" + day).unix();

  //             if (currentHabit.isAllDay) {
  //               newActivity.isAllDay = true;
  //             } else {
  //               newActivity.isAllDay = false;
  //               newActivity.startTime = currentHabit.startTime;
  //               newActivity.endTime = currentHabit.endTime;
  //             }
  //             delete newActivity.scheduleTime;
  //           } else {
  //             newActivity.tasks = activityValue.tasks.map((task) => {
  //               const { scheduleTime, ...rest } = task; // Destructure oldKey1 and capture the rest of the object
  //               return { isAllDay: true, ...rest }; // Create a new object with the desired key name
  //             });
  //           }
  //           delete newActivity.details;
  //           newActivity.progress = Number(activityValue.progress);

  //           if (newHistory[day]) {
  //             newHistory[day][activityId] = newActivity;
  //           } else {
  //             console.log(day);
  //             newHistory[day] = { [activityId]: newActivity };
  //           }
  //         }
  //         // Add a document to the subcollection
  //         // await setDoc(specificDocRef, newActivity);
  //       }
  //     }
  //     console.log(newHistory, 444);
  //     await setDoc(doc(db, "history", history.id), newHistory);
  //     setIsUpdated(true);
  //   };

  //   if (!isUpdated) {
  //     update();
  //   }
  // }, [habitsList, isUpdated, taskGroups, updateHistory]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppRoutes />
    </LocalizationProvider>
  );
};

export default App;
