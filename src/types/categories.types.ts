export interface ICategoryData extends ICategory {
  id: string;
}

export interface ICategory {
  id: string;
  title: string;
  description: string;
  relatedHabits: string[];
  relatedAims: string[];
}
