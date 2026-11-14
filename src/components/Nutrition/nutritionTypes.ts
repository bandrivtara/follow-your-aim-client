export interface NutritionTargets {
  calories: number;
  protein: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  saturatedFat?: number;
}

export type NutritionMealStatus = "pending" | "eaten" | "skipped";

export interface NutritionMeal {
  id: string;
  title: string;
  time: string;
  calories: number;
  protein: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  description?: string;
  recipeId?: string;
  status: NutritionMealStatus;
  failureReason?: string;
}

export interface NutritionDay {
  date: string;
  note?: string;
  meals: NutritionMeal[];
}

export interface NutritionRecipe {
  id: string;
  title: string;
  portions: number;
  caloriesPerPortion?: number;
  activeMinutes?: number;
  totalMinutes?: number;
  equipment?: string[];
  ingredients: string[];
  steps: string[];
  storage?: string[];
  prepNotes?: string[];
}

export interface NutritionShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  estimatedPrice?: number;
  checked: boolean;
}

export interface NutritionShoppingTrip {
  id: string;
  title: string;
  plannedDate?: string;
  store?: string;
  items: NutritionShoppingItem[];
}

export interface NutritionWeek {
  schemaVersion: "fya-nutrition-v1" | "fya-nutrition-v2";
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  importedAt: string;
  targets: NutritionTargets;
  approvedProducts: string[];
  excludedProducts: string[];
  candidateProducts: string[];
  days: NutritionDay[];
  recipes: NutritionRecipe[];
  shoppingTrips: NutritionShoppingTrip[];
}

export interface StoredNutritionWeek extends NutritionWeek {
  id: string;
  updatedAt: number;
}
