export interface IHabitsCategoryData extends IHabitsCategory {
  id: string;
}

export interface IHabitsCategory {
  id: string;
  title: string;
  description: string;
  relatedHabits: string[];
}
