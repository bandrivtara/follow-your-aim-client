import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  documentId,
  or,
} from "firebase/firestore";
import { IHistoryData } from "types/history.types";
import { api, db } from "../api";
import dayjs, { Dayjs } from "dayjs";
import { generateDaysArray } from "share/functions/generateDaysArray";

export const historyFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHistoryList: builder.query<IHistoryData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "history");
          const querySnapshot = await getDocs(ref);
          let historyList: IHistoryData[] = [];
          querySnapshot?.forEach((doc) => {
            historyList.push({
              ...doc.data(),
            } as IHistoryData);
          });

          return { data: historyList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["History"],
    }),

    getHistory: builder.query({
      async queryFn(historyId) {
        try {
          const historyRef = doc(db, "history", historyId);
          const historySnapshot = await getDoc(historyRef);
          if (historySnapshot.exists()) {
            return {
              data: {
                ...historySnapshot.data(),
              } as IHistoryData,
            };
          }
          // throw new Error("History not found");
          return { data: {} };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["History"],
    }),
    getHistoryBetweenDates: builder.query({
      async queryFn(dates: number[]) {
        try {
          const [dateFrom, dateTo] = dates;
          if (!dateFrom || !dateTo) return;

          // const allDays = generateDaysArray(dates[0], dates[1]);
          const dateRef = collection(db, "history");
          const dateQuery = query(
            dateRef,
            where("unix", ">=", dateFrom),
            where("unix", "<=", dateTo)
          );
          const dateQuerySnapshot = await getDocs(dateQuery);

          const datesData: any = [];

          await Promise.all(
            dateQuerySnapshot.docs.map(async (doc) => {
              const querySnapshot = await getDocs(
                collection(db, "history", doc.id, "activities")
              );

              const rangeData: any = [];
              querySnapshot.forEach((doc) => {
                rangeData.push(doc.data());
              });

              datesData.push({ date: doc.id, data: rangeData });
            })
          );

          return { data: datesData };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["History"],
    }),
    updateHistory: builder.mutation({
      async queryFn(history) {
        try {
          // const historyRef = doc(db, "history", history.id);
          // const historySnapshot = await getDoc(historyRef);
          // const isCurrentMonthExists = historySnapshot.exists();
          // if (!isCurrentMonthExists) {
          //   await setDoc(doc(db, "history", history.id), {});
          // }
          // await updateDoc(historyRef, {
          //   [history.path]: history.data,
          // });

          const historyRef = doc(db, "history", history.id);
          const [year, month, day] = history.id.split("-");
          await setDoc(historyRef, {
            day,
            month,
            year,
            unix: dayjs(history.id).unix(),
          });
          const subCollectionRef = collection(historyRef, "activities");

          const specificDocRef = doc(subCollectionRef, history.data.id);
          await setDoc(specificDocRef, history.data);

          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["History"],
    }),
  }),
});

export const {
  useGetHistoryQuery,
  useGetHistoryListQuery,
  useUpdateHistoryMutation,
  useGetHistoryBetweenDatesQuery,
} = historyFirestoreApi;
