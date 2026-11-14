export type NutritionMealStatus = "pending" | "eaten" | "skipped";

export interface INutritionMeal {
  id: string;
  title: string;
  time: string;
  calories: number;
  protein?: number;
  description?: string;
  recipeId?: string;
  status?: NutritionMealStatus;
  skippedReason?: string;
  comment?: string;
}

export interface INutritionRecipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  portions?: number;
  caloriesPerPortion?: number;
}

export interface INutritionSettings {
  calorieTarget: number;
  proteinTarget?: number;
  fiberTarget?: number;
  saturatedFatTarget?: number;
  defaultMealTimes?: string[];
  approvedProducts?: string[];
  excludedProducts?: string[];
  candidateProducts?: string[];
  updatedAt?: number;
}

export interface INutritionPlanDay {
  date: string;
  meals: INutritionMeal[];
  note?: string;
}

export interface INutritionWeekPlan {
  id?: string;
  schemaVersion: "fya-nutrition-v1";
  weekStart: string;
  weekEnd: string;
  days: INutritionPlanDay[];
  recipes: INutritionRecipe[];
  generatedAt?: string;
  updatedAt?: number;
}

export interface INutritionDayLog {
  id?: string;
  date: string;
  targetCalories: number;
  meals: INutritionMeal[];
  dailyComment?: string;
  consumedCalories?: number;
  consumedProtein?: number;
  finalizedAt?: number;
  syncedToHistoryAt?: number;
  updatedAt?: number;
}

export interface INutritionImportBundle {
  schemaVersion: "fya-nutrition-v1";
  exportedAt?: string;
  settings: INutritionSettings;
  plan: INutritionWeekPlan;
}
