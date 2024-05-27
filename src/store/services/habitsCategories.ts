import {
  collection,
  doc,
  getDocs,
  addDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  IHabitsCategory,
  IHabitsCategoryData,
} from "../../types/habitsCategories.types";
import { api, db } from "../api";

export const habitsCategoriesFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHabitsCategoriesList: builder.query<IHabitsCategoryData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "habitsCategories");
          const querySnapshot = await getDocs(ref);
          let habitsCategoriesList: IHabitsCategoryData[] = [];
          querySnapshot?.forEach((doc) => {
            habitsCategoriesList.push({
              id: doc.id,
              ...doc.data(),
            } as IHabitsCategoryData);
          });

          return { data: habitsCategoriesList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["HabitsCategories"],
    }),

    getHabitsCategory: builder.query({
      async queryFn(habitsCategoriesId) {
        try {
          const habitsCategoriesRef = doc(
            db,
            "habitsCategories",
            habitsCategoriesId
          );
          const habitsCategoriesSnapshot = await getDoc(habitsCategoriesRef);
          if (habitsCategoriesSnapshot.exists()) {
            return {
              data: {
                id: habitsCategoriesSnapshot.id,
                ...habitsCategoriesSnapshot.data(),
              } as IHabitsCategoryData,
            };
          }

          throw new Error("HabitsCategories not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["HabitsCategories"],
    }),

    addHabitsCategory: builder.mutation({
      async queryFn(habitsCategoriesDetails: IHabitsCategory) {
        try {
          await addDoc(
            collection(db, "habitsCategories"),
            habitsCategoriesDetails
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["HabitsCategories"],
    }),
    updateHabitsCategory: builder.mutation({
      async queryFn(habitsCategoriesDetails) {
        try {
          await setDoc(
            doc(db, "habitsCategories", habitsCategoriesDetails.id),
            habitsCategoriesDetails.data
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["HabitsCategories"],
    }),
  }),
});

export const {
  useGetHabitsCategoryQuery,
  useGetHabitsCategoriesListQuery,
  useAddHabitsCategoryMutation,
  useUpdateHabitsCategoryMutation,
} = habitsCategoriesFirestoreApi;
