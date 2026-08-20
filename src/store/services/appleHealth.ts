import { doc, getDoc, setDoc } from "firebase/firestore";
import habitsConfig from "config/habitsIds.json";
import { api, db } from "../api";

const activeCaloriesHabit = {
  title: "Активні калорії",
  description:
    "Активна енергія за день, синхронізована з Apple Health через Shortcuts.",
  type: "habit" as const,
  valueType: "measures" as const,
  lifeArea: "health" as const,
  complexity: 1,
  active: true,
  isHidden: false,
  isArchived: false,
  isAllDay: true,
  startTime: [],
  endTime: [],
  fields: [
    {
      id: habitsConfig.habits.activeCalories.measure,
      name: "Активна енергія",
      unit: "ккал",
      minToComplete: habitsConfig.habits.activeCalories.target,
      orderIndex: 0,
    },
  ],
};

export const appleHealthFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    ensureAppleHealthCaloriesHabit: builder.mutation<
      { created: boolean },
      void
    >({
      async queryFn() {
        try {
          const habitRef = doc(
            db,
            "habit",
            habitsConfig.habits.activeCalories.details,
          );
          const habitSnapshot = await getDoc(habitRef);

          if (habitSnapshot.exists()) return { data: { created: false } };

          await setDoc(habitRef, activeCaloriesHabit);
          return { data: { created: true } };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Habit"],
    }),
  }),
});

export const { useEnsureAppleHealthCaloriesHabitMutation } =
  appleHealthFirestoreApi;
