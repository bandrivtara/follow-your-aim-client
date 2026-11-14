import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import {
  NutritionWeek,
  StoredNutritionWeek,
} from "components/Nutrition/nutritionTypes";
import { api, db } from "../api";

export const nutritionWeeksFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNutritionWeeks: builder.query<StoredNutritionWeek[], void>({
      async queryFn() {
        try {
          const snapshot = await getDocs(collection(db, "nutritionWeek"));
          const weeks = snapshot.docs
            .map(
              (weekDocument) =>
                ({
                  id: weekDocument.id,
                  ...weekDocument.data(),
                }) as StoredNutritionWeek,
            )
            .sort((left, right) =>
              left.weekStart.localeCompare(right.weekStart),
            );
          return { data: weeks };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Не вдалося завантажити плани харчування.";
          return { error: message };
        }
      },
      providesTags: ["NutritionWeek"],
    }),
    saveNutritionWeek: builder.mutation<null, NutritionWeek>({
      async queryFn(week) {
        try {
          const documentData = Object.fromEntries(
            Object.entries(week).filter(
              ([key]) => key !== "id" && key !== "updatedAt",
            ),
          );
          await setDoc(doc(db, "nutritionWeek", week.weekStart), {
            ...documentData,
            updatedAt: Math.floor(Date.now() / 1000),
          });
          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Не вдалося зберегти план харчування.";
          return { error: message };
        }
      },
      invalidatesTags: ["NutritionWeek"],
    }),
  }),
});

export const { useGetNutritionWeeksQuery, useSaveNutritionWeekMutation } =
  nutritionWeeksFirestoreApi;
