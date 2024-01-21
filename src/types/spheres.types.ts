export interface ISphereData extends ISphere {
  id: string;
}

export interface ISphere {
  id: string;
  title: string;
  description: string;
  relatedHabits: string[];
  relatedAims: string[];
}
