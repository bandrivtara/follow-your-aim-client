import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { IHabitData } from "../../types/habits.types";
import { api, db } from "../api";

export const habitFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHabitList: builder.query<IHabitData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "habit");
          const querySnapshot = await getDocs(ref);
          let habitList: IHabitData[] = [];
          querySnapshot?.forEach((doc) => {
            habitList.push({
              id: doc.id,
              ...doc.data(),
            } as IHabitData);
          });

          return { data: habitList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Habit"],
    }),

    getHabit: builder.query({
      async queryFn(habitId) {
        try {
          const habitRef = doc(db, "habit", habitId);
          const habitSnapshot = await getDoc(habitRef);
          if (habitSnapshot.exists()) {
            return {
              data: {
                id: habitSnapshot.id,
                ...habitSnapshot.data(),
              } as IHabitData,
            };
          }

          throw new Error("Habit not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Habit"],
    }),

    addHabit: builder.mutation({
      async queryFn(habitDetails: IHabitData) {
        try {
          await addDoc(collection(db, "habit"), habitDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Habit"],
    }),
    updateHabit: builder.mutation({
      async queryFn(habitDetails) {
        try {
          await updateDoc(doc(db, "habit", habitDetails.id), habitDetails.data);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Habit"],
    }),
  }),
});

export const {
  useGetHabitQuery,
  useGetHabitListQuery,
  useAddHabitMutation,
  useUpdateHabitMutation,
} = habitFirestoreApi;
