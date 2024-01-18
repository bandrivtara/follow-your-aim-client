export interface IHabitCategoryData extends IHabitCategory {
  id: string;
}

export interface IHabitCategory {
  id: string;
  title: string;
  description: string;
  relatedHabits: string[];
  relatedAims: string[];
}
