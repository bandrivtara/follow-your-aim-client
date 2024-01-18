import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import {
  IHabitCategory,
  IHabitCategoryData,
} from "../../types/habitsCategories.types";
import { api, db } from "../api";

export const habitsCategoriesFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHabitsCategoriesList: builder.query<IHabitCategoryData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "habitsCategories");
          const querySnapshot = await getDocs(ref);
          let habitsCategoriesList: IHabitCategoryData[] = [];
          querySnapshot?.forEach((doc) => {
            habitsCategoriesList.push({
              id: doc.id,
              ...doc.data(),
            } as IHabitCategoryData);
          });

          return { data: habitsCategoriesList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["HabitsCategories"],
    }),

    getCategory: builder.query({
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
              } as IHabitCategoryData,
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

    addCategory: builder.mutation({
      async queryFn(habitsCategoriesDetails: IHabitCategory) {
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
    updateCategory: builder.mutation({
      async queryFn(habitsCategoriesDetails) {
        try {
          console.log(habitsCategoriesDetails, 555);
          await updateDoc(
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
  useGetCategoryQuery,
  useGetHabitsCategoriesListQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} = habitsCategoriesFirestoreApi;
