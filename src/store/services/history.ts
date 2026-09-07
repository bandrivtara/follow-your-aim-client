// @ts-nocheck
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { IHistoryData } from "types/history.types";
import { api, db } from "../api";
import dayjs from "dayjs";

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
              id: doc.id,
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
          const dateRef = collection(db, "history");
          const dateQuery = query(
            dateRef,
            where("unix", ">=", dateFrom),
            where("unix", "<=", dateTo)
          );
          const dateQuerySnapshot = await getDocs(dateQuery);

          let historyList: IHistoryData[] = [];
          dateQuerySnapshot?.forEach((doc) => {
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
    updateHistory: builder.mutation({
      async queryFn(history) {
        try {
          const historyRef = doc(db, "history", history.id);
          const historySnapshot = await getDoc(historyRef);
          const isCurrentMonthExists = historySnapshot.exists();
          if (!isCurrentMonthExists) {
            await setDoc(doc(db, "history", history.id), {});
          }
          await updateDoc(historyRef, {
            unix: dayjs(history.id).unix(),
            [history.path]: history.data,
          });
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["History"],
    }),
    updateHistoryEntries: builder.mutation({
      async queryFn(entries) {
        try {
          const groupedEntries = entries.reduce((result, entry) => {
            result[entry.id] = result[entry.id] || [];
            result[entry.id].push(entry);
            return result;
          }, {});
          const batch = writeBatch(db);

          for (const [historyId, historyEntries] of Object.entries(
            groupedEntries,
          )) {
            const historyRef = doc(db, "history", historyId);
            const historySnapshot = await getDoc(historyRef);
            if (historySnapshot.exists()) {
              const update = { unix: dayjs(historyId).unix() };
              historyEntries.forEach((entry) => {
                update[entry.path] = entry.data;
              });
              batch.update(historyRef, update);
            } else {
              const documentData = { unix: dayjs(historyId).unix() };
              historyEntries.forEach((entry) => {
                const [dayId, activityId] = entry.path.split(".");
                documentData[dayId] = documentData[dayId] || {};
                documentData[dayId][activityId] = entry.data;
              });
              batch.set(historyRef, documentData);
            }
          }

          await batch.commit();
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
  useUpdateHistoryEntriesMutation,
  useGetHistoryBetweenDatesQuery,
} = historyFirestoreApi;
