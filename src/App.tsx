import { useEffect } from "react";
import AppRoutes from "./components/Routes";
import { currentActivities } from "config/activities.NOT_DELETE";
import { useAddHabitMutation } from "store/services/habits";
import { useAddHistoryMutation } from "store/services/history";

const App = () => {
  const [addHistory] = useAddHistoryMutation();

  // useEffect(() => {
  //   const uploadData = async () => {
  //     function convertToObjectArray(inputObject) {
  //       const result = {};

  //       for (const activity of inputObject) {
  //         const id = activity.id;
  //         const history = activity.history;

  //         for (const year in history) {
  //           for (const month in history[year]) {
  //             for (const day in history[year][month]) {
  //               const dateKey = `${month}-${year}`;
  //               const valueData = history[year][month][day];

  //               if (!result[dateKey]) {
  //                 result[dateKey] = {};
  //               }

  //               if (!result[dateKey][day]) {
  //                 result[dateKey][day] = [];
  //               }

  //               const formattedObject = {
  //                 id: id,
  //                 ...valueData,
  //               };

  //               result[dateKey][day].push(formattedObject);
  //             }
  //           }
  //         }
  //       }

  //       return result;
  //     }
  //     // Example usage:

  //     const resultArray = convertToObjectArray(currentActivities);
  //     var result = Object.keys(resultArray).map((key) => ({
  //       id: key,
  //       ...resultArray[key],
  //     }));

  //     await Promise.all(
  //       result.map(async (history) => {
  //         await addHistory(history);
  //       })
  //     );

  //     console.log(result);
  //   };
  //   uploadData();
  // }, []);

  return <AppRoutes />;
};

export default App;
