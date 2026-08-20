export interface IDailyReview {
  date: string;
  mood: number;
  energy: number;
  answers: Record<string, string>;
  summary?: string;
  updatedAt: number;
}

export interface IDailyReviewMonth {
  id?: string;
  unix?: number;
  [day: string]: IDailyReview | number | string | undefined;
}

export interface IUpdateDailyReview {
  monthId: string;
  day: string;
  data: IDailyReview;
}
