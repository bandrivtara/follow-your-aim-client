export interface IAimsCategoryData extends IAimsCategory {
  id: string;
}

export interface IAimsCategory {
  id: string;
  title: string;
  description: string;
  relatedHabits: string[];
  relatedAims: string[];
}
