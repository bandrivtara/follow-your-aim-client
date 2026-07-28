import { IHabitData, IHabitValueTypes } from "types/habits.types";

const habitValueTypes: IHabitValueTypes[] = ["boolean", "measures"];

export const isHabitData = (
  value: unknown,
): value is Omit<IHabitData, "id"> => {
  if (!value || typeof value !== "object") return false;

  const habit = value as Partial<IHabitData>;
  return (
    typeof habit.title === "string" &&
    habit.title.trim().length > 0 &&
    habit.type === "habit" &&
    !!habit.valueType &&
    habitValueTypes.includes(habit.valueType)
  );
};
