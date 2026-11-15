export type NutritionMealStatus = "pending" | "eaten" | "skipped";
export type NutritionSchemaVersion = "fya-nutrition-v1" | "fya-nutrition-v2";

export interface INutritionMeal {
  id: string;
  title: string;
  time: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  saturatedFat?: number;
  portionDescription?: string;
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
  portionDescription?: string;
  batchIngredients?: string[];
}

export interface INutritionSettings {
  calorieTarget: number;
  proteinTarget?: number;
  fatTarget?: number;
  carbsTarget?: number;
  fiberTarget?: number;
  saturatedFatTarget?: number;
  defaultMealTimes?: string[];
  approvedProducts?: string[];
  excludedProducts?: string[];
  candidateProducts?: string[];
  weighingRules?: string[];
  updatedAt?: number;
}

export interface INutritionPlanDay {
  date: string;
  meals: INutritionMeal[];
  note?: string;
}

export interface INutritionWeekPlan {
  id?: string;
  schemaVersion: NutritionSchemaVersion;
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
  schemaVersion: NutritionSchemaVersion;
  exportedAt?: string;
  settings: INutritionSettings;
  plan: INutritionWeekPlan;
}
