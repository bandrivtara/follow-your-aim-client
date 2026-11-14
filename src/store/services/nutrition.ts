import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { api, db } from "../api";
import {
  INutritionDayLog,
  INutritionImportBundle,
  INutritionSettings,
  INutritionWeekPlan,
} from "types/nutrition.types";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Невідома помилка Firebase";

const withoutUndefined = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

export const nutritionFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNutritionSettings: builder.query<INutritionSettings | null, void>({
      async queryFn() {
        try {
          const snapshot = await getDoc(doc(db, "nutritionSettings", "main"));
          return { data: snapshot.exists() ? (snapshot.data() as INutritionSettings) : null };
        } catch (error) {
          return { error: errorMessage(error) };
        }
      },
      providesTags: ["Nutrition"],
    }),
    getNutritionPlan: builder.query<INutritionWeekPlan | null, string>({
      async queryFn(weekStart) {
        try {
          const snapshot = await getDoc(doc(db, "nutritionPlan", weekStart));
          return {
            data: snapshot.exists()
              ? ({ id: snapshot.id, ...snapshot.data() } as INutritionWeekPlan)
              : null,
          };
        } catch (error) {
          return { error: errorMessage(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Nutrition", id }],
    }),
    getNutritionDay: builder.query<INutritionDayLog | null, string>({
      async queryFn(date) {
        try {
          const snapshot = await getDoc(doc(db, "nutritionDay", date));
          return {
            data: snapshot.exists()
              ? ({ id: snapshot.id, ...snapshot.data() } as INutritionDayLog)
              : null,
          };
        } catch (error) {
          return { error: errorMessage(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Nutrition", id }],
    }),
    getNutritionDaysBetween: builder.query<
      INutritionDayLog[],
      { dateFrom: string; dateTo: string }
    >({
      async queryFn({ dateFrom, dateTo }) {
        try {
          const snapshot = await getDocs(
            query(
              collection(db, "nutritionDay"),
              where("date", ">=", dateFrom),
              where("date", "<=", dateTo),
            ),
          );
          return {
            data: snapshot.docs.map(
              (item) => ({ id: item.id, ...item.data() }) as INutritionDayLog,
            ),
          };
        } catch (error) {
          return { error: errorMessage(error) };
        }
      },
      providesTags: ["Nutrition"],
    }),
    saveNutritionDay: builder.mutation<null, INutritionDayLog>({
      async queryFn(day) {
        try {
          const dayData = { ...day };
          delete dayData.id;
          await setDoc(
            doc(db, "nutritionDay", day.date),
            withoutUndefined({
              ...dayData,
              updatedAt: Math.floor(Date.now() / 1000),
            }),
            { merge: true },
          );
          return { data: null };
        } catch (error) {
          return { error: errorMessage(error) };
        }
      },
      invalidatesTags: (_result, _error, day) => [
        "Nutrition",
        { type: "Nutrition", id: day.date },
      ],
    }),
    importNutritionBundle: builder.mutation<null, INutritionImportBundle>({
      async queryFn(bundle) {
        try {
          const timestamp = Math.floor(Date.now() / 1000);
          const batch = writeBatch(db);
          batch.set(
            doc(db, "nutritionSettings", "main"),
            withoutUndefined({ ...bundle.settings, updatedAt: timestamp }),
            { merge: true },
          );
          batch.set(
            doc(db, "nutritionPlan", bundle.plan.weekStart),
            withoutUndefined({ ...bundle.plan, updatedAt: timestamp }),
            { merge: true },
          );
          await batch.commit();
          return { data: null };
        } catch (error) {
          return { error: errorMessage(error) };
        }
      },
      invalidatesTags: ["Nutrition"],
    }),
  }),
});

export const {
  useGetNutritionSettingsQuery,
  useGetNutritionPlanQuery,
  useLazyGetNutritionPlanQuery,
  useGetNutritionDayQuery,
  useLazyGetNutritionDayQuery,
  useGetNutritionDaysBetweenQuery,
  useSaveNutritionDayMutation,
  useImportNutritionBundleMutation,
} = nutritionFirestoreApi;
