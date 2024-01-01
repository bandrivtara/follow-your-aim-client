import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { IHistoryData } from "types/history.types";
import { api, db } from "../api";

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
  }),
});

export const {
  useGetHistoryQuery,
  useGetHistoryListQuery,
  useUpdateHistoryMutation,
} = historyFirestoreApi;
