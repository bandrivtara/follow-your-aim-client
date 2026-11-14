import {
  collection,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import dayjs from "dayjs";
import habitsConfig from "config/habitsIds.json";
import { buildDailyReviewHabitCompletion } from "share/functions/dailyReviewCompletion";
import { IDailyReviewMonth, IUpdateDailyReview } from "types/dailyReview.types";
import { api, db } from "../api";

export const dailyReviewsFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDailyReviewMonth: builder.query<IDailyReviewMonth, string>({
      async queryFn(monthId) {
        try {
          const reviewSnapshot = await getDoc(doc(db, "dailyReview", monthId));
          return {
            data: reviewSnapshot.exists()
              ? ({
                  id: reviewSnapshot.id,
                  ...reviewSnapshot.data(),
                } as IDailyReviewMonth)
              : { unix: dayjs(monthId).unix() },
          };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["DailyReview"],
    }),
    getDailyReviewsBetweenDates: builder.query<
      IDailyReviewMonth[],
      [number, number]
    >({
      async queryFn([dateFrom, dateTo]) {
        try {
          const reviewQuery = query(
            collection(db, "dailyReview"),
            where("unix", ">=", dateFrom),
            where("unix", "<=", dateTo),
          );
          const reviewSnapshot = await getDocs(reviewQuery);
          return {
            data: reviewSnapshot.docs.map((reviewDocument) => ({
              id: reviewDocument.id,
              ...reviewDocument.data(),
            })) as IDailyReviewMonth[],
          };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["DailyReview"],
    }),
    updateDailyReview: builder.mutation<null, IUpdateDailyReview>({
      async queryFn({ monthId, day, data }) {
        try {
          const batch = writeBatch(db);
          const dailyReviewRef = doc(db, "dailyReview", monthId);
          const historyRef = doc(db, "history", monthId);
          const habitId = habitsConfig.habits.dailyReview.details;

          batch.set(
            dailyReviewRef,
            {
              unix: dayjs(monthId).unix(),
              [day]: data,
            },
            { mergeFields: ["unix", new FieldPath(day)] },
          );
          batch.set(
            historyRef,
            {
              unix: dayjs(monthId).unix(),
              [day]: {
                [habitId]: buildDailyReviewHabitCompletion(habitId),
              },
            },
            {
              mergeFields: ["unix", new FieldPath(day, habitId)],
            },
          );
          await batch.commit();
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["DailyReview", "History"],
    }),
  }),
});

export const {
  useGetDailyReviewMonthQuery,
  useGetDailyReviewsBetweenDatesQuery,
  useUpdateDailyReviewMutation,
} = dailyReviewsFirestoreApi;
