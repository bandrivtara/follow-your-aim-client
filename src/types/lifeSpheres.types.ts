export interface ISphereData extends ILifeSphere {
  id: string;
}

export interface ILifeSphere {
  id: string;
  title: string;
  description: string;
  relatedActivities: string[];
  relatedAims: string[];
}
