import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { IHistoryData, IHistoryDay } from "types/history.types";
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
                id: historySnapshot.id,
                ...historySnapshot.data(),
              } as IHistoryData,
            };
          }

          throw new Error("History not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["History"],
    }),

    addHistory: builder.mutation({
      async queryFn(historyDetails: IHistoryDay) {
        try {
          await addDoc(collection(db, "history"), historyDetails);

          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["History"],
    }),
    updateHistory: builder.mutation({
      async queryFn(historyDetails) {
        try {
          await updateDoc(
            doc(db, "history", historyDetails.id),
            historyDetails.data
          );
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
  useAddHistoryMutation,
  useUpdateHistoryMutation,
} = historyFirestoreApi;


