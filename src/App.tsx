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

const App = () => {
  const currentId = "03-2024";
  const history = useGetHistoryQuery(currentId);
  const habitsList = useGetHabitListQuery();
  const taskGroups = useGetTaskGroupListQuery();
  const [updateHistory] = useUpdateHistoryMutation();
  const [isUpdated, setIsUpdated] = useState(false);

  // useEffect(() => {
  const update = async () => {
    let newHistory = {};
    if (!history?.data) return;
    for (const [day, activityItem] of Object.entries(history.data)) {
      for (const [activityId, activityValue] of Object.entries(activityItem)) {
        const newActivity = {
          id: activityId,
          ...activityValue,
          ...activityValue.details,
        };
        delete newActivity.details;

        const dayDocRef = doc(
          db,
          "history",
          `${currentId.split("-")[1]}-${currentId.split("-")[0]}-${day
            .toString()
            .padStart(2, "0")}`
        );
        console.log(
          `${currentId.split("-")[1]}-${currentId.split("-")[0]}-${day
            .toString()
            .padStart(2, "0")}`
        );
        await setDoc(dayDocRef, {
          day: +day,
          month: +currentId.split("-")[0],
          year: +currentId.split("-")[1],
          unix: dayjs(
            `${currentId.split("-")[1]}-${currentId.split("-")[0]}-${day
              .toString()
              .padStart(2, "0")}`
          ).unix(),
        });

        const subcollectionRef = collection(dayDocRef, "activities");
        const specificDocRef = doc(subcollectionRef, activityId);

        // Add a document to the subcollection
        await setDoc(specificDocRef, newActivity);

        // const newItem = {
        //   id: activityId,
        //   day: +day,
        //   ...activityValue,
        //   ...activityValue.details,
        // };
        // delete newItem.details;
        // newHistory.push({
        //   docName: day + "/" + currentId.replace("-", "/"),
        // });
        // if (activityValue) {
        //   const newHistoryItem =
        //     activityValue.details.type === "taskGroups"
        //       ? {
        //           ...activityValue,
        //           details: { type: "tasksGroup", valueType: "todoList" },
        //         }
        //       : activityValue;
        //   if (newHistory[day]) {
        //     newHistory[day][activityId] = newHistoryItem;
        //   } else {
        //     newHistory[day] = {
        //       [activityId]: newHistoryItem,
        //     };
        //   }
        //   const activityData = habitsList.data.find(
        //     (habit) => habit.id === activityId
        //   );
        //   const getMeasures = () => {
        //     const newMeasures = {};
        //     if (activityValue.plannedValues) {
        //       for (const [measureId, measureValue] of Object.entries(
        //         activityValue.plannedValues
        //       )) {
        //         newMeasures[measureId] = { plannedValue: measureValue };
        //       }
        //     }
        //     if (activityValue.values) {
        //       for (const [measureId, measureValue] of Object.entries(
        //         activityValue.values
        //       )) {
        //         newMeasures[measureId] = {
        //           ...newMeasures[measureId],
        //           value: measureValue,
        //         };
        //       }
        //     }
        //     return newMeasures;
        //   };
        //   const newHistoryItem = {
        //     details: {
        //       type: "habit",
        //       valueType:
        //         activityData?.valueType === "number"
        //           ? "measures"
        //           : activityData?.valueType,
        //       scheduleTime: activityData?.scheduleTime || "allDay",
        //     },
        //     measures: getMeasures(),
        //     status: "done",
        //     progress: 100,
        //   };
        //   if (newHistory[day]) {
        //     newHistory[day][activityId] = newHistoryItem;
        //   } else {
        //     newHistory[day] = {
        //       [activityId]: newHistoryItem,
        //     };
        //   }
        // } else if (activityValue.isPlanned || activityValue.isComplete) {
        //   const getStatus = () => {
        //     if (activityValue.isComplete) {
        //       return "done";
        //     } else if (activityValue.isPlanned && !activityValue.isComplete) {
        //       return "failed";
        //     } else if (activityValue.isPlanned) {
        //       return "pending";
        //     }
        //   };
        //   const activityData = habitsList.data.find(
        //     (habit) => habit.id === activityId
        //   );
        //   const newHistoryItem2 = {
        //     details: {
        //       type: "habit",
        //       valueType: activityData?.valueType,
        //       scheduleTime: activityData?.scheduleTime || "allDay",
        //     },
        //     status: getStatus(),
        //     progress: getStatus() === "done" ? 100 : 0,
        //     isPlanned: !!activityValue.isPlanned,
        //   };
        //   if (newHistory[day]) {
        //     newHistory[day][activityId] = newHistoryItem2;
        //   } else {
        //     newHistory[day] = {
        //       [activityId]: newHistoryItem2,
        //     };
        //   }
        // } else if (activityValue.tasks) {
        //   const getStatus = () => {
        //     const doneTasks = activityValue.tasks.filter(
        //       (task) => task.status === "done"
        //     );
        //     if (doneTasks.length === activityValue.tasks.length) {
        //       return "done";
        //     } else if (doneTasks.length < activityValue.tasks.length) {
        //       return "pending";
        //     }
        //   };
        //   const getProgress = () => {
        //     const doneTasks = activityValue.tasks.filter(
        //       (task) => task.status === "done"
        //     );
        //     return (
        //       (doneTasks.length / activityValue.tasks.length) *
        //       100
        //     ).toFixed(2);
        //   };
        //   const convertTasks = activityValue.tasks.map((task) => {
        //     const newTask = {
        //       title: task.title,
        //       status: task.status,
        //       scheduleTime: !!task.time[0] ? task.time : "allDay",
        //     };
        //     if (task.description) {
        //       newTask.description = task.description;
        //     }
        //     if (task.link) {
        //       newTask.link = task.link;
        //     }
        //     return newTask;
        //   });
        //   const newHistoryItem2 = {
        //     details: {
        //       type: "taskGroups",
        //     },
        //     tasks: convertTasks,
        //     status: getStatus(),
        //     progress: getProgress(),
        //   };
        //   if (newHistory[day]) {
        //     newHistory[day][activityId] = newHistoryItem2;
        //   } else {
        //     newHistory[day] = {
        //       [activityId]: newHistoryItem2,
        //     };
        //   }
        // }
      }
    }

    if (newHistory) {
      const habitToUpdate = {
        id: currentId,
        data: newHistory,
        path: ".",
      };
      setIsUpdated(true);
      console.log(newHistory);
      // await setDoc(doc(db, "history", currentId), newHistory);
    }
  };

  if (!isUpdated) {
    update();
  }
  // }, [habitsList, history, isUpdated, taskGroups, updateHistory]);

  const [data, setData] = useState([]);

  useEffect(() => {
    const queriesTest = async () => {
      // const citiesRef = collection(db, "history");
      // const q = query(citiesRef, where("day", ">", 4));
      // const querySnapshot = await getDocs(q);
      // querySnapshot.forEach(async (doc) => {
      //   const querySnapshot = await getDocs(
      //     collection(db, "history", doc.id, "activity")
      //   );
      //   const rangeData = [];
      //   querySnapshot.forEach((doc) => {
      //     rangeData.push(doc.data());
      //     console.log(doc.data());
      //   });
      //   console.log(rangeData);
      //   setData((prevValue) => [...prevValue, ...rangeData]);
      // });

      const startDate = "2024-01-06";
      const endDate = "2024-01-31";
      const result = generateMonthYearArray(startDate, endDate);
    };

    queriesTest();
  }, []);

  // useEffect(() => {
  //   console.log(data, 333);
  // }, [data]);

  // useEffect(() => {
  //   const addSubCollection = async () => {
  //     const frankDocRef = doc(db, "history", "06-01-2024");

  //     await setDoc(frankDocRef, {
  //       day: 6,
  //     });

  //     const subcollectionRef = collection(frankDocRef, "activity");
  //     const specificDocRef = doc(subcollectionRef, "activityId");

  //     // Add a document to the subcollection
  //     await setDoc(specificDocRef, {
  //       subcollectionData: { activitiid2: "new some data" },
  //     });
  //   };

  //   addSubCollection();
  // }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppRoutes />
    </LocalizationProvider>
  );
};

export default App;
